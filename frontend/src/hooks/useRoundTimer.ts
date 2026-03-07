import { useRef, useCallback, useEffect } from 'react';
import { COUNTDOWN_COLORS, NUMERIC_TIMER_MS, COMPETITIVE_MAX_POINTS, COMPETITIVE_MIN_POINTS } from '../constants/scoring';

export interface UseRoundTimerReturn {
  /** Ref to attach to the display element. The timer writes countdown text directly to textContent. */
  displayRef: React.RefObject<HTMLElement | null>;
  /** Ref to attach to the bar fill element. The timer writes width + backgroundColor directly. */
  barRef: React.RefObject<HTMLDivElement | null>;
  /** Ref to attach to the point label element. Competitive mode writes point value here. */
  pointLabelRef: React.RefObject<HTMLElement | null>;
  /** Start the timer. Records performance.now() as the start time. */
  start: () => void;
  /** Stop the timer and return elapsed milliseconds since start(). */
  stop: () => number;
  /** Reset the timer. Stops rAF loop and sets display to initial countdown, bar to full width + green. */
  reset: () => void;
  /** Update the timer duration for the next round. */
  setDuration: (ms: number) => void;
}

/**
 * Determine countdown bar color based on percentage of time elapsed.
 * Uses proportional thresholds: green (<40%), lightGreen (40-60%), orange (60-80%), red (≥80%).
 */
function getBarColor(elapsedMs: number, timerDurationMs: number): string {
  const elapsedPercent = elapsedMs / timerDurationMs;
  if (elapsedPercent < 0.40) return COUNTDOWN_COLORS.green;
  if (elapsedPercent < 0.60) return COUNTDOWN_COLORS.lightGreen;
  if (elapsedPercent < 0.80) return COUNTDOWN_COLORS.orange;
  return COUNTDOWN_COLORS.red;
}

/**
 * Determine competitive countdown bar color using smooth HSL hue interpolation.
 * Hue transitions from 120 (green) → 0 (red) as time elapses.
 */
function getCompetitiveBarColor(elapsedMs: number, timerDurationMs: number): string {
  const fraction = Math.min(elapsedMs / timerDurationMs, 1);
  const hue = 120 * (1 - fraction);
  const saturation = 80 + 10 * fraction;
  const lightness = 33 + 12 * fraction;
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

/**
 * Calculate the current competitive point value for display.
 */
function getCompetitivePointValue(elapsedMs: number, timerDurationMs: number): number {
  const clamped = Math.min(elapsedMs, timerDurationMs);
  const fraction = clamped / timerDurationMs;
  const raw = COMPETITIVE_MAX_POINTS - (COMPETITIVE_MAX_POINTS - COMPETITIVE_MIN_POINTS) * fraction;
  return Math.max(COMPETITIVE_MIN_POINTS, Math.floor(raw));
}

/**
 * Tracks elapsed time for a single game round with countdown display.
 * Uses performance.now() for precise measurement and requestAnimationFrame
 * for smooth display updates without triggering React re-renders.
 *
 * @param reducedMotion When true, updates happen at 500ms discrete steps instead of every frame.
 * @param competitiveMode When true, uses smooth HSL color transition and writes point value label.
 */
export function useRoundTimer(reducedMotion?: boolean, competitiveMode?: boolean): UseRoundTimerReturn {
  const displayRef = useRef<HTMLElement | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);
  const pointLabelRef = useRef<HTMLElement | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const tickRef = useRef<() => void>(() => {});
  const durationRef = useRef<number>(NUMERIC_TIMER_MS);

  useEffect(() => {
    tickRef.current = () => {
      if (startTimeRef.current === null) return;

      const duration = durationRef.current;
      let elapsed = performance.now() - startTimeRef.current;

      // In reduced motion mode, snap to 500ms discrete steps
      if (reducedMotion) {
        elapsed = Math.floor(elapsed / 500) * 500;
      }

      // Clamp to countdown range
      const clampedElapsed = Math.min(elapsed, duration);
      const remaining = duration - clampedElapsed;
      const remainingSeconds = (remaining / 1000).toFixed(1);

      // Update countdown display (skip for competitive — timer text is hidden)
      if (!competitiveMode && displayRef.current) {
        displayRef.current.textContent = `${remainingSeconds}s`;
      }

      // Update bar width and color
      if (barRef.current) {
        const widthPercent = ((remaining / duration) * 100).toFixed(1);
        barRef.current.style.width = `${widthPercent}%`;
        barRef.current.style.backgroundColor = competitiveMode
          ? getCompetitiveBarColor(clampedElapsed, duration)
          : getBarColor(clampedElapsed, duration);

        // Update ARIA attributes for accessibility
        if (competitiveMode) {
          const pointValue = getCompetitivePointValue(clampedElapsed, duration);
          barRef.current.setAttribute('aria-valuenow', String(pointValue));
          barRef.current.setAttribute('aria-valuetext', `${pointValue} points available`);
        } else {
          barRef.current.setAttribute('aria-valuenow', remainingSeconds);
          barRef.current.setAttribute('aria-valuetext', `${remainingSeconds} seconds remaining`);
        }
      }

      // Update point value label for competitive mode
      if (competitiveMode && pointLabelRef.current) {
        const pointValue = getCompetitivePointValue(clampedElapsed, duration);
        pointLabelRef.current.textContent = String(pointValue);
      }

      rafIdRef.current = requestAnimationFrame(tickRef.current);
    };
  });

  const cancelRaf = useCallback(() => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
  }, []);

  const setDuration = useCallback((ms: number) => {
    durationRef.current = ms;
  }, []);

  const start = useCallback(() => {
    startTimeRef.current = performance.now();
    cancelRaf();
    rafIdRef.current = requestAnimationFrame(tickRef.current);
  }, [cancelRaf]);

  const stop = useCallback((): number => {
    cancelRaf();
    if (startTimeRef.current === null) return 0;
    const elapsed = performance.now() - startTimeRef.current;
    return elapsed;
  }, [cancelRaf]);

  const reset = useCallback(() => {
    cancelRaf();
    startTimeRef.current = null;
    const duration = durationRef.current;
    if (competitiveMode) {
      if (barRef.current) {
        barRef.current.style.width = '100%';
        barRef.current.style.backgroundColor = getCompetitiveBarColor(0, duration);
        barRef.current.setAttribute('aria-valuenow', String(COMPETITIVE_MAX_POINTS));
        barRef.current.setAttribute('aria-valuetext', `${COMPETITIVE_MAX_POINTS} points available`);
      }
      if (pointLabelRef.current) {
        pointLabelRef.current.textContent = String(COMPETITIVE_MAX_POINTS);
      }
    } else {
      const initialSeconds = (duration / 1000).toFixed(1);
      if (displayRef.current) {
        displayRef.current.textContent = `${initialSeconds}s`;
      }
      if (barRef.current) {
        barRef.current.style.width = '100%';
        barRef.current.style.backgroundColor = COUNTDOWN_COLORS.green;
        barRef.current.setAttribute('aria-valuenow', initialSeconds);
        barRef.current.setAttribute('aria-valuetext', `${initialSeconds} seconds remaining`);
      }
    }
  }, [cancelRaf, competitiveMode]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelRaf();
    };
  }, [cancelRaf]);

  return { displayRef, barRef, pointLabelRef, start, stop, reset, setDuration };
}

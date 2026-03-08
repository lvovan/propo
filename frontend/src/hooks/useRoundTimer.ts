import { useRef, useCallback, useEffect } from 'react';
import { NUMERIC_TIMER_MS, COMPETITIVE_MAX_POINTS, COMPETITIVE_MIN_POINTS } from '../constants/scoring';

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
  return Math.max(COMPETITIVE_MIN_POINTS, COMPETITIVE_MAX_POINTS - Math.floor((COMPETITIVE_MAX_POINTS - COMPETITIVE_MIN_POINTS) * fraction));
}

/**
 * Tracks elapsed time for a single game round with countdown display.
 * Uses performance.now() for precise measurement and requestAnimationFrame
 * for smooth display updates without triggering React re-renders.
 * All modes use linear point-decay display (10→1) with smooth HSL color gradient.
 *
 * @param reducedMotion When true, updates happen at 500ms discrete steps instead of every frame.
 */
export function useRoundTimer(reducedMotion?: boolean): UseRoundTimerReturn {
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

      // Update bar width and color
      if (barRef.current) {
        const widthPercent = ((remaining / duration) * 100).toFixed(1);
        barRef.current.style.width = `${widthPercent}%`;
        barRef.current.style.backgroundColor = getCompetitiveBarColor(clampedElapsed, duration);

        // Update ARIA attributes for accessibility
        const pointValue = getCompetitivePointValue(clampedElapsed, duration);
        barRef.current.setAttribute('aria-valuenow', String(pointValue));
        barRef.current.setAttribute('aria-valuetext', `${pointValue} points available`);
      }

      // Update point value label
      if (pointLabelRef.current) {
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
    if (barRef.current) {
      barRef.current.style.width = '100%';
      barRef.current.style.backgroundColor = getCompetitiveBarColor(0, duration);
      barRef.current.setAttribute('aria-valuenow', String(COMPETITIVE_MAX_POINTS));
      barRef.current.setAttribute('aria-valuetext', `${COMPETITIVE_MAX_POINTS} points available`);
    }
    if (pointLabelRef.current) {
      pointLabelRef.current.textContent = String(COMPETITIVE_MAX_POINTS);
    }
  }, [cancelRaf]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelRaf();
    };
  }, [cancelRaf]);

  return { displayRef, barRef, pointLabelRef, start, stop, reset, setDuration };
}

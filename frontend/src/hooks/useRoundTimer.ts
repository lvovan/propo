import { useRef, useCallback, useEffect } from 'react';
import { COUNTDOWN_COLORS, NUMERIC_TIMER_MS } from '../constants/scoring';

export interface UseRoundTimerReturn {
  /** Ref to attach to the display element. The timer writes countdown text directly to textContent. */
  displayRef: React.RefObject<HTMLElement | null>;
  /** Ref to attach to the bar fill element. The timer writes width + backgroundColor directly. */
  barRef: React.RefObject<HTMLDivElement | null>;
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
 * Tracks elapsed time for a single game round with countdown display.
 * Uses performance.now() for precise measurement and requestAnimationFrame
 * for smooth display updates without triggering React re-renders.
 *
 * @param reducedMotion When true, updates happen at 500ms discrete steps instead of every frame.
 */
export function useRoundTimer(reducedMotion?: boolean): UseRoundTimerReturn {
  const displayRef = useRef<HTMLElement | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);
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

      // Update countdown display
      if (displayRef.current) {
        displayRef.current.textContent = `${remainingSeconds}s`;
      }

      // Update bar width and color
      if (barRef.current) {
        const widthPercent = ((remaining / duration) * 100).toFixed(1);
        barRef.current.style.width = `${widthPercent}%`;
        barRef.current.style.backgroundColor = getBarColor(clampedElapsed, duration);

        // Update ARIA attributes for accessibility
        barRef.current.setAttribute('aria-valuenow', remainingSeconds);
        barRef.current.setAttribute('aria-valuetext', `${remainingSeconds} seconds remaining`);
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
  }, [cancelRaf]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelRaf();
    };
  }, [cancelRaf]);

  return { displayRef, barRef, start, stop, reset, setDuration };
}

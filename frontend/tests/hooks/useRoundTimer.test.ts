import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRoundTimer } from '../../src/hooks/useRoundTimer';
import { COUNTDOWN_COLORS } from '../../src/constants/scoring';

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgb(${r}, ${g}, ${b})`;
}

describe('useRoundTimer', () => {
  let mockNow: ReturnType<typeof vi.spyOn>;
  let originalRAF: typeof requestAnimationFrame;
  let originalCAF: typeof cancelAnimationFrame;
  let pendingCallbacks: Map<number, FrameRequestCallback>;
  let nextRafId: number;

  function flushRAF() {
    const entries = Array.from(pendingCallbacks.entries());
    if (entries.length === 0) return;
    const [id, cb] = entries[entries.length - 1];
    pendingCallbacks.delete(id);
    cb(performance.now());
  }

  beforeEach(() => {
    mockNow = vi.spyOn(performance, 'now');
    originalRAF = globalThis.requestAnimationFrame;
    originalCAF = globalThis.cancelAnimationFrame;
    nextRafId = 0;
    pendingCallbacks = new Map();
    globalThis.requestAnimationFrame = (cb: FrameRequestCallback) => {
      const id = ++nextRafId;
      pendingCallbacks.set(id, cb);
      return id;
    };
    globalThis.cancelAnimationFrame = (id: number) => {
      pendingCallbacks.delete(id);
    };
  });

  afterEach(() => {
    mockNow.mockRestore();
    globalThis.requestAnimationFrame = originalRAF;
    globalThis.cancelAnimationFrame = originalCAF;
  });

  it('start records performance.now as start time', () => {
    mockNow.mockReturnValue(1000);
    const { result } = renderHook(() => useRoundTimer());
    act(() => result.current.start());
    mockNow.mockReturnValue(1000);
    let elapsed = 0;
    act(() => { elapsed = result.current.stop(); });
    expect(elapsed).toBe(0);
  });

  it('stop returns elapsed ms since start', () => {
    mockNow.mockReturnValue(1000);
    const { result } = renderHook(() => useRoundTimer());
    act(() => result.current.start());
    mockNow.mockReturnValue(2500);
    let elapsed = 0;
    act(() => { elapsed = result.current.stop(); });
    expect(elapsed).toBe(1500);
  });

  it('reset clears timer state', () => {
    mockNow.mockReturnValue(1000);
    const { result } = renderHook(() => useRoundTimer());
    act(() => result.current.start());
    mockNow.mockReturnValue(2000);
    act(() => result.current.reset());
    mockNow.mockReturnValue(3000);
    let elapsed = 0;
    act(() => { elapsed = result.current.stop(); });
    expect(elapsed).toBe(0);
  });

  it('displayRef and barRef can be attached', () => {
    const { result } = renderHook(() => useRoundTimer());
    expect(result.current.displayRef).toBeDefined();
    expect(result.current.barRef).toBeDefined();
  });

  it('cleanup cancels rAF on unmount', () => {
    mockNow.mockReturnValue(1000);
    const cancelSpy = vi.spyOn(globalThis, 'cancelAnimationFrame');
    const { result, unmount } = renderHook(() => useRoundTimer());
    act(() => result.current.start());
    unmount();
    expect(cancelSpy).toHaveBeenCalled();
    cancelSpy.mockRestore();
  });

  describe('countdown display with 20s numeric timer', () => {
    it('reset sets display to "20.0s" for default duration', () => {
      const { result } = renderHook(() => useRoundTimer());
      const el = document.createElement('span');
      (result.current.displayRef as React.MutableRefObject<HTMLElement | null>).current = el;
      act(() => result.current.reset());
      expect(el.textContent).toBe('20.0s');
    });

    it('displays countdown toward 0.0s', () => {
      mockNow.mockReturnValue(1000);
      const { result } = renderHook(() => useRoundTimer());
      const el = document.createElement('span');
      (result.current.displayRef as React.MutableRefObject<HTMLElement | null>).current = el;
      act(() => result.current.start());
      mockNow.mockReturnValue(11000); // 10s elapsed, 10s remaining
      act(() => flushRAF());
      expect(el.textContent).toBe('10.0s');
    });

    it('countdown never goes below 0.0s', () => {
      mockNow.mockReturnValue(1000);
      const { result } = renderHook(() => useRoundTimer());
      const el = document.createElement('span');
      (result.current.displayRef as React.MutableRefObject<HTMLElement | null>).current = el;
      act(() => result.current.start());
      mockNow.mockReturnValue(30000);
      act(() => flushRAF());
      expect(el.textContent).toBe('0.0s');
    });
  });

  describe('dynamic duration with setDuration', () => {
    it('reset shows 50.0s when duration is set to 50000', () => {
      const { result } = renderHook(() => useRoundTimer());
      const el = document.createElement('span');
      (result.current.displayRef as React.MutableRefObject<HTMLElement | null>).current = el;
      act(() => result.current.setDuration(50000));
      act(() => result.current.reset());
      expect(el.textContent).toBe('50.0s');
    });

    it('50s timer shows 25.0s at 25s elapsed', () => {
      mockNow.mockReturnValue(1000);
      const { result } = renderHook(() => useRoundTimer());
      const el = document.createElement('span');
      (result.current.displayRef as React.MutableRefObject<HTMLElement | null>).current = el;
      act(() => result.current.setDuration(50000));
      act(() => result.current.start());
      mockNow.mockReturnValue(26000); // 25s elapsed
      act(() => flushRAF());
      expect(el.textContent).toBe('25.0s');
    });
  });

  describe('bar ref updates', () => {
    it('reset sets bar to full width and green', () => {
      const { result } = renderHook(() => useRoundTimer());
      const barEl = document.createElement('div');
      (result.current.barRef as React.MutableRefObject<HTMLDivElement | null>).current = barEl;
      act(() => result.current.reset());
      expect(barEl.style.width).toBe('100%');
      expect(barEl.style.backgroundColor).toBe(hexToRgb(COUNTDOWN_COLORS.green));
    });

    it('bar width decreases proportionally (50% at midpoint)', () => {
      mockNow.mockReturnValue(1000);
      const { result } = renderHook(() => useRoundTimer());
      const barEl = document.createElement('div');
      (result.current.barRef as React.MutableRefObject<HTMLDivElement | null>).current = barEl;
      act(() => result.current.start());
      mockNow.mockReturnValue(11000); // 10s elapsed = 50% of 20s
      act(() => flushRAF());
      expect(barEl.style.width).toBe('50%');
    });

    it('bar is 0% after timer expires', () => {
      mockNow.mockReturnValue(1000);
      const { result } = renderHook(() => useRoundTimer());
      const barEl = document.createElement('div');
      (result.current.barRef as React.MutableRefObject<HTMLDivElement | null>).current = barEl;
      act(() => result.current.start());
      mockNow.mockReturnValue(30000);
      act(() => flushRAF());
      expect(barEl.style.width).toBe('0%');
    });

    it('bar color green at <40% elapsed', () => {
      mockNow.mockReturnValue(1000);
      const { result } = renderHook(() => useRoundTimer());
      const barEl = document.createElement('div');
      (result.current.barRef as React.MutableRefObject<HTMLDivElement | null>).current = barEl;
      act(() => result.current.start());
      mockNow.mockReturnValue(5000); // 4s elapsed = 20% of 20s = green
      act(() => flushRAF());
      expect(barEl.style.backgroundColor).toBe(hexToRgb(COUNTDOWN_COLORS.green));
    });

    it('bar color lightGreen at 40-60% elapsed', () => {
      mockNow.mockReturnValue(1000);
      const { result } = renderHook(() => useRoundTimer());
      const barEl = document.createElement('div');
      (result.current.barRef as React.MutableRefObject<HTMLDivElement | null>).current = barEl;
      act(() => result.current.start());
      mockNow.mockReturnValue(11000); // 10s elapsed = 50% of 20s = lightGreen
      act(() => flushRAF());
      expect(barEl.style.backgroundColor).toBe(hexToRgb(COUNTDOWN_COLORS.lightGreen));
    });

    it('bar color orange at 60-80% elapsed', () => {
      mockNow.mockReturnValue(1000);
      const { result } = renderHook(() => useRoundTimer());
      const barEl = document.createElement('div');
      (result.current.barRef as React.MutableRefObject<HTMLDivElement | null>).current = barEl;
      act(() => result.current.start());
      mockNow.mockReturnValue(15000); // 14s elapsed = 70% of 20s = orange
      act(() => flushRAF());
      expect(barEl.style.backgroundColor).toBe(hexToRgb(COUNTDOWN_COLORS.orange));
    });

    it('bar color red at >=80% elapsed', () => {
      mockNow.mockReturnValue(1000);
      const { result } = renderHook(() => useRoundTimer());
      const barEl = document.createElement('div');
      (result.current.barRef as React.MutableRefObject<HTMLDivElement | null>).current = barEl;
      act(() => result.current.start());
      mockNow.mockReturnValue(18000); // 17s elapsed = 85% of 20s = red
      act(() => flushRAF());
      expect(barEl.style.backgroundColor).toBe(hexToRgb(COUNTDOWN_COLORS.red));
    });

    it('bar ARIA attributes updated with remaining time', () => {
      mockNow.mockReturnValue(1000);
      const { result } = renderHook(() => useRoundTimer());
      const barEl = document.createElement('div');
      (result.current.barRef as React.MutableRefObject<HTMLDivElement | null>).current = barEl;
      act(() => result.current.start());
      mockNow.mockReturnValue(11000); // 10s elapsed, 10s remaining
      act(() => flushRAF());
      expect(barEl.getAttribute('aria-valuenow')).toBe('10.0');
      expect(barEl.getAttribute('aria-valuetext')).toBe('10.0 seconds remaining');
    });
  });

  describe('freeze on stop', () => {
    it('bar and display freeze when stop is called', () => {
      mockNow.mockReturnValue(1000);
      const { result } = renderHook(() => useRoundTimer());
      const displayEl = document.createElement('span');
      const barEl = document.createElement('div');
      (result.current.displayRef as React.MutableRefObject<HTMLElement | null>).current = displayEl;
      (result.current.barRef as React.MutableRefObject<HTMLDivElement | null>).current = barEl;
      act(() => result.current.start());
      mockNow.mockReturnValue(2000);
      act(() => flushRAF());
      const frozenDisplay = displayEl.textContent;
      const frozenWidth = barEl.style.width;
      act(() => result.current.stop());
      mockNow.mockReturnValue(15000);
      act(() => flushRAF());
      expect(displayEl.textContent).toBe(frozenDisplay);
      expect(barEl.style.width).toBe(frozenWidth);
    });
  });

  describe('reduced motion', () => {
    it('updates in discrete steps when reducedMotion is true', () => {
      mockNow.mockReturnValue(1000);
      const { result } = renderHook(() => useRoundTimer(true));
      const barEl = document.createElement('div');
      (result.current.barRef as React.MutableRefObject<HTMLDivElement | null>).current = barEl;
      act(() => result.current.start());
      mockNow.mockReturnValue(1250);
      act(() => flushRAF());
      expect(barEl.style.width).toBe('100%'); // snaps to 0ms = 100%
      mockNow.mockReturnValue(1500);
      act(() => flushRAF());
      expect(barEl.style.width).toBe('97.5%'); // 500ms of 20000ms = 2.5% elapsed
    });
  });
});

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRoundTimer } from '../../src/hooks/useRoundTimer';

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

  it('displayRef, barRef, and pointLabelRef are defined', () => {
    const { result } = renderHook(() => useRoundTimer());
    expect(result.current.displayRef).toBeDefined();
    expect(result.current.barRef).toBeDefined();
    expect(result.current.pointLabelRef).toBeDefined();
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

  describe('refs available', () => {
    it('displayRef, barRef, and pointLabelRef can be attached', () => {
      const { result } = renderHook(() => useRoundTimer());
      expect(result.current.displayRef).toBeDefined();
      expect(result.current.barRef).toBeDefined();
      expect(result.current.pointLabelRef).toBeDefined();
    });
  });

  describe('bar ref updates', () => {
    it('reset sets bar to full width with a color', () => {
      const { result } = renderHook(() => useRoundTimer());
      const barEl = document.createElement('div');
      (result.current.barRef as React.MutableRefObject<HTMLDivElement | null>).current = barEl;
      act(() => result.current.reset());
      expect(barEl.style.width).toBe('100%');
      expect(barEl.style.backgroundColor).toBeTruthy();
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

    it('bar has color at start of round', () => {
      mockNow.mockReturnValue(1000);
      const { result } = renderHook(() => useRoundTimer());
      const barEl = document.createElement('div');
      (result.current.barRef as React.MutableRefObject<HTMLDivElement | null>).current = barEl;
      act(() => result.current.start());
      mockNow.mockReturnValue(5000); // 4s elapsed = 20% of 20s
      act(() => flushRAF());
      expect(barEl.style.backgroundColor).toBeTruthy();
    });

    it('bar color changes at midpoint', () => {
      mockNow.mockReturnValue(1000);
      const { result } = renderHook(() => useRoundTimer());
      const barEl = document.createElement('div');
      (result.current.barRef as React.MutableRefObject<HTMLDivElement | null>).current = barEl;
      act(() => result.current.start());
      mockNow.mockReturnValue(1001);
      act(() => flushRAF());
      const startColor = barEl.style.backgroundColor;
      mockNow.mockReturnValue(11000); // 10s elapsed = 50% of 20s
      act(() => flushRAF());
      expect(barEl.style.backgroundColor).not.toBe(startColor);
    });

    it('bar color changes toward end', () => {
      mockNow.mockReturnValue(1000);
      const { result } = renderHook(() => useRoundTimer());
      const barEl = document.createElement('div');
      (result.current.barRef as React.MutableRefObject<HTMLDivElement | null>).current = barEl;
      act(() => result.current.start());
      mockNow.mockReturnValue(11000);
      act(() => flushRAF());
      const midColor = barEl.style.backgroundColor;
      mockNow.mockReturnValue(15000); // 14s elapsed = 70% of 20s
      act(() => flushRAF());
      expect(barEl.style.backgroundColor).not.toBe(midColor);
    });

    it('bar color at near expiry differs from start', () => {
      mockNow.mockReturnValue(1000);
      const { result } = renderHook(() => useRoundTimer());
      const barEl = document.createElement('div');
      (result.current.barRef as React.MutableRefObject<HTMLDivElement | null>).current = barEl;
      act(() => result.current.start());
      mockNow.mockReturnValue(1001);
      act(() => flushRAF());
      const startColor = barEl.style.backgroundColor;
      mockNow.mockReturnValue(18000); // 17s elapsed = 85% of 20s
      act(() => flushRAF());
      expect(barEl.style.backgroundColor).not.toBe(startColor);
    });

    it('bar ARIA attributes show point value', () => {
      mockNow.mockReturnValue(1000);
      const { result } = renderHook(() => useRoundTimer());
      const barEl = document.createElement('div');
      (result.current.barRef as React.MutableRefObject<HTMLDivElement | null>).current = barEl;
      act(() => result.current.start());
      mockNow.mockReturnValue(11000); // 10s elapsed, 10s remaining
      act(() => flushRAF());
      expect(barEl.getAttribute('aria-valuenow')).toBe('6');
      expect(barEl.getAttribute('aria-valuetext')).toBe('6 points available');
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

  describe('unified point value display', () => {
    it('shows point value 10 at the start of the round', () => {
      mockNow.mockReturnValue(1000);
      const { result } = renderHook(() => useRoundTimer());
      const barEl = document.createElement('div');
      const pointLabelEl = document.createElement('span');
      (result.current.barRef as React.MutableRefObject<HTMLDivElement | null>).current = barEl;
      (result.current.pointLabelRef as React.MutableRefObject<HTMLElement | null>).current = pointLabelEl;
      act(() => result.current.start());
      mockNow.mockReturnValue(1000); // 0ms elapsed
      act(() => flushRAF());
      expect(pointLabelEl.textContent).toBe('10');
    });

    it('shows point value 10 at 1ms elapsed (not 9)', () => {
      mockNow.mockReturnValue(1000);
      const { result } = renderHook(() => useRoundTimer());
      const barEl = document.createElement('div');
      const pointLabelEl = document.createElement('span');
      (result.current.barRef as React.MutableRefObject<HTMLDivElement | null>).current = barEl;
      (result.current.pointLabelRef as React.MutableRefObject<HTMLElement | null>).current = pointLabelEl;
      act(() => result.current.start());
      mockNow.mockReturnValue(1001); // 1ms elapsed
      act(() => flushRAF());
      expect(pointLabelEl.textContent).toBe('10');
    });

    it('shows point value 10 at 2222ms elapsed (just before boundary)', () => {
      mockNow.mockReturnValue(1000);
      const { result } = renderHook(() => useRoundTimer());
      const barEl = document.createElement('div');
      const pointLabelEl = document.createElement('span');
      (result.current.barRef as React.MutableRefObject<HTMLDivElement | null>).current = barEl;
      (result.current.pointLabelRef as React.MutableRefObject<HTMLElement | null>).current = pointLabelEl;
      act(() => result.current.start());
      mockNow.mockReturnValue(3222); // 2222ms elapsed
      act(() => flushRAF());
      expect(pointLabelEl.textContent).toBe('10');
    });

    it('transitions to 9 just past the boundary', () => {
      mockNow.mockReturnValue(1000);
      const { result } = renderHook(() => useRoundTimer());
      const barEl = document.createElement('div');
      const pointLabelEl = document.createElement('span');
      (result.current.barRef as React.MutableRefObject<HTMLDivElement | null>).current = barEl;
      (result.current.pointLabelRef as React.MutableRefObject<HTMLElement | null>).current = pointLabelEl;
      act(() => result.current.start());
      mockNow.mockReturnValue(3223); // 2223ms elapsed
      act(() => flushRAF());
      expect(pointLabelEl.textContent).toBe('9');
    });

    it('updates ARIA attributes with point value', () => {
      mockNow.mockReturnValue(1000);
      const { result } = renderHook(() => useRoundTimer());
      const barEl = document.createElement('div');
      const pointLabelEl = document.createElement('span');
      (result.current.barRef as React.MutableRefObject<HTMLDivElement | null>).current = barEl;
      (result.current.pointLabelRef as React.MutableRefObject<HTMLElement | null>).current = pointLabelEl;
      act(() => result.current.start());
      mockNow.mockReturnValue(1000);
      act(() => flushRAF());
      expect(barEl.getAttribute('aria-valuenow')).toBe('10');
    });

    it('uses smooth color gradient for bar', () => {
      mockNow.mockReturnValue(1000);
      const { result } = renderHook(() => useRoundTimer());
      const barEl = document.createElement('div');
      (result.current.barRef as React.MutableRefObject<HTMLDivElement | null>).current = barEl;
      act(() => result.current.start());
      mockNow.mockReturnValue(11000); // 10s elapsed = 50% of 20s
      act(() => flushRAF());
      expect(barEl.style.backgroundColor).toBeTruthy();
    });

    it('reset sets point label to 10 and bar to full', () => {
      mockNow.mockReturnValue(1000);
      const { result } = renderHook(() => useRoundTimer());
      const barEl = document.createElement('div');
      const pointLabelEl = document.createElement('span');
      (result.current.barRef as React.MutableRefObject<HTMLDivElement | null>).current = barEl;
      (result.current.pointLabelRef as React.MutableRefObject<HTMLElement | null>).current = pointLabelEl;
      act(() => result.current.reset());
      expect(pointLabelEl.textContent).toBe('10');
      expect(barEl.style.width).toBe('100%');
    });
  });
});

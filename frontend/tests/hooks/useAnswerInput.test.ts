import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAnswerInput } from '../../src/hooks/useAnswerInput';

describe('useAnswerInput', () => {
  const setup = (overrides?: { maxDigits?: number }) => {
    const onSubmit = vi.fn();
    const result = renderHook(() =>
      useAnswerInput({ onSubmit, ...overrides }),
    );
    return { onSubmit, ...result };
  };

  // --- Initial state ---

  it('starts with empty typedDigits', () => {
    const { result } = setup();
    expect(result.current.typedDigits).toBe('');
  });

  // --- handleDigit ---

  it('appends a digit', () => {
    const { result } = setup();

    act(() => result.current.handleDigit('5'));
    expect(result.current.typedDigits).toBe('5');
  });

  it('composes multi-digit values', () => {
    const { result } = setup();

    act(() => result.current.handleDigit('4'));
    act(() => result.current.handleDigit('2'));
    expect(result.current.typedDigits).toBe('42');
  });

  it('enforces max 3 digits by default', () => {
    const { result } = setup();

    act(() => result.current.handleDigit('1'));
    act(() => result.current.handleDigit('2'));
    act(() => result.current.handleDigit('3'));
    act(() => result.current.handleDigit('9'));
    expect(result.current.typedDigits).toBe('123');
  });

  it('respects custom maxDigits', () => {
    const { result } = setup({ maxDigits: 2 });

    act(() => result.current.handleDigit('1'));
    act(() => result.current.handleDigit('2'));
    act(() => result.current.handleDigit('3'));
    expect(result.current.typedDigits).toBe('12');
  });

  it('rejects leading zero', () => {
    const { result } = setup();

    act(() => result.current.handleDigit('0'));
    expect(result.current.typedDigits).toBe('');
  });

  it('allows zero after a non-zero digit', () => {
    const { result } = setup();

    act(() => result.current.handleDigit('1'));
    act(() => result.current.handleDigit('0'));
    expect(result.current.typedDigits).toBe('10');
  });

  // --- handleBackspace ---

  it('removes the last digit', () => {
    const { result } = setup();

    act(() => result.current.handleDigit('7'));
    act(() => result.current.handleDigit('2'));
    act(() => result.current.handleBackspace());
    expect(result.current.typedDigits).toBe('7');
  });

  it('returns to empty string when deleting the last remaining digit', () => {
    const { result } = setup();

    act(() => result.current.handleDigit('3'));
    act(() => result.current.handleBackspace());
    expect(result.current.typedDigits).toBe('');
  });

  it('no-ops when backspacing on empty', () => {
    const { result } = setup();

    act(() => result.current.handleBackspace());
    expect(result.current.typedDigits).toBe('');
  });

  // --- handleSubmit ---

  it('calls onSubmit with parsed number and clears typedDigits', () => {
    const { result, onSubmit } = setup();

    act(() => result.current.handleDigit('4'));
    act(() => result.current.handleDigit('2'));
    act(() => result.current.handleSubmit());

    expect(onSubmit).toHaveBeenCalledWith(42);
    expect(result.current.typedDigits).toBe('');
  });

  it('does not call onSubmit when typedDigits is empty', () => {
    const { result, onSubmit } = setup();

    act(() => result.current.handleSubmit());
    expect(onSubmit).not.toHaveBeenCalled();
    expect(result.current.typedDigits).toBe('');
  });

  it('submits single digit correctly', () => {
    const { result, onSubmit } = setup();

    act(() => result.current.handleDigit('7'));
    act(() => result.current.handleSubmit());

    expect(onSubmit).toHaveBeenCalledWith(7);
  });

  it('submits three-digit number correctly', () => {
    const { result, onSubmit } = setup();

    act(() => result.current.handleDigit('1'));
    act(() => result.current.handleDigit('4'));
    act(() => result.current.handleDigit('4'));
    act(() => result.current.handleSubmit());

    expect(onSubmit).toHaveBeenCalledWith(144);
  });

  // --- reset ---

  it('clears typedDigits to empty string', () => {
    const { result } = setup();

    act(() => result.current.handleDigit('9'));
    act(() => result.current.handleDigit('9'));
    act(() => result.current.reset());

    expect(result.current.typedDigits).toBe('');
  });

  // --- Combined workflows ---

  it('delete-then-reenter: compose "12", delete once, enter "3" → "13"', () => {
    const { result } = setup();

    act(() => result.current.handleDigit('1'));
    act(() => result.current.handleDigit('2'));
    act(() => result.current.handleBackspace());
    act(() => result.current.handleDigit('3'));

    expect(result.current.typedDigits).toBe('13');
  });

  it('sequential delete to empty then re-enter', () => {
    const { result } = setup();

    act(() => result.current.handleDigit('1'));
    act(() => result.current.handleDigit('2'));
    act(() => result.current.handleDigit('3'));
    act(() => result.current.handleBackspace());
    act(() => result.current.handleBackspace());
    act(() => result.current.handleBackspace());
    expect(result.current.typedDigits).toBe('');

    act(() => result.current.handleDigit('5'));
    expect(result.current.typedDigits).toBe('5');
  });

  it('can submit again after reset', () => {
    const { result, onSubmit } = setup();

    act(() => result.current.handleDigit('1'));
    act(() => result.current.handleSubmit());
    expect(onSubmit).toHaveBeenCalledWith(1);

    act(() => result.current.reset());
    act(() => result.current.handleDigit('9'));
    act(() => result.current.handleSubmit());
    expect(onSubmit).toHaveBeenCalledWith(9);
    expect(onSubmit).toHaveBeenCalledTimes(2);
  });
});

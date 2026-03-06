import { useState, useCallback } from 'react';

const DEFAULT_MAX_DIGITS = 3;

export interface UseAnswerInputOptions {
  maxDigits?: number;
  onSubmit: (answer: number) => void;
}

export interface UseAnswerInputReturn {
  typedDigits: string;
  handleDigit: (digit: string) => void;
  handleBackspace: () => void;
  handleSubmit: () => void;
  reset: () => void;
}

export function useAnswerInput({
  maxDigits = DEFAULT_MAX_DIGITS,
  onSubmit,
}: UseAnswerInputOptions): UseAnswerInputReturn {
  const [typedDigits, setTypedDigits] = useState('');

  const handleDigit = useCallback(
    (digit: string) => {
      setTypedDigits((prev) => {
        if (prev.length >= maxDigits) return prev;
        if (prev === '' && digit === '0') return prev; // no leading zeros
        return prev + digit;
      });
    },
    [maxDigits],
  );

  const handleBackspace = useCallback(() => {
    setTypedDigits((prev) => prev.slice(0, -1));
  }, []);

  const handleSubmit = useCallback(() => {
    setTypedDigits((prev) => {
      if (prev.length === 0) return prev;
      onSubmit(parseInt(prev, 10));
      return '';
    });
  }, [onSubmit]);

  const reset = useCallback(() => {
    setTypedDigits('');
  }, []);

  return { typedDigits, handleDigit, handleBackspace, handleSubmit, reset };
}

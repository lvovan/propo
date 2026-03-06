import { useEffect } from 'react';
import { useTouchDetection } from '../../../hooks/useTouchDetection';
import TouchNumpad from './TouchNumpad';

interface AnswerInputProps {
  typedDigits: string;
  onDigit: (digit: string) => void;
  onBackspace: () => void;
  onSubmit: () => void;
  acceptingInput: boolean;
}

/**
 * Answer input controller. On touch devices, renders the TouchNumpad.
 * On desktop, renders nothing visible but installs a document-level
 * keydown listener for digit entry (0–9), Backspace, and Enter.
 *
 * All digit state is managed externally via the useAnswerInput hook;
 * this component simply routes input events to the parent callbacks.
 */
export default function AnswerInput({
  typedDigits,
  onDigit,
  onBackspace,
  onSubmit,
  acceptingInput,
}: AnswerInputProps) {
  const isTouchDevice = useTouchDetection();

  // Document-level keydown listener for desktop keyboard input
  useEffect(() => {
    if (isTouchDevice) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!acceptingInput) return;

      if (e.key >= '0' && e.key <= '9') {
        onDigit(e.key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        onBackspace();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        onSubmit();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isTouchDevice, acceptingInput, onDigit, onBackspace, onSubmit]);

  if (isTouchDevice) {
    return (
      <TouchNumpad
        typedDigits={typedDigits}
        onDigit={onDigit}
        onBackspace={onBackspace}
        onSubmit={onSubmit}
        acceptingInput={acceptingInput}
      />
    );
  }

  // Desktop: no visible UI — keyboard events handled by the listener above
  return null;
}

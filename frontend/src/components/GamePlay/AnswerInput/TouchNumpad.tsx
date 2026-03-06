import { useEffect } from 'react';
import { useTranslation } from '../../../i18n';
import styles from './TouchNumpad.module.css';

interface TouchNumpadProps {
  typedDigits: string;
  onDigit: (digit: string) => void;
  onBackspace: () => void;
  onSubmit: () => void;
  acceptingInput: boolean;
}

const DIGIT_ROWS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
];

/**
 * Custom in-page numpad for touch devices.
 *
 * Renders a 4×3 calculator-style grid (1-2-3 / 4-5-6 / 7-8-9 / ⌫-0-Go).
 * All digit state is managed externally via the useAnswerInput hook;
 * this component simply routes button taps to parent callbacks.
 *
 * Physical keyboard input (0–9, Enter, Backspace) is captured via a
 * document-level keydown listener and mirrors button behavior identically.
 */
export default function TouchNumpad({
  typedDigits,
  onDigit,
  onBackspace,
  onSubmit,
  acceptingInput,
}: TouchNumpadProps) {
  const { t } = useTranslation();

  // Document-level keydown listener for physical keyboard support
  useEffect(() => {
    if (!acceptingInput) return;

    const handleKeyDown = (e: KeyboardEvent) => {
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
  }, [acceptingInput, onDigit, onBackspace, onSubmit]);

  const isEmpty = typedDigits === '';

  return (
    <div className={styles.container}>
      {/* Numpad grid */}
      <div className={styles.grid}>
        {/* Rows 1-3: digits 1-9 */}
        {DIGIT_ROWS.map((row) =>
          row.map((digit) => (
            <button
              key={digit}
              type="button"
              className={styles.button}
              aria-label={t('a11y.digit', { digit })}
              disabled={!acceptingInput}
              onClick={() => onDigit(digit)}
            >
              {digit}
            </button>
          ))
        )}

        {/* Row 4: ⌫, 0, ✔️ */}
        <button
          type="button"
          className={`${styles.button} ${styles.backspace}`}
          aria-label={t('a11y.deleteDigit')}
          disabled={!acceptingInput}
          onClick={onBackspace}
        >
          ⌫
        </button>
        <button
          type="button"
          className={styles.button}
          aria-label={t('a11y.digit', { digit: '0' })}
          disabled={!acceptingInput}
          onClick={() => onDigit('0')}
        >
          0
        </button>
        <button
          type="button"
          className={`${styles.button} ${styles.go}`}
          aria-label={t('a11y.submitNumpad')}
          disabled={!acceptingInput || isEmpty}
          onClick={onSubmit}
        >
          Go
        </button>
      </div>
    </div>
  );
}

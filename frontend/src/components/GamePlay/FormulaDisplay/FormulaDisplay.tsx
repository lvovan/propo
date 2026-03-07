import type { Formula } from '../../../types/game';
import { useTranslation } from '../../../i18n';
import styles from './FormulaDisplay.module.css';

interface FormulaDisplayProps {
  formula: Formula;
  playerAnswer?: number;
  typedDigits?: string;
  isInputPhase?: boolean;
  gameMode?: 'play' | 'improve';
}

/**
 * Displays a proportional-reasoning question with one value hidden as "?".
 *
 * Percentage:    25% of 80 = ?
 * Ratio:         2 : 3 = 6 : ?
 * Fraction:      2/5 = 4/?   (stacked fraction display)
 * Rule of Three: word problem + visual proportion
 */
export default function FormulaDisplay({ formula, playerAnswer, typedDigits, isInputPhase, gameMode }: FormulaDisplayProps) {
  const { t } = useTranslation();
  const { type, values, hiddenPosition } = formula;

  const hiddenValue =
    playerAnswer !== undefined
      ? String(playerAnswer)
      : typedDigits
        ? typedDigits
        : '?';

  const hiddenClassName = isInputPhase
    ? `${styles.hidden} ${styles.pulsing}`
    : styles.hidden;

  /** Returns either the value or the hidden placeholder for a given slot. */
  const slot = (pos: 'A' | 'B' | 'C' | 'D', idx: number) => {
    if (hiddenPosition === pos) {
      return <span className={hiddenClassName}>{hiddenValue}</span>;
    }
    return <span className={styles.value}>{values[idx]}</span>;
  };

  // Build an aria-label for the entire question
  const ariaLabel = buildAriaLabel(formula, hiddenValue, playerAnswer, t);

  if (type === 'percentage') {
    // A% of B = C
    return (
      <div className={styles.formula} role="math" aria-label={ariaLabel}>
        {slot('A', 0)}
        <span className={styles.operator}>% of</span>
        {slot('B', 1)}
        <span className={styles.operator}>=</span>
        {slot('C', 2)}
      </div>
    );
  }

  if (type === 'ratio') {
    // A : B = C : D
    return (
      <div className={styles.formula} role="math" aria-label={ariaLabel}>
        {slot('A', 0)}
        <span className={styles.operator}>:</span>
        {slot('B', 1)}
        <span className={styles.operator}>=</span>
        {slot('C', 2)}
        <span className={styles.operator}>:</span>
        {slot('D', 3)}
      </div>
    );
  }

  if (type === 'fraction') {
    // A/B = C/D rendered inline with "/" operator
    return (
      <div className={styles.formula} role="math" aria-label={ariaLabel}>
        {slot('A', 0)}
        <span className={styles.operator}>/</span>
        {slot('B', 1)}
        <span className={styles.operator}>=</span>
        {slot('C', 2)}
        <span className={styles.operator}>/</span>
        {slot('D', 3)}
      </div>
    );
  }

  // Story Challenge types: word problem + visual proportion
  // All 3 story sub-types (multiItemRatio, percentageOfWhole, complexExtrapolation)
  // use the same rendering pattern: translated word problem text + formula display
  const problemText = formula.wordProblemKey
    ? t(formula.wordProblemKey as Parameters<typeof t>[0], {
        a: String(values[0]),
        b: String(values[1]),
        c: hiddenPosition === 'C' ? '?' : String(values[2]),
        d: hiddenPosition === 'D' ? '?' : String(values[3]),
      })
    : '';

  return (
    <div className={styles.wordProblem} role="math" aria-label={ariaLabel}>
      <p className={styles.problemText}>{problemText}</p>
      <div className={styles.answerPreview}>
        <span className={hiddenClassName}>{hiddenValue}</span>
      </div>
      {gameMode === 'improve' && (
        <div className={styles.formula}>
          <span className={styles.value}>{values[0]}</span>
          <span className={styles.operator}>→</span>
          <span className={styles.value}>{values[1]}</span>
          <span className={styles.separator}>,</span>
          {hiddenPosition === 'C' ? (
            <>
              <span className={hiddenClassName}>{hiddenValue}</span>
              <span className={styles.operator}>→</span>
              <span className={styles.value}>{values[3]}</span>
            </>
          ) : (
            <>
              <span className={styles.value}>{values[2]}</span>
              <span className={styles.operator}>→</span>
              <span className={hiddenClassName}>{hiddenValue}</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function buildAriaLabel(
  formula: Formula,
  hiddenValue: string,
  playerAnswer: number | undefined,
  t: ReturnType<typeof useTranslation>['t'],
): string {
  const { type, values, hiddenPosition } = formula;
  const posIdx = ['A', 'B', 'C', 'D'].indexOf(hiddenPosition);
  const displayValues = values.map((v, i) => (i === posIdx ? hiddenValue : String(v)));

  if (playerAnswer !== undefined) {
    return t('a11y.formulaWithAnswer', {
      question: formatForAria(type, displayValues),
      answer: String(playerAnswer),
    });
  }
  return t('a11y.formulaWithoutAnswer', {
    question: formatForAria(type, displayValues),
  });
}

function formatForAria(type: string, d: string[]): string {
  switch (type) {
    case 'percentage': return `${d[0]} percent of ${d[1]} equals ${d[2]}`;
    case 'ratio':      return `${d[0]} to ${d[1]} equals ${d[2]} to ${d[3]}`;
    case 'fraction':   return `${d[0]} over ${d[1]} equals ${d[2]} over ${d[3]}`;
    case 'multiItemRatio': return `story problem: ${d[0]} maps to ${d[1]}, find the answer`;
    case 'percentageOfWhole': return `story problem: find the percentage of ${d[0]} out of the whole`;
    case 'complexExtrapolation': return `${d[0]} maps to ${d[1]}, ${d[2]} maps to ${d[3]}`;
    default:           return d.join(' ');
  }
}

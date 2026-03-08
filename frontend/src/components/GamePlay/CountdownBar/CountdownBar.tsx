import { useRef, useEffect, type RefObject } from 'react';
import styles from './CountdownBar.module.css';
import { useTranslation } from '../../../i18n';

interface CountdownBarProps {
  /** Ref attached to the bar fill element — useRoundTimer writes width + backgroundColor directly */
  barRef: RefObject<HTMLDivElement | null>;
  /** Ref for the point label element — useRoundTimer writes point value to textContent */
  pointLabelRef: RefObject<HTMLElement | null>;
}

/**
 * Animated countdown progress bar that shrinks from 100% to 0% over the round duration.
 * Displays the current point value (10→1) with localized "X points"/"1 point" label.
 * Color transitions smoothly from green to red via HSL interpolation.
 * The useRoundTimer hook drives the fill's style.width and style.backgroundColor via barRef.
 */
export default function CountdownBar({ barRef, pointLabelRef }: CountdownBarProps) {
  const { t } = useTranslation();
  const innerRef = useRef<HTMLSpanElement | null>(null);

  // Observe the numeric value written by useRoundTimer and append localized text
  useEffect(() => {
    const labelEl = pointLabelRef.current;
    const textEl = innerRef.current;
    if (!labelEl || !textEl) return;

    const observer = new MutationObserver(() => {
      const raw = labelEl.textContent ?? '10';
      const value = parseInt(raw, 10);
      const word = value === 1 ? t('game.pointSingular') : t('game.pointPlural');
      textEl.textContent = `${value} ${word}`;
    });

    observer.observe(labelEl, { childList: true, characterData: true, subtree: true });

    // Set initial text
    const initialValue = parseInt(labelEl.textContent ?? '10', 10);
    const initialWord = initialValue === 1 ? t('game.pointSingular') : t('game.pointPlural');
    textEl.textContent = `${initialValue} ${initialWord}`;

    return () => observer.disconnect();
  }, [pointLabelRef, t]);

  return (
    <div
      className={styles.track}
      role="progressbar"
      aria-label="Points available"
      aria-valuemin={0}
      aria-valuemax={10}
    >
      <div
        ref={barRef}
        className={styles.fill}
        style={{ width: '100%', backgroundColor: '#0e8a1e' }}
      />
      <span ref={pointLabelRef} className={styles.pointLabelHidden}>10</span>
      <span ref={innerRef} className={styles.pointLabel} aria-hidden="true" />
    </div>
  );
}

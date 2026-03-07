import type { RefObject } from 'react';
import styles from './CountdownBar.module.css';

interface CountdownBarProps {
  /** Ref attached to the bar fill element — useRoundTimer writes width + backgroundColor directly */
  barRef: RefObject<HTMLDivElement | null>;
  /** Ref for the point label element — useRoundTimer writes point value to textContent */
  pointLabelRef?: RefObject<HTMLElement | null>;
  /** When true, uses thicker track and renders point label */
  competitive?: boolean;
}

/**
 * Animated countdown progress bar that shrinks from 100% to 0% over the round duration.
 * Color transitions through scoring-tier stages (green → lightGreen → orange → red).
 * In competitive mode, uses a thicker track with smooth HSL color transition
 * and displays the current point value.
 * The useRoundTimer hook drives the fill's style.width and style.backgroundColor via barRef.
 */
export default function CountdownBar({ barRef, pointLabelRef, competitive }: CountdownBarProps) {
  return (
    <div
      className={competitive ? styles.trackCompetitive : styles.track}
      role="progressbar"
      aria-label={competitive ? 'Points available' : 'Time remaining'}
      aria-valuemin={0}
      aria-valuemax={competitive ? 10 : 5}
    >
      <div
        ref={barRef}
        className={styles.fill}
        style={{ width: '100%', backgroundColor: '#0e8a1e' }}
      />
      {competitive && pointLabelRef && (
        <span ref={pointLabelRef} className={styles.pointLabel}>10</span>
      )}
    </div>
  );
}

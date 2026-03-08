import { useRef, type RefObject } from 'react';
import styles from './GameStatus.module.css';
import CountdownBar from '../CountdownBar/CountdownBar';
import { useTranslation } from '../../../i18n';
import type { GameMode } from '../../../types/player';

interface GameStatusProps {
  roundNumber: number;
  totalRounds: number;
  score: number;
  barRef: RefObject<HTMLDivElement | null>;
  pointLabelRef?: RefObject<HTMLElement | null>;
  isReplay: boolean;
  currentPhase: 'input' | 'feedback';
  isCorrect: boolean | null;
  correctAnswer: number | null;
  completedRound: number;
  gameMode?: GameMode;
}

/**
 * Displays round counter, running score, and timer during gameplay.
 * During feedback phase, swaps to show result message with completion count.
 * Shows "Replay" indicator when in replay phase (per FR-019).
 * Shows "Practice" instead of score when in improve mode.
 * Renders a countdown progress bar below the status row.
 */
export default function GameStatus({
  roundNumber,
  totalRounds,
  score,
  barRef,
  pointLabelRef,
  isReplay,
  currentPhase,
  isCorrect,
  correctAnswer,
  completedRound,
  gameMode = 'play',
}: GameStatusProps) {
  const isFeedback = currentPhase === 'feedback';
  const { t } = useTranslation();
  const fallbackPointLabelRef = useRef<HTMLElement | null>(null);
  const resolvedPointLabelRef = pointLabelRef ?? fallbackPointLabelRef;

  const rootClassName = [
    styles.status,
    isFeedback && isCorrect === true && styles.feedbackCorrect,
    isFeedback && isCorrect === false && styles.feedbackIncorrect,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClassName} aria-label={t('a11y.gameStatus')}>
      {isFeedback ? (
        <div className={styles.feedbackContent} role="status" aria-live="assertive">
          <div className={styles.feedbackMain}>
            <span className={styles.feedbackIcon} aria-hidden="true">
              {isCorrect ? '✓' : '✗'}
            </span>
            <span className={styles.feedbackText}>
              {isCorrect ? t('game.correct') : t('game.incorrect')}
            </span>
            {!isCorrect && correctAnswer !== null && (
              <span className={styles.feedbackAnswer}>
                {t('game.incorrectAnswer', { answer: String(correctAnswer) })}
              </span>
            )}
          </div>
          <span className={styles.completionCount}>
            {isReplay
              ? t('game.replayCompleted', { current: String(completedRound), total: String(totalRounds) })
              : t('game.roundCompleted', { current: String(completedRound), total: String(totalRounds) })}
          </span>
        </div>
      ) : (
        <>
          <div className={styles.roundInfo}>
            {isReplay ? (
              <span className={styles.replayBadge}>{t('game.replay')}</span>
            ) : (
              <span>{t('game.roundOf', { current: String(roundNumber), total: String(totalRounds) })}</span>
            )}
          </div>
          <div className={styles.score}>
            {gameMode === 'improve' ? (
              <span className={styles.practiceBadge}>{t('game.practice')}</span>
            ) : (
              <>
                <span className={styles.scoreLabel}>{t('game.scoreLabel')}</span>{' '}
                <span className={styles.scoreValue}>{score}</span>
              </>
            )}
          </div>
          {gameMode !== 'improve' && (
            <CountdownBar
              barRef={barRef}
              pointLabelRef={resolvedPointLabelRef}
            />
          )}
        </>
      )}
    </div>
  );
}

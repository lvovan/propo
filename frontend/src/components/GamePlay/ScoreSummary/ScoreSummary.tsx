import React, { useState } from 'react';
import type { ScoreSummaryProps } from './types';
import type { Round } from '../../../types/game';
import ProgressionGraph from '../ProgressionGraph/ProgressionGraph';
import { calculateTotalTime, formatTotalTime } from '../../../services/totalTime';
import { encodeShareUrl } from '../../../services/shareUrl';
import { useTranslation } from '../../../i18n';
import styles from './ScoreSummary.module.css';

/** Format elapsed milliseconds as seconds to one decimal place, e.g. "1.5s". */
function formatTime(ms: number | null): string {
  if (ms == null) return '—';
  return `${(ms / 1000).toFixed(1)}s`;
}

/** Format the formula for display in the summary table. */
function formatFormula(round: Round): string {
  const { type, values, hiddenPosition } = round.formula;
  const posIdx = ['A', 'B', 'C', 'D'].indexOf(hiddenPosition);
  const display = values.map((v, i) => (i === posIdx ? '?' : String(v)));

  switch (type) {
    case 'percentage':
      return `${display[0]}% of ${display[1]} = ${display[2]}`;
    case 'ratio':
      return `${display[0]} : ${display[1]} = ${display[2]} : ${display[3]}`;
    case 'fraction':
      return `${display[0]}/${display[1]} = ${display[2]}/${display[3]}`;
    case 'multiItemRatio':
    case 'percentageOfWhole':
    case 'complexExtrapolation':
      return `${display[0]} → ${display[1]}, ${display[2]} → ${display[3]}`;
    default:
      return display.join(' ');
  }
}

/** Format points with a leading +/- sign. */
function formatPoints(pts: number | null): string {
  if (pts == null) return '—';
  return pts >= 0 ? `+${pts}` : String(pts);
}

/** Map round points to a row colour class. */
const getRowClass = (round: Round) => {
  const pts = round.points ?? 0;
  if (pts >= 5) return styles.greenRow;
  if (pts >= 2) return styles.orangeRow;
  return styles.redRow;
};

const ScoreSummary: React.FC<ScoreSummaryProps> = ({
  rounds,
  score,
  onPlayAgain,
  onBackToMenu,
  gameMode,
  history,
  seed,
  playerName,
}) => {
  const { t } = useTranslation();
  const [shareCopied, setShareCopied] = useState(false);
  const hasRounds = Array.isArray(rounds) && rounds.length > 0;
  const isImprove = gameMode === 'improve';
  const isCompetitive = gameMode === 'competitive';
  const correctCount = rounds.filter((r) => r.isCorrect).length;
  const incorrectRounds = rounds.filter((r) => !r.isCorrect);
  const showSparkline =
    !isImprove && !isCompetitive && Array.isArray(history) && history.length >= 2;

  const handleShare = async () => {
    if (!seed) return;
    const totalTimeMs = calculateTotalTime(rounds);
    const url = encodeShareUrl({
      seed,
      playerName: playerName ?? '',
      score,
      totalTimeMs,
    });
    try {
      await navigator.clipboard.writeText(url);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    } catch {
      // Fallback: just ignore if clipboard fails
    }
  };

  return (
    <div className={styles.summary}>
      {isImprove ? (
        <>
          <p className={styles.improveResult}>
            {`You got ${correctCount}/${rounds.length} right!`}
          </p>
          {incorrectRounds.length > 0 && (
            <p className={styles.practiceHint}>
              {`Keep practising: ${incorrectRounds.map((r) => formatFormula(r)).join(', ')}`}
            </p>
          )}
        </>
      ) : (
        <div className={styles.totalScore}>
          <span className={styles.totalLabel}>Score</span>
          <span
            className={styles.totalValue}
            aria-live="polite"
            aria-label={`Score: ${score}`}
          >
            {score}
          </span>
        </div>
      )}

      {isCompetitive && (
        <div className={styles.competitiveInfo}>
          <div className={styles.totalTime}>
            <span className={styles.totalLabel}>{t('competition.totalTime')}</span>
            <span className={styles.totalValue}>
              {formatTotalTime(calculateTotalTime(rounds))}
            </span>
          </div>
          {seed && (
            <p className={styles.seedDisplay}>
              <span className={styles.seedLabel}>{t('competition.seed')}:</span>{' '}
              <span>{seed}</span>
            </p>
          )}
        </div>
      )}

      <div className={styles.actions}>
        <button
          className={styles.playAgainButton}
          onClick={onPlayAgain}
          aria-label="Play again"
        >
          Play Again
        </button>
        <button
          className={styles.backButton}
          onClick={onBackToMenu}
          aria-label="Back to menu"
        >
          Back to Menu
        </button>
        {isCompetitive && seed && (
          <button
            className={styles.shareButton}
            onClick={handleShare}
            aria-label={t('competition.share')}
          >
            {shareCopied ? t('competition.shareCopied') : t('competition.share')}
          </button>
        )}
      </div>

      {showSparkline && history && (
        <div className={styles.sparklineWrapper}>
          <ProgressionGraph history={history} />
        </div>
      )}

      {hasRounds && (
        <div className={styles.tableWrapper}>
          <table className={styles.table} aria-label="Game summary table">
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Formula</th>
                <th scope="col">Answer</th>
                <th scope="col">Result</th>
                <th scope="col">Time</th>
                <th scope="col">Points</th>
              </tr>
            </thead>
            <tbody>
              {rounds.map((r, i) => (
                <tr key={i} className={getRowClass(r)}>
                  <td>{i + 1}</td>
                  <td>{formatFormula(r)}</td>
                  <td>{r.playerAnswer ?? '—'}</td>
                  <td>
                    {r.firstTryCorrect ? (
                      <span className={styles.correctBadge} role="img" aria-label="Correct on first try">
                        ✅
                      </span>
                    ) : (
                      <span className={styles.incorrectBadge} role="img" aria-label="Incorrect on first try">
                        ❌
                      </span>
                    )}
                  </td>
                  <td>{formatTime(r.elapsedMs)}</td>
                  <td>{formatPoints(r.points)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ScoreSummary;

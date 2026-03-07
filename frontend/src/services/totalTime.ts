import type { Round } from '../types/game';
import { WRONG_ANSWER_PENALTY_MS } from '../constants/scoring';

/**
 * Calculate competition total time from rounds.
 * Sum of elapsedMs for all rounds + WRONG_ANSWER_PENALTY_MS per incorrect answer.
 */
export function calculateTotalTime(rounds: Round[]): number {
  let totalMs = 0;
  let incorrectCount = 0;
  for (const round of rounds) {
    totalMs += round.elapsedMs ?? 0;
    if (round.isCorrect === false) {
      incorrectCount++;
    }
  }
  return totalMs + incorrectCount * WRONG_ANSWER_PENALTY_MS;
}

/**
 * Format milliseconds into human-readable time string.
 * < 60s: "29.6s"
 * >= 60s: "1m 29.6s"
 */
export function formatTotalTime(ms: number): string {
  const totalSeconds = ms / 1000;
  if (totalSeconds < 60) {
    return `${totalSeconds.toFixed(1)}s`;
  }
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds.toFixed(1)}s`;
}

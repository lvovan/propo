import type { ScoringTier } from '../types/game';

/** Time-based scoring tiers for correct answers. Checked in order (first match wins). */
export const SCORING_TIERS: ScoringTier[] = [
  { maxMs: 20000, points: 5 },
  { maxMs: 30000, points: 3 },
  { maxMs: 40000, points: 2 },
  { maxMs: 50000, points: 1 },
];

/** Points awarded for a correct answer slower than all tiers (>50s). */
export const DEFAULT_POINTS = 0;

/** Duration (ms) of the countdown bar — matches the last scoring tier boundary. */
export const COUNTDOWN_DURATION_MS = 50000;

/** CVD-safe colors for each countdown bar stage, keyed by scoring tier. */
export const COUNTDOWN_COLORS = {
  green: '#0e8a1e',      // 0–20s elapsed, 5 pts tier
  lightGreen: '#5ba829',  // 20–30s elapsed, 3 pts tier
  orange: '#d47604',      // 30–40s elapsed, 2 pts tier
  red: '#c5221f',         // 40–50s elapsed, 1 pt / 0 pts tier
} as const;

export type CountdownColor = typeof COUNTDOWN_COLORS[keyof typeof COUNTDOWN_COLORS];

/** Points deducted for an incorrect answer during primary rounds. */
export const INCORRECT_PENALTY = -2;

/** Duration (ms) to display correct/incorrect feedback before advancing. */
export const FEEDBACK_DURATION_MS = 1200;

/** Number of primary rounds per game. */
export const ROUNDS_PER_GAME = 10;

/**
 * Calculate points for a single round answer.
 * @param isCorrect Whether the answer was correct.
 * @param elapsedMs Response time in milliseconds.
 * @returns Points awarded (positive for correct, negative for incorrect).
 */
export function calculateScore(isCorrect: boolean, elapsedMs: number): number {
  if (!isCorrect) {
    return INCORRECT_PENALTY;
  }

  for (const tier of SCORING_TIERS) {
    if (elapsedMs <= tier.maxMs) {
      return tier.points;
    }
  }

  return DEFAULT_POINTS;
}

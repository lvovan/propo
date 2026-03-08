/** Percentage-based scoring thresholds. Checked in order (first match wins). */
export const SCORING_THRESHOLDS = [
  { minPercent: 0.60, points: 5 },
  { minPercent: 0.40, points: 3 },
  { minPercent: 0.20, points: 2 },
  { minPercent: 0.0001, points: 1 },  // >0%
] as const;

/** Points awarded for a correct answer with 0% time remaining. */
export const DEFAULT_POINTS = 0;

/** Timer duration (ms) for Pure Numeric rounds. */
export const NUMERIC_TIMER_MS = 20_000;

/** Timer duration (ms) for Story Challenge rounds. */
export const STORY_TIMER_MS = 50_000;

/** CVD-safe colors for each countdown bar stage. */
export const COUNTDOWN_COLORS = {
  green: '#0e8a1e',
  lightGreen: '#5ba829',
  orange: '#d47604',
  red: '#c5221f',
} as const;

export type CountdownColor = typeof COUNTDOWN_COLORS[keyof typeof COUNTDOWN_COLORS];

/** Points deducted for an incorrect answer during primary rounds. */
export const INCORRECT_PENALTY = -2;

/** Duration (ms) to display correct/incorrect feedback before advancing. */
export const FEEDBACK_DURATION_MS = 1200;

/** Number of primary rounds per game. */
export const ROUNDS_PER_GAME = 10;

/** Time penalty (ms) added per incorrect answer in Competition mode. */
export const WRONG_ANSWER_PENALTY_MS = 60_000;

/** Maximum points at the start of a competitive round. */
export const COMPETITIVE_MAX_POINTS = 10;

/** Minimum points at/after timer expiry in a competitive round. */
export const COMPETITIVE_MIN_POINTS = 1;

/**
 * Calculate points for a single competitive round using point-decay model.
 * Point value decreases linearly from 10 to 1 over the round timer duration.
 * Correct answers earn the current value; incorrect answers lose it.
 * @param isCorrect Whether the answer was correct.
 * @param elapsedMs Response time in milliseconds.
 * @param timerDurationMs Total timer duration for this round type.
 * @returns Positive value for correct, negative for incorrect (range: -10 to +10).
 */
export function calculateCompetitiveScore(isCorrect: boolean, elapsedMs: number, timerDurationMs: number): number {
  const clamped = Math.min(elapsedMs, timerDurationMs);
  const fraction = clamped / timerDurationMs;
  const pointValue = Math.max(COMPETITIVE_MIN_POINTS, COMPETITIVE_MAX_POINTS - Math.floor((COMPETITIVE_MAX_POINTS - COMPETITIVE_MIN_POINTS) * fraction));
  return isCorrect ? pointValue : -pointValue;
}

/**
 * Calculate points for a single round answer.
 * Scoring is based on percentage of time remaining, normalized across timer durations.
 * @param isCorrect Whether the answer was correct.
 * @param elapsedMs Response time in milliseconds.
 * @param timerDurationMs Total timer duration for this round type.
 * @returns Points awarded (positive for correct, negative for incorrect).
 */
export function calculateScore(isCorrect: boolean, elapsedMs: number, timerDurationMs: number): number {
  if (!isCorrect) {
    return INCORRECT_PENALTY;
  }

  const remainingPercent = Math.max(0, (timerDurationMs - elapsedMs) / timerDurationMs);

  for (const threshold of SCORING_THRESHOLDS) {
    if (remainingPercent >= threshold.minPercent) {
      return threshold.points;
    }
  }

  return DEFAULT_POINTS;
}

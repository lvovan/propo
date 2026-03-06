/** The four question categories in the proportional reasoning game. */
export type QuestionType = 'percentage' | 'ratio' | 'fraction' | 'ruleOfThree';

/** Which value in the formula is hidden from the player. */
export type HiddenPosition = 'A' | 'B' | 'C' | 'D';

/**
 * A proportional-reasoning question with one value hidden.
 *
 * Percentage  – values [A, B, C]:  A% of B = C
 * Ratio       – values [A, B, C, D]:  A : B = C : D
 * Fraction    – values [A, B, C, D]:  A/B = C/D
 * Rule of Three – values [A, B, C, D]:  word problem (A→B, C→D)
 */
export interface Formula {
  /** Which category this question belongs to. */
  type: QuestionType;
  /** All values in display order. Length 3 (percentage) or 4 (ratio/fraction/ruleOfThree). */
  values: number[];
  /** Which slot is hidden. */
  hiddenPosition: HiddenPosition;
  /** The numeric answer the player must provide. */
  correctAnswer: number;
  /** i18n key for the word-problem template (ruleOfThree only). */
  wordProblemKey?: string;
}

/** Current phase of the game. */
export type GameStatus = 'not-started' | 'playing' | 'replay' | 'completed';

/** A single round within a game. */
export interface Round {
  /** The multiplication formula for this round. */
  formula: Formula;
  /** The player's submitted answer, or null if not yet answered. */
  playerAnswer: number | null;
  /** Whether the answer was correct, or null if not yet answered. */
  isCorrect: boolean | null;
  /** Response time in milliseconds, or null if not yet answered. */
  elapsedMs: number | null;
  /** Points awarded (primary rounds) or null (unanswered or replay). */
  points: number | null;
  /** Whether the player's first answer was correct. Set once during primary play; preserved during replay. Null while unanswered. */
  firstTryCorrect: boolean | null;
}

/** A challenging question category identified by the analysis algorithm. Not persisted. */
export interface ChallengingItem {
  /** Question type this item targets. */
  type: QuestionType;
  /** Total incorrect answers across analyzed games (≥ 0). */
  mistakeCount: number;
  /** Mean response time in ms across all occurrences (> 0). */
  avgMs: number;
}

/** The full game state. */
export interface GameState {
  /** Current game phase. */
  status: GameStatus;
  /** The 10 primary rounds. */
  rounds: Round[];
  /** Indices into rounds[] for rounds that need replay. */
  replayQueue: number[];
  /** Current position: index into rounds (playing) or replayQueue (replay). */
  currentRoundIndex: number;
  /** Whether the current round is awaiting input or showing feedback. */
  currentPhase: 'input' | 'feedback';
  /** Running total score. */
  score: number;
  /** Which mode this game is being played in. */
  gameMode: 'play' | 'improve';
}

/** A scoring tier threshold. */
export interface ScoringTier {
  /** Maximum elapsed time in ms (inclusive) for this tier. */
  maxMs: number;
  /** Points awarded if answered correctly within this time. */
  points: number;
}

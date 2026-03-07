import type { GameMode } from './player';

/** The six question categories in the proportional reasoning game. */
export type QuestionType = 'percentage' | 'ratio' | 'fraction' | 'multiItemRatio' | 'percentageOfWhole' | 'complexExtrapolation';

/** Pure numeric question types (short timer). */
export const PURE_NUMERIC_TYPES: QuestionType[] = ['percentage', 'ratio', 'fraction'];

/** Story challenge question types (long timer). */
export const STORY_CHALLENGE_TYPES: QuestionType[] = ['multiItemRatio', 'percentageOfWhole', 'complexExtrapolation'];

/** Returns true if the question type is a Story Challenge. */
export function isStoryChallenge(type: QuestionType): boolean {
  return STORY_CHALLENGE_TYPES.includes(type);
}

/** Which value in the formula is hidden from the player. */
export type HiddenPosition = 'A' | 'B' | 'C' | 'D';

/**
 * A proportional-reasoning question with one value hidden.
 *
 * Percentage           – values [A, B, C]:     A% of B = C
 * Ratio                – values [A, B, C, D]:  A : B = C : D
 * Fraction             – values [A, B, C, D]:  A/B = C/D
 * MultiItemRatio       – word problem with subset total
 * PercentageOfWhole    – word problem with percentage calculation
 * ComplexExtrapolation – word problem with proportional scaling (absorbs old ruleOfThree)
 */
export interface Formula {
  /** Which category this question belongs to. */
  type: QuestionType;
  /** All values in display order. */
  values: number[];
  /** Which slot is hidden. */
  hiddenPosition: HiddenPosition;
  /** The numeric answer the player must provide. */
  correctAnswer: number;
  /** i18n key for the word-problem template (story challenge types). */
  wordProblemKey?: string;
  /** i18n key for the answer unit label shown next to the input (e.g., 'unit.g', 'unit.percent'). */
  answerUnitKey?: string;
  /** Timer duration in ms for this round (20000 for numeric, 50000 for story). */
  timerDurationMs: number;
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
  gameMode: GameMode;
  /** The seed string used for competitive mode (undefined for play/improve). */
  seed?: string;
}

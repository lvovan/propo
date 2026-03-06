````markdown
# Data Model: Core Gameplay

**Feature**: 002-core-gameplay
**Date**: 2026-02-15
**Updated**: 2026-03-06

## Entities

### Formula

Represents a single proportional-reasoning question. Defined by its question type, a values array, a hidden position, and the correct answer.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `type` | `QuestionType` | One of four values | Category of question: `'percentage'`, `'ratio'`, `'fraction'`, or `'ruleOfThree'` |
| `values` | `number[]` | Length 3 (percentage) or 4 (ratio/fraction/ruleOfThree), all positive integers | The values in display order |
| `hiddenPosition` | `HiddenPosition` | `'A'`, `'B'`, `'C'`, or `'D'` | Which value slot is hidden from the player |
| `correctAnswer` | `number` | Positive integer | The value the player must provide |
| `wordProblemKey` | `string \| undefined` | i18n key | Template key for rule-of-three word problems (only present when `type === 'ruleOfThree'`) |

**Question Formats**:
- **Percentage**: `values = [A, B, C]` representing `A% of B = C`. All integers, C = A×B/100.
- **Ratio**: `values = [A, B, C, D]` representing `A : B = C : D`. Proportional: A×D = B×C.
- **Fraction**: `values = [A, B, C, D]` representing `A/B = C/D`. Equivalent fractions: A < B.
- **Rule of Three**: `values = [A, B, C, D]` representing "if A → B, then C → ?". Proportional: A×D = B×C.

**Validation Rules**:
- All values MUST be positive integers.
- `correctAnswer` MUST equal `values[indexOf(hiddenPosition)]`.
- For percentage: `values[0] * values[1] / 100 === values[2]`.
- For ratio/fraction/ruleOfThree: `values[0] * values[3] === values[1] * values[2]`.

### Round

Represents a single question within a game. Contains the formula, the player's response, and scoring data.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `formula` | `Formula` | Valid formula | The proportional-reasoning question for this round |
| `playerAnswer` | `number \| null` | null until answered | The value the player entered |
| `isCorrect` | `boolean \| null` | null until answered | Whether the answer matches the hidden value |
| `elapsedMs` | `number \| null` | ≥ 0, null until answered | Response time in milliseconds |
| `points` | `number \| null` | null until scored | Points awarded (or deducted) for this round |
| `firstTryCorrect` | `boolean \| null` | null until answered | Whether the first attempt was correct (preserved during replay) |

**Derived Values**:
- `correctAnswer`: Determined by `formula.correctAnswer`.
- `isCorrect`: `playerAnswer === formula.correctAnswer`.
- `points`: Calculated from `isCorrect` and `elapsedMs` using the scoring function (null during replay).

**State Transitions**:
```
[Unanswered] ---(player submits)---> [Answered]
   playerAnswer: null                   playerAnswer: number
   isCorrect: null                      isCorrect: boolean
   elapsedMs: null                      elapsedMs: number
   points: null                         points: number | null (null if replay)
```

### Game

Represents a complete play session consisting of primary rounds and optional replay rounds.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `status` | `GameStatus` | Enum value | Current game phase |
| `rounds` | `Round[]` | Exactly 10 items | The 10 primary rounds |
| `replayQueue` | `number[]` | Indices into `rounds` | Indices of rounds that need to be replayed |
| `currentRoundIndex` | `number` | ≥ 0 | Index into `rounds` (playing) or `replayQueue` (replay) |
| `currentPhase` | `'input' \| 'feedback'` | Sub-state | Whether awaiting input or showing feedback |
| `score` | `number` | Integer (may be negative) | Running total score |
| `gameMode` | `'play' \| 'improve'` | Mode flag | Which mode this game is being played in |

**Game Status (enum)**:
```
'not-started' → Game not yet begun
'playing'     → Primary rounds in progress (1–10)
'replay'      → Replaying incorrectly answered rounds
'completed'   → All rounds (including replays) answered correctly
```

**State Transitions**:
```
[not-started] ---(START_GAME)---> [playing, round 0, input]
[playing, input] ---(SUBMIT_ANSWER)---> [playing, feedback]
[playing, feedback] ---(NEXT_ROUND, more rounds)---> [playing, next round, input]
[playing, feedback] ---(NEXT_ROUND, round 10, has failed)---> [replay, round 0, input]
[playing, feedback] ---(NEXT_ROUND, round 10, all correct)---> [completed]
[replay, input] ---(SUBMIT_ANSWER)---> [replay, feedback]
[replay, feedback] ---(NEXT_ROUND, correct, more in queue)---> [replay, next in queue, input]
[replay, feedback] ---(NEXT_ROUND, incorrect)---> [replay, re-queued, input]
[replay, feedback] ---(NEXT_ROUND, correct, queue empty)---> [completed]
```

**Invariants**:
- `rounds` always has exactly 10 entries.
- `replayQueue` is populated only after all 10 primary rounds are complete.
- During `replay`, incorrectly answered rounds are re-appended to `replayQueue`.
- `score` is only modified during primary rounds, never during replay.
- `currentPhase` toggles between `'input'` and `'feedback'` within each round.

## Scoring Constants

| Constant | Value | Description |
|----------|-------|-------------|
| `SCORING_TIERS` | `[{maxMs: 20000, points: 5}, {maxMs: 30000, points: 3}, {maxMs: 40000, points: 2}, {maxMs: 50000, points: 1}]` | Time-based point tiers for correct answers |
| `DEFAULT_POINTS` | `0` | Points when correct but > 50s |
| `INCORRECT_PENALTY` | `-2` | Points deducted for incorrect answers |
| `FEEDBACK_DURATION_MS` | `1200` | Duration of correct/incorrect feedback display |
| `COUNTDOWN_DURATION_MS` | `50000` | Duration of the countdown bar |
| `ROUNDS_PER_GAME` | `10` | Number of primary rounds |

## TypeScript Type Definitions

```typescript
// types/game.ts

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
  /** The proportional-reasoning question for this round. */
  formula: Formula;
  /** The player's submitted answer, or null if not yet answered. */
  playerAnswer: number | null;
  /** Whether the answer was correct, or null if not yet answered. */
  isCorrect: boolean | null;
  /** Response time in milliseconds, or null if not yet answered. */
  elapsedMs: number | null;
  /** Points awarded (primary rounds) or null (unanswered or replay). */
  points: number | null;
  /** Whether the player's first answer was correct. */
  firstTryCorrect: boolean | null;
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
```

## Relationships

```
Game 1 ──── * Round (exactly 10 primary rounds)
Round 1 ──── 1 Formula
Game.replayQueue ──── * Round (references by index, 0 to 10 items)
```

- A Game contains exactly 10 Rounds.
- Each Round contains exactly one Formula.
- The Game's `replayQueue` references Rounds by their index in the `rounds` array.
- Game state is ephemeral — not persisted to any storage. Lives only in React component state.
- The Game is independent of the Player/Session model from feature 001. The session provides the player's name/avatar for display in the Header, but gameplay does not read or write player data.
````

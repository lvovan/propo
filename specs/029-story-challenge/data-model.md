# Data Model: Story Challenge Expansion

**Feature**: 029-story-challenge  
**Date**: 2026-03-07  
**Source**: [spec.md](spec.md), [research.md](research.md)

## Entities

### QuestionType (MODIFIED)

Expanded from 4 to 6 values. `ruleOfThree` removed; 3 story challenge sub-types added.

```typescript
type QuestionType =
  | 'percentage'           // Pure Numeric
  | 'ratio'                // Pure Numeric
  | 'fraction'             // Pure Numeric
  | 'multiItemRatio'       // Story Challenge
  | 'percentageOfWhole'    // Story Challenge
  | 'complexExtrapolation' // Story Challenge (absorbs old ruleOfThree)
;
```

**Category helpers** (new):

```typescript
const PURE_NUMERIC_TYPES: QuestionType[] = ['percentage', 'ratio', 'fraction'];
const STORY_CHALLENGE_TYPES: QuestionType[] = ['multiItemRatio', 'percentageOfWhole', 'complexExtrapolation'];

function isStoryChallenge(type: QuestionType): boolean {
  return STORY_CHALLENGE_TYPES.includes(type);
}
```

### Formula (EXTENDED)

| Field | Type | Change | Description |
|-------|------|--------|-------------|
| `type` | `QuestionType` | MODIFIED | Now includes 3 new story challenge sub-types; `ruleOfThree` removed |
| `values` | `number[]` | No change | All values in display order |
| `hiddenPosition` | `HiddenPosition` | No change | Which slot is hidden |
| `correctAnswer` | `number` | No change | The player's target answer |
| `wordProblemKey` | `string \| undefined` | EXTENDED | Now used by all 3 story challenge types (was ruleOfThree only) |
| `timerDurationMs` | `number` | **NEW** | Timer duration for this round: 20000 (numeric) or 50000 (story) |

### Round (UNCHANGED)

No structural changes. The `formula.timerDurationMs` field carries per-round timer context.

### RoundResult (UNCHANGED)

The `type` field now stores the new `QuestionType` values. Legacy `ruleOfThree` records in player history are mapped to `complexExtrapolation` at read time.

### ChallengingItem (UNCHANGED structure)

The `type` field now covers 6 categories instead of 4. Analysis groups by all 6 sub-types.

### ScoringTier (REMOVED)

The fixed-ms `ScoringTier` interface and `SCORING_TIERS` array are removed. Replaced by percentage-based scoring thresholds computed at runtime from `timerDurationMs`.

## Scoring Constants (MODIFIED)

| Constant | Before | After | Description |
|----------|--------|-------|-------------|
| `SCORING_TIERS` | Fixed-ms array | **REMOVED** | Replaced by percentage thresholds |
| `SCORING_THRESHOLDS` | N/A | `[{minPercent: 0.60, points: 5}, {minPercent: 0.40, points: 3}, {minPercent: 0.20, points: 2}, {minPercent: 0.00001, points: 1}]` | **NEW** — percentage-based |
| `DEFAULT_POINTS` | `0` | `0` | No change |
| `COUNTDOWN_DURATION_MS` | `50000` | **REMOVED** | Timer duration now per-formula |
| `NUMERIC_TIMER_MS` | N/A | `20000` | **NEW** |
| `STORY_TIMER_MS` | N/A | `50000` | **NEW** |
| `COUNTDOWN_COLORS` | 4 static colors | No change | Colors preserved |
| `INCORRECT_PENALTY` | `-2` | No change | |
| `FEEDBACK_DURATION_MS` | `1200` | No change | |
| `ROUNDS_PER_GAME` | `10` | No change | |

## `calculateScore()` Signature Change

```typescript
// Before
function calculateScore(isCorrect: boolean, elapsedMs: number): number

// After
function calculateScore(isCorrect: boolean, elapsedMs: number, timerDurationMs: number): number
```

**Algorithm**:
```
if !isCorrect → INCORRECT_PENALTY (-2)
remainingPercent = max(0, (timerDurationMs - elapsedMs) / timerDurationMs)
for each threshold in SCORING_THRESHOLDS (descending minPercent):
  if remainingPercent >= threshold.minPercent → return threshold.points
return DEFAULT_POINTS (0)
```

## Question Distribution (NEW)

| Category | Count per game | Sub-type distribution |
|----------|---------------|----------------------|
| Pure Numeric | 5 | Balanced across percentage, ratio, fraction |
| Story Challenge | 5 | At least 1 of each sub-type; 2 remaining random |
| **Total** | **10** | Shuffled randomly |

## Relationships

```
Formula
├── type ∈ PURE_NUMERIC_TYPES → timerDurationMs = 20000
├── type ∈ STORY_CHALLENGE_TYPES → timerDurationMs = 50000
└── wordProblemKey set for STORY_CHALLENGE_TYPES

Game.rounds[0..9] → Round → Formula.timerDurationMs → calculateScore()
                                                    → useRoundTimer(durationMs)
                                                    → CountdownBar proportional colors

GameRecord.rounds[].type now covers 6 values
challengeAnalyzer groups by 6 categories (was 4)
Legacy 'ruleOfThree' → mapped to 'complexExtrapolation' at read time
```

## State Transitions

No changes to the game state machine (not-started → playing → replay → completed). The only difference is that `calculateScore()` now receives `timerDurationMs` from the current round's formula, and the timer hook resets to the per-round duration instead of a global constant.

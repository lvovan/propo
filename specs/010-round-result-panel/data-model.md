# Data Model: Round Result in Status Panel

**Feature**: 010-round-result-panel  
**Date**: 2026-02-16

## Overview

This feature makes no changes to persisted data or the game state reducer. All changes are to component props interfaces (view-layer contracts). The existing `GameState` type already contains all data needed to drive the new feedback rendering in GameStatus.

## Existing Entities (unchanged)

### GameState

| Field | Type | Description |
|-------|------|-------------|
| `status` | `'not-started' \| 'playing' \| 'replay' \| 'completed'` | Top-level game phase |
| `currentPhase` | `'input' \| 'feedback'` | Sub-phase within a round |
| `currentRoundIndex` | `number` | 0-based index into rounds (playing) or replayQueue (replay) |
| `rounds` | `Round[]` | All 10 primary rounds |
| `replayQueue` | `number[]` | Indices of failed rounds to replay |
| `score` | `number` | Running total score |

### Round

| Field | Type | Description |
|-------|------|-------------|
| `formula` | `Formula` | The proportional-reasoning question for this round |
| `playerAnswer` | `number \| null` | Player's submitted answer (null until answered) |
| `isCorrect` | `boolean \| null` | Whether answer was correct (null until answered) |
| `elapsedMs` | `number \| null` | Time taken to answer |
| `points` | `number \| null` | Points awarded/deducted |

### Formula

| Field | Type | Description |
|-------|------|-------------|
| `type` | `QuestionType` | Category: `'percentage'`, `'ratio'`, `'fraction'`, or `'ruleOfThree'` |
| `values` | `number[]` | All values in display order |
| `hiddenPosition` | `'A' \| 'B' \| 'C' \| 'D'` | Which value is hidden as '?' |
| `correctAnswer` | `number` | The value the player must provide |

## Modified Props Interfaces

### GameStatusProps (extended)

The GameStatus component receives additional props to support feedback rendering.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `roundNumber` | `number` | Yes | 1-based current round number |
| `totalRounds` | `number` | Yes | Total rounds in current mode |
| `score` | `number` | Yes | Current score |
| `timerRef` | `RefObject<HTMLElement \| null>` | Yes | Ref for timer text element |
| `barRef` | `RefObject<HTMLDivElement \| null>` | Yes | Ref for countdown bar fill |
| `isReplay` | `boolean` | Yes | Whether in replay mode |
| **`currentPhase`** | `'input' \| 'feedback'` | **Yes (NEW)** | Current round sub-phase |
| **`isCorrect`** | `boolean \| null` | **Yes (NEW)** | Whether current answer is correct |
| **`correctAnswer`** | `number \| null` | **Yes (NEW)** | The correct answer value |
| **`completedRound`** | `number` | **Yes (NEW)** | 1-based completed round count |

### FormulaDisplayProps (extended)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `formula` | `Formula` | Yes | The formula to display |
| **`playerAnswer`** | `number` | **No (NEW)** | Optional: replaces '?' with this value |

## State Transitions (unchanged)

No changes to the game state machine. The existing transitions drive the rendering:

```
input phase -> SUBMIT_ANSWER -> feedback phase (GameStatus swaps to feedback content)
feedback phase -> NEXT_ROUND -> input phase (GameStatus reverts to normal content)
```

## Validation Rules

- `completedRound` must be `currentRoundIndex + 1` (1-based, includes just-completed round)
- `totalRounds` during playing = `rounds.length` (always 10)
- `totalRounds` during replay = `replayQueue.length` (dynamic)
- `isCorrect` and `correctAnswer` must be non-null when `currentPhase === 'feedback'`
- `playerAnswer` for FormulaDisplay must be the actual submitted number from `currentRound.playerAnswer`

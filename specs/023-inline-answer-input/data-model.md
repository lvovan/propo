# Data Model: Inline Answer Input

**Feature Branch**: `023-inline-answer-input`
**Date**: 2026-02-17

## Summary

This feature introduces **no new data entities** and **no changes to persisted data**. All changes are to transient UI state that exists only during a gameplay round.

## Existing Entities (unchanged)

### Formula

| Field | Type | Description |
|-------|------|-------------|
| factorA | number | First multiplication factor (2–12) |
| factorB | number | Second multiplication factor (2–12) |
| product | number | Result of factorA × factorB |
| hiddenPosition | 'A' \| 'B' \| 'C' | Which value is hidden from the player |

### Round

| Field | Type | Description |
|-------|------|-------------|
| formula | Formula | The formula for this round |
| playerAnswer | number \| undefined | Player's submitted answer |
| isCorrect | boolean \| undefined | Whether the answer was correct |
| elapsedMs | number \| undefined | Time taken to answer |
| points | number \| undefined | Points awarded |

### GameState

| Field | Type | Description |
|-------|------|-------------|
| status | 'not-started' \| 'playing' \| 'replay' \| 'completed' | Current game status |
| currentPhase | 'input' \| 'feedback' | Phase within a round |
| currentRoundIndex | number | Index of current round |
| rounds | Round[] | All rounds in the game |
| replayQueue | Round[] | Rounds to replay (incorrect answers) |
| score | number | Current score |
| gameMode | GameMode | Selected game mode |

## New Transient State

### typedDigits (ephemeral — not persisted)

| Field | Type | Description |
|-------|------|-------------|
| typedDigits | string | Digits typed by the player during the input phase. Empty string when no digits entered. Maximum 3 characters. Resets to empty on each new round. |

**Lifecycle**: Created when input phase starts → updated on each digit press or backspace → consumed on submit → cleared on round transition. Never persisted to storage.

**Display mapping**:
- `typedDigits === ""` → show "?" in formula
- `typedDigits !== ""` → show `typedDigits` in formula
- After submit, `playerAnswer` (from Round) takes precedence during feedback phase

## State Transitions

```
Round Start
  └─→ typedDigits = ""  (shows "?")
       │
       ├─ Digit pressed → typedDigits += digit (max 3, no leading zero)
       ├─ Backspace → typedDigits = typedDigits.slice(0, -1)
       │              (if empty → shows "?" again)
       └─ Submit (Enter/✔️) → IF typedDigits !== "" THEN:
            playerAnswer = Number(typedDigits)
            phase → 'feedback' (shows playerAnswer, pulsing stops)
            └─→ After FEEDBACK_DURATION_MS → next round, typedDigits reset
```

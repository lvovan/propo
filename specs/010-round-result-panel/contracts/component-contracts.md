# Component Contracts: Round Result in Status Panel

**Feature**: 010-round-result-panel  
**Date**: 2026-02-16

## Overview

This feature has no REST/GraphQL API surface — it is a pure client-side React component change. The "contracts" are the component props interfaces that define the boundaries between components.

## GameStatus Component Contract

### Props Interface

```typescript
interface GameStatusProps {
  // Existing props (unchanged)
  roundNumber: number;                    // 1-based round number for display
  totalRounds: number;                    // Total rounds in current mode
  score: number;                          // Current running score
  timerRef: RefObject<HTMLElement | null>; // Ref for timer DOM element
  barRef: RefObject<HTMLDivElement | null>; // Ref for countdown bar fill DOM element
  isReplay: boolean;                      // Whether currently in replay mode

  // New props (added by this feature)
  currentPhase: 'input' | 'feedback';     // Current round sub-phase
  isCorrect: boolean | null;              // Whether current answer is correct (null during input)
  correctAnswer: number | null;           // Correct answer value (null during input)
  completedRound: number;                 // 1-based count of completed rounds (including current)
}
```

### Rendering Contract

**When `currentPhase === 'input'`:**
- Renders: round number, score, timer text, countdown bar
- Background: `#f8f9fa` (neutral gray)
- Timer and bar are live (updated via refs)

**When `currentPhase === 'feedback'`:**
- Renders: result icon + text ("✓ Correct!" or "✗ Not quite!"), completion count, optional correct answer
- Background: `#e8f5e9` (correct) or `#ffebee` (incorrect)
- Timer and countdown bar are hidden
- Content wrapped in `role="status"` + `aria-live="assertive"` container

### Accessibility Contract

| Attribute | Value | Phase |
|-----------|-------|-------|
| `aria-label` | `"Game status"` | input |
| `role="status"` | on feedback content wrapper | feedback |
| `aria-live` | `"assertive"` | feedback |
| `aria-hidden` | `"true"` on icon span | feedback |

## FormulaDisplay Component Contract

### Props Interface

```typescript
interface FormulaDisplayProps {
  formula: Formula;                       // The formula to display (unchanged)
  playerAnswer?: number;                  // NEW: Optional override for the '?' position
}
```

### Rendering Contract

**When `playerAnswer` is undefined (default):**
- Hidden position displays `'?'` (existing behavior, unchanged)

**When `playerAnswer` is provided:**
- Hidden position displays the `playerAnswer` value instead of `'?'`
- All other positions display normally
- `aria-label` includes the player's answer value

## MainPage Orchestration Contract

### Rendering during playing/replay phases

```
GameStatus
  props: { ...existing, currentPhase, isCorrect, correctAnswer, completedRound }

formula-area (div, minHeight: 88px)
  FormulaDisplay
    props: { formula }                           // during input phase
    props: { formula, playerAnswer }             // during feedback phase

AnswerInput
  props: { onSubmit, disabled: phase !== 'input' }
```

### Key change from current

**Before (current):**
- Formula area swaps between `FormulaDisplay` and `InlineFeedback` based on phase
- GameStatus always shows round/score/timer

**After (this feature):**
- Formula area always shows `FormulaDisplay` (with `playerAnswer` during feedback)
- GameStatus swaps between round/score/timer and feedback message based on phase
- `InlineFeedback` is removed entirely

## CSS Contract

### New CSS classes in GameStatus.module.css

| Class | Applied when | Visual effect |
|-------|-------------|---------------|
| `.feedbackCorrect` | `currentPhase === 'feedback'` && `isCorrect === true` | Background `#e8f5e9`, text `#2e7d32` |
| `.feedbackIncorrect` | `currentPhase === 'feedback'` && `isCorrect === false` | Background `#ffebee`, text `#c62828` |
| `.feedbackContent` | `currentPhase === 'feedback'` | Flex column layout within panel |
| `.feedbackIcon` | Always within feedback | Large icon display (✓ or ✗) |
| `.feedbackText` | Always within feedback | Result text ("Correct!" / "Not quite!") |
| `.feedbackAnswer` | Incorrect only | "The answer was {N}" text |
| `.completionCount` | Always within feedback | "Round X of Y completed" text |

### Responsive behavior

- At `≤480px`: feedback content font sizes scale down, same as existing status content
- Panel dimensions remain unchanged — `flex-wrap: wrap` handles reflow

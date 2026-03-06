# Quickstart: Round Result in Status Panel

**Feature**: 010-round-result-panel  
**Branch**: `010-round-result-panel`

## What this feature does

Moves the round result feedback ("Correct!" / "Not quite!") from a separate inline banner in the formula area into the GameStatus panel at the top of the gameplay area. During the ~1.2s feedback phase, the status panel background changes to green/red and shows the result message plus a round completion count (e.g., "Round 3 of 10 completed"). The formula area continues to show the answered formula instead of swapping to a feedback banner.

## Files changed

| File | Action | What changes |
|------|--------|-------------|
| `GameStatus.tsx` | Modify | Add conditional feedback rendering based on `currentPhase` prop |
| `GameStatus.module.css` | Modify | Add `.feedbackCorrect`, `.feedbackIncorrect`, and feedback content classes |
| `FormulaDisplay.tsx` | Modify | Add optional `playerAnswer` prop to replace `'?'` with submitted answer |
| `MainPage.tsx` | Modify | Pass new props to GameStatus; always show FormulaDisplay (with answer during feedback); remove InlineFeedback import |
| `InlineFeedback.tsx` | Delete | Feedback functionality moved into GameStatus |
| `InlineFeedback.module.css` | Delete | Styles no longer needed |
| `GameStatus.test.tsx` | Modify | Add tests for feedback mode rendering and a11y |
| `FormulaDisplay.test.tsx` | Modify | Add tests for `playerAnswer` prop |
| `InlineFeedback.test.tsx` | Delete | Component removed |

## How to verify

1. **Start a game**: Click "Start Game" on the main page
2. **Submit correct answer**: The status panel should change from gray to green, showing "✓ Correct!" and "Round 1 of 10 completed". The formula area should still show the formula with your answer filled in.
3. **Wait ~1.2 seconds**: The panel should revert to showing "Round 2 of 10" with score and timer.
4. **Submit incorrect answer**: The status panel should change to red, showing "✗ Not quite!" with "The answer was {N}" and the completion count.
5. **Play through all 10 rounds**: Verify every feedback appears in the status panel area, never as a separate popup/banner.
6. **Trigger replay**: Answer some questions wrong, then verify replay rounds show "Replay X of Y completed" in the status panel during feedback.

## Key design decisions

- **No new game state**: Existing `currentPhase` ('input' | 'feedback') drives the panel content swap
- **Full panel background color change**: Green/red background provides a strong visual signal without eye-jumping
- **FormulaDisplay shows answer during feedback**: Player sees what they answered while the result appears above
- **InlineFeedback deleted entirely**: No dead code — feedback rendering recreated directly in GameStatus
- **Same a11y patterns**: `role="status"` + `aria-live="assertive"` + icon + text (two non-color indicators)

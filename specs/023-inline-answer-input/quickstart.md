# Quickstart: Inline Answer Input

**Feature Branch**: `023-inline-answer-input`
**Date**: 2026-02-17

## What's Changing

The separate answer text field is removed during gameplay. Typed digits now appear directly in the formula at the hidden value position (where "?" is shown). The touch keypad "Go" button becomes a checkmark ("✔️"). A slow-pulsing orange border highlights the active input slot during the input phase.

## Key Files to Modify

| File | Change |
|------|--------|
| `frontend/src/hooks/useAnswerInput.ts` | **NEW** — custom hook managing `typedDigits` state, digit validation, submit guard |
| `frontend/src/components/GamePlay/FormulaDisplay/FormulaDisplay.tsx` | Accept `typedDigits` and `isInputPhase` props; display typed digits inline; apply pulsing CSS class |
| `frontend/src/components/GamePlay/FormulaDisplay/FormulaDisplay.module.css` | Add `@keyframes pulse-border` animation and `.pulsing` class; add `prefers-reduced-motion` fallback |
| `frontend/src/components/GamePlay/AnswerInput/AnswerInput.tsx` | Remove `AnswerInputDesktop`; pass new props through to `TouchNumpad`; install document-level `keydown` listener for desktop |
| `frontend/src/components/GamePlay/AnswerInput/TouchNumpad.tsx` | Remove internal `answer` state and display div; use `typedDigits`/`onDigit`/`onBackspace`/`onSubmit` props; replace `t('game.go')` with `"✔️"` |
| `frontend/src/components/GamePlay/AnswerInput/TouchNumpad.module.css` | Remove `.display` styles |
| `frontend/src/pages/MainPage.tsx` | Wire `useAnswerInput` hook; pass `typedDigits` + `isInputPhase` to `FormulaDisplay`; pass callbacks to `AnswerInput`; reset on round change |

## Implementation Order

1. Create `useAnswerInput` hook with tests (unit-testable in isolation)
2. Update `FormulaDisplay` to accept and render `typedDigits` + pulsing border
3. Refactor `AnswerInput`/`TouchNumpad` to use external state and callbacks; replace "Go" with "✔️"
4. Wire everything together in `MainPage`
5. Integration tests: full round flow with inline input
6. Accessibility tests: axe-core on formula with pulsing border

## Dev Commands

```bash
cd frontend
npm install          # no new dependencies needed
npm run dev          # local dev server
npm test             # run all tests
npm run build        # production build
```

## Test Strategy

- **Unit**: `useAnswerInput` hook — digit append, max length, leading zero, backspace, submit guard, reset
- **Component**: `FormulaDisplay` — renders typed digits, shows "?", pulsing class applied/removed
- **Component**: `TouchNumpad` — checkmark label, button callbacks
- **Integration**: Full round — type digits → see in formula → submit → feedback → next round
- **Accessibility**: axe-core on formula display during input and feedback phases; `prefers-reduced-motion` query

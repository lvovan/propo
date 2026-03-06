# Research: Inline Answer Input

**Feature Branch**: `023-inline-answer-input`
**Date**: 2026-02-17

## 1. Pulsing Orange Border Animation

**Decision**: Use `box-shadow` animation with `@keyframes` in CSS Modules.

**Rationale**:
- `box-shadow` is paint-only — no layout shift or reflow, unlike `border` which changes geometry.
- `box-shadow` with spread radius respects `border-radius` on all target browsers, unlike `outline` which has issues in older Safari.
- `box-shadow: 0 0 0 Npx color` (zero blur, spread-only) produces a crisp "border" ring effect.
- 2.5s duration with `ease-in-out` provides a natural breathing rhythm — noticeable but not distracting for children.
- Opacity range 0.25–0.7 keeps the effect subtle: always slightly visible during input phase, never jarring.
- Base state includes `box-shadow: 0 0 0 3px transparent` + `transition: box-shadow 0.3s ease-out` for graceful fade when input phase ends mid-animation.
- Conditional CSS class toggling (`isInputPhase && styles.pulsing`) is the standard React CSS Modules pattern — no JS timers needed.

**Alternatives considered**:
- `border` animation: Rejected — causes layout reflow on every frame.
- `outline` animation: Rejected — doesn't follow `border-radius` in some browsers.
- `will-change: box-shadow`: Rejected — overkill for this lightweight animation, wastes memory.
- `animationPlayState`: Rejected — class toggling is simpler and more idiomatic.

**Accessibility**: A `@media (prefers-reduced-motion: reduce)` query replaces the animation with a static orange ring. This is required by the constitution (WCAG 2.1 AA).

**Color**: `rgba(255, 160, 0, …)` — warm orange that contrasts with the existing purple accent (`#6c63ff`).

## 2. State Architecture for Inline Digit Display

**Decision**: Custom `useAnswerInput` hook in parent with state lifting.

**Rationale**:
- The typed digits need to be read by `FormulaDisplay` (sibling) and written by `AnswerInput` (sibling). State must live in the parent (lowest common ancestor).
- Extracting digit logic (max 3 chars, no leading zeros, submission guard) into a custom hook keeps `MainPage` clean.
- Hook returns: `{ typedDigits, handleDigit, handleBackspace, handleSubmit, reset }`.
- Parent passes `typedDigits` down to `FormulaDisplay` and action callbacks down to `AnswerInput`.
- `reset()` called in a `useEffect` keyed on round index to clear digits on new round.

**Alternatives considered**:
- Inline state in parent (no hook): Rejected — clutters the page component with digit validation logic.
- Shared ref: Rejected — refs don't trigger re-renders, would need `useSyncExternalStore` hacks.
- React Context: Rejected — overkill for two direct siblings one level below the parent.

**Performance**: A 3-character string updating at human typing speed has zero performance concern. `React.memo` is unnecessary here.

## 3. Checkmark Label on Touch Keypad

**Decision**: Replace the `t('game.go')` localized text with a literal Unicode "✔️" character.

**Rationale**:
- A checkmark icon is universally understood — no localization needed.
- This removes the `game.go` translation key usage from TouchNumpad (the key can remain in i18n files for backward compatibility but is no longer rendered).
- The existing `.go` CSS class styling (purple background, white text) applies equally well to an emoji or Unicode character.
- No need for an SVG icon or icon library — the Unicode checkmark renders consistently on all target browsers.

**Alternatives considered**:
- SVG icon: Rejected — adds complexity. The Unicode character is sufficient and simpler (YAGNI / Principle II).
- Keep localized text alongside icon: Rejected — defeats the purpose of universal recognition.

## 4. Desktop Keyboard Input Without Visible Input Element

**Decision**: Document-level `keydown` listener (already exists in TouchNumpad) becomes the unified keyboard handler.

**Rationale**:
- The current `AnswerInputDesktop` uses a visible `<input>` element for focus and keyboard capture. Removing it means keyboard events must be captured at the document level.
- `TouchNumpad` already has a `document.addEventListener('keydown', ...)` pattern that handles 0–9, Enter, and Backspace. This pattern works for desktop too.
- The event listener should be installed by the parent (or the input component) and gated by `acceptingInput`.
- No `<input>` element needed — the listener is global during the input phase.

**Alternatives considered**:
- Hidden `<input>` with `opacity: 0`: Rejected — adds an invisible DOM element just for focus, which is complexity for no benefit.
- `tabIndex` on the formula div: Rejected — would require the user to click/tab to the formula first, adding friction.

## 5. Component Interface Changes

### FormulaDisplay (modified)

Current props: `{ formula: Formula; playerAnswer?: number }`

New props: `{ formula: Formula; playerAnswer?: number; typedDigits?: string; isInputPhase?: boolean }`

- `typedDigits`: live string from the hook, displayed in the hidden slot when non-empty (replaces "?")
- `isInputPhase`: controls the pulsing border CSS class
- `playerAnswer` continues to be used during feedback phase (takes precedence over `typedDigits`)

Display logic: `playerAnswer !== undefined` → show answer (feedback); else `typedDigits` non-empty → show typed digits; else → show "?".

### AnswerInput / TouchNumpad (modified)

Current props: `{ onSubmit: (answer: number) => void; acceptingInput: boolean }`

New props: `{ typedDigits: string; onDigit: (d: string) => void; onBackspace: () => void; onSubmit: () => void; acceptingInput: boolean }`

- No longer manages internal digit state — receives it from parent.
- `AnswerInputDesktop` is removed entirely (no visible input).
- `TouchNumpad` removes its answer display `<div>` and internal `answer` state.
- `TouchNumpad` buttons call `onDigit`, `onBackspace`, `onSubmit` callbacks.

### MainPage (modified)

- Adds `useAnswerInput` hook usage.
- Passes `typedDigits` and `isInputPhase` to `FormulaDisplay`.
- Passes callbacks and `typedDigits` to `AnswerInput`/`TouchNumpad`.
- `handleSubmit` updated to use the hook's `handleSubmit`.
- `useEffect` resets digits on round change.

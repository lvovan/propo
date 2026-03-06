# Research: Round Result in Status Panel

**Feature**: 010-round-result-panel  
**Date**: 2026-02-16

## Research Tasks

### 1. GameStatus component conditional rendering pattern

**Context**: GameStatus must conditionally render either its normal content (round/score/timer) or feedback content (result message + completion count) based on game phase.

**Decision**: Use the existing `currentPhase` prop (`'input' | 'feedback'`) to conditionally render two content branches within GameStatus. During `'input'`, render the current round/score/timer layout. During `'feedback'`, render the result message, icon, and round completion count.

**Rationale**: The game state already tracks `currentPhase` and transitions it cleanly via the reducer (`SUBMIT_ANSWER` → `'feedback'`, `NEXT_ROUND` → `'input'`). No new state is needed. The component simply receives the phase value and additional feedback data as props, then renders the appropriate branch.

**Alternatives considered**:
- **Separate FeedbackPanel component**: Would duplicate the panel's visual container styling and require coordination with GameStatus for consistent dimensions. Rejected — adding a component increases complexity when the spec explicitly calls for the same panel to transform.
- **CSS-only show/hide**: Would keep both DOM trees mounted and toggle visibility. Rejected — unnecessary DOM duplication and complicates aria-live region behavior (hidden content may still be announced).

---

### 2. FormulaDisplay enhancement for showing player's answer

**Context**: FormulaDisplay currently always renders `'?'` for the hidden position. FR-013 requires showing the answered formula with the player's submitted answer filled in during feedback (e.g., "7 × 6 = 38").

**Decision**: Add an optional `playerAnswer` prop (`number | undefined`) to FormulaDisplay. When provided, it replaces the `'?'` for the hidden position with the player's submitted value. The component remains a pure presentational component with no internal state.

**Rationale**: This is the minimal change — one optional prop that only affects the display text for the hidden position. The existing `Formula` type doesn't need to change, and the component stays backward-compatible (callers not passing `playerAnswer` still get `'?'`).

**Alternatives considered**:
- **Modify the Formula object in the reducer to fill in the answer**: Would require changing the immutable formula data model. Rejected — the formula should remain a pure question definition; how it's displayed is a UI concern, not a data model concern.
- **Create a separate "AnsweredFormula" component**: Over-engineered for a one-prop difference. Rejected per YAGNI.

---

### 3. InlineFeedback removal strategy

**Context**: The InlineFeedback component and its tests must be deleted. The feedback content moves into GameStatus.

**Decision**: Delete `InlineFeedback.tsx`, `InlineFeedback.module.css`, and `InlineFeedback.test.tsx`. Remove the import and usage from `MainPage.tsx`. The feedback rendering logic (icon, text, correct answer display) is reimplemented within GameStatus's feedback branch, reusing the same color values and a11y patterns.

**Rationale**: A clean removal avoids dead code. The feedback rendering is simple enough (icon + text + optional answer) that it doesn't need to be extracted into a shared utility — it's directly inlined into GameStatus's feedback rendering branch.

**Alternatives considered**:
- **Keep InlineFeedback as a shared sub-component used within GameStatus**: Would preserve the component but add an import dependency from GameStatus to InlineFeedback. Rejected — the rendering context is different (panel layout vs centered card), and sharing would require abstracting away the container styles, adding complexity for no reuse benefit.

---

### 4. Panel background color approach

**Context**: FR-008/FR-009 require the entire status panel background to change to green (correct) or red (incorrect) during feedback.

**Decision**: Use CSS classes applied to the status panel's root `<div>`: `styles.feedbackCorrect` and `styles.feedbackIncorrect`. These override the default `background: #f8f9fa` with the success/error background colors from the existing design system (`#e8f5e9` for correct, `#ffebee` for incorrect). Text color adjusts accordingly (`#2e7d32` for correct, `#c62828` for incorrect).

**Rationale**: Reusing the exact color values from the deleted InlineFeedback ensures visual consistency. CSS class toggling is the simplest approach — no runtime style calculations needed.

**Alternatives considered**:
- **Inline styles via React**: Would work but mixes styling concerns into the component logic. Rejected — CSS Modules are the project standard.
- **CSS custom properties (variables)**: Over-engineered for two static color states. Rejected.

---

### 5. Round completion count calculation

**Context**: FR-004/FR-005 require displaying "Round X of Y completed" during playing and "Replay X of Y completed" during replay.

**Decision**: 
- **Playing mode**: `currentRoundIndex + 1` gives the completed round number (since the index is 0-based and we want to include the just-completed round). `rounds.length` (always 10) gives the total. Display: "Round {currentRoundIndex + 1} of {rounds.length} completed".
- **Replay mode**: The replay queue index works similarly. `currentRoundIndex + 1` gives the completed replay count. However, the total is the original replay queue length at the start of the replay phase, which can grow if the player answers incorrectly again (the round is re-appended). We use the current `replayQueue.length` as the total at display time, acknowledging that it may change. Display: "Replay {currentRoundIndex + 1} of {replayQueue.length} completed".

**Rationale**: The data is already available in GameState — no new derived state is needed. Using `currentRoundIndex + 1` naturally includes the just-completed round, which matches the spec requirement.

**Alternatives considered**:
- **Track a separate `completedRounds` counter in the reducer**: Would add state that duplicates information derivable from `currentRoundIndex`. Rejected per YAGNI.

---

### 6. Accessibility: live region transition

**Context**: FR-014 requires the feedback message to be announced by screen readers. The current InlineFeedback uses `role="status"` with `aria-live="assertive"`.

**Decision**: The feedback content within GameStatus will be wrapped in a container with `role="status"` and `aria-live="assertive"`. This container is rendered only during the feedback phase, ensuring the screen reader announces the new content when it appears. Using `assertive` (not `polite`) ensures the feedback interrupts any current announcement, matching the existing behavior.

**Rationale**: Same pattern as InlineFeedback — proven to work with the current test suite and screen reader behavior. The live region container is conditionally rendered (not hidden/shown), so the announcement fires on mount.

**Alternatives considered**:
- **Always-mounted live region with text updates**: Would require clearing the text between rounds to avoid re-announcement. More complex state management. Rejected.
- **`aria-live="polite"`**: Would queue the announcement behind other content. Rejected — feedback is time-critical during gameplay.

---

### 7. Reduced-motion support

**Context**: FR-011 requires instant content swap when reduced-motion is preferred.

**Decision**: The content swap in GameStatus defaults to an instant replacement (no transition animation) since React's conditional rendering naturally swaps DOM content without animation. If a brief crossfade is desired for the non-reduced-motion case, it can be implemented via a CSS `@keyframes fadeIn` animation on the feedback content wrapper, with `prefers-reduced-motion: reduce` disabling it — exactly the same pattern used by the deleted InlineFeedback component.

**Rationale**: The simplest approach is no animation at all (instant swap), which satisfies both the reduced-motion and non-reduced-motion requirements. If crossfade is added later, the existing pattern from InlineFeedback.module.css serves as a template.

**Alternatives considered**:
- **React Transition Group for crossfade**: Adds a dependency for a micro-interaction. Rejected per YAGNI and constitution principle II (Simplicity).

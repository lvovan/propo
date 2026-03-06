# Tasks: Inline Answer Input

**Input**: Design documents from `/specs/023-inline-answer-input/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Included — constitution principle V (Test-First) requires acceptance tests before implementation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Project type**: Single `frontend/` directory
- **Source**: `frontend/src/`
- **Tests**: `frontend/tests/`

---

## Phase 1: Setup

**Purpose**: No new dependencies or project structure changes required. The only setup task is creating the new hook file.

- [X] T001 Create empty `useAnswerInput` hook file at `frontend/src/hooks/useAnswerInput.ts` with exported interface types from contracts/component-contracts.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The `useAnswerInput` hook is shared by all user stories — it manages `typedDigits` state, digit validation (max 3, no leading zeros), submit guard, and reset. Must be complete before any story can be wired.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T002 Write unit tests for `useAnswerInput` hook in `frontend/tests/hooks/useAnswerInput.test.ts` — test digit append, max 3 digits, leading zero rejection, backspace, empty submit guard, reset
- [X] T003 Implement `useAnswerInput` hook in `frontend/src/hooks/useAnswerInput.ts` — `useState` for `typedDigits`, `handleDigit` (max 3, no leading zeros), `handleBackspace` (slice), `handleSubmit` (guard empty, call `onSubmit` with parsed number), `reset` (clear to empty string)

**Checkpoint**: Hook tests pass. Foundation ready — user story implementation can begin.

---

## Phase 3: User Story 1 + User Story 4 — Inline Answer Typing & Desktop Keyboard Input (Priority: P1) 🎯 MVP

**Goal**: Player-typed digits appear directly in the formula's hidden slot. Desktop keyboard input (digits, Backspace, Enter) works without a visible text field. The separate answer input field is removed.

**Independent Test**: Start a round, type digits on keyboard or touch keypad, verify they appear inline in the formula where "?" was, press Enter to submit.

### Tests for US1 + US4

- [X] T004 [P] [US1] Write component tests for `FormulaDisplay` with `typedDigits` prop in `frontend/tests/components/FormulaDisplay.test.tsx` — renders "?" when `typedDigits` is empty, renders typed digits when non-empty, renders `playerAnswer` during feedback (takes precedence over `typedDigits`), applies `.pulsing` class when `isInputPhase` is true, removes `.pulsing` class when `isInputPhase` is false
- [X] T005 [P] [US4] Write component tests for `AnswerInput` keyboard handling in `frontend/tests/components/AnswerInput.test.tsx` — document-level keydown listener calls `onDigit` for 0–9, calls `onBackspace` for Backspace, calls `onSubmit` for Enter, ignores non-digit keys, does not fire callbacks when `acceptingInput` is false
- [X] T006 [P] [US1] Write integration test for inline answer round flow in `frontend/tests/integration/InlineAnswerRound.test.tsx` — start game, verify "?" in formula, type digits and verify they appear in formula, press Enter to submit, verify feedback phase shows submitted answer, verify next round resets to "?"
- [X] T007 [P] [US1] Write accessibility test for `FormulaDisplay` with pulsing border in `frontend/tests/a11y/FormulaDisplay.a11y.test.tsx` — axe-core scan during input phase (with pulsing), axe-core scan during feedback phase (no pulsing), verify `role="math"` and `aria-label` present

### Implementation for US1 + US4

- [X] T008 [P] [US1] Add pulsing orange border animation to `frontend/src/components/GamePlay/FormulaDisplay/FormulaDisplay.module.css` — add `@keyframes pulse-border` (2.5s ease-in-out, box-shadow 0 0 0 2px–4px rgba(255,160,0,0.25–0.7)), add `.pulsing` class, add base `box-shadow: 0 0 0 3px transparent` and `transition: box-shadow 0.3s ease-out` to `.hidden`, add `@media (prefers-reduced-motion: reduce)` with static orange ring fallback
- [X] T009 [US1] Update `FormulaDisplay` component in `frontend/src/components/GamePlay/FormulaDisplay/FormulaDisplay.tsx` — add `typedDigits?: string` and `isInputPhase?: boolean` props, update `hiddenValue` display logic (playerAnswer → typedDigits → "?"), conditionally apply `styles.pulsing` class to hidden span when `isInputPhase` is true
- [X] T010 [US4] Refactor `AnswerInput` in `frontend/src/components/GamePlay/AnswerInput/AnswerInput.tsx` — remove `AnswerInputDesktop` sub-component entirely, update props to `{ typedDigits, onDigit, onBackspace, onSubmit, acceptingInput }`, install document-level `keydown` listener for desktop (digits → `onDigit`, Backspace → `onBackspace`, Enter → `onSubmit`), gate listener on `acceptingInput`, render `TouchNumpad` on touch devices (pass through new props), render nothing visible on desktop (keyboard listener only)
- [X] T011 [US1] Wire `useAnswerInput` hook in `MainPage` at `frontend/src/pages/MainPage.tsx` — call `useAnswerInput({ onSubmit: handleAnswerSubmit })`, pass `typedDigits` and `isInputPhase` to `FormulaDisplay`, pass `typedDigits`/`onDigit`/`onBackspace`/`onSubmit` to `AnswerInput`, add `useEffect` to call `reset()` on round index change, update `handleSubmit` to work with hook's submit flow

**Checkpoint**: Player can type digits on desktop or touch, see them inline in formula, submit with Enter, and see feedback. No separate text field visible. Pulsing border active during input phase.

---

## Phase 4: User Story 2 + User Story 3 — Placeholder Restoration & Checkmark Button (Priority: P2)

**Goal**: "?" reappears when all digits are cleared via backspace. Touch keypad submit button shows "✔️" instead of "Go".

**Independent Test**: Type digits then backspace to clear — verify "?" reappears. On touch device, verify checkmark on submit button.

### Tests for US2 + US3

- [X] T012 [P] [US2] Write component tests for placeholder restoration in `frontend/tests/components/FormulaDisplay.test.tsx` — verify hidden position shows "?" when `typedDigits` is empty string (append to existing test file from T004)
- [X] T013 [P] [US3] Write component tests for checkmark button in `frontend/tests/components/TouchNumpad.test.tsx` — verify submit button renders "✔️" not "Go", verify tapping checkmark calls `onSubmit`, verify checkmark button is disabled/inert when `typedDigits` is empty

### Implementation for US2 + US3

- [X] T014 [P] [US2] Verify placeholder restoration logic in `useAnswerInput` hook — confirm `handleBackspace` returns `typedDigits` to empty string (which causes FormulaDisplay to show "?"). This should already work from T003; add any missing edge-case handling if needed in `frontend/src/hooks/useAnswerInput.ts`
- [X] T015 [P] [US3] Update `TouchNumpad` in `frontend/src/components/GamePlay/AnswerInput/TouchNumpad.tsx` — replace `{t('game.go')}` with literal `"✔️"` on submit button, remove internal `answer` state and answer display `<div>`, use `typedDigits`/`onDigit`/`onBackspace`/`onSubmit` props from parent, remove internal `keydown` listener (now handled by AnswerInput parent)
- [X] T016 [P] [US3] Remove `.display` styles from `frontend/src/components/GamePlay/AnswerInput/TouchNumpad.module.css` — delete `.display` class rule (answer display div is removed)

**Checkpoint**: Full feature complete. All four user stories functional and independently testable.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Validation, cleanup, and final quality checks

- [X] T017 Run `frontend/tests/` full test suite and fix any failures
- [X] T018 [P] Run quickstart.md validation — start dev server, play a full 10-round game, verify no separate text field visible, verify checkmark button, verify pulsing border, verify "?" placeholder restoration
- [X] T019 [P] Verify `prefers-reduced-motion` media query — enable reduced motion in browser settings, verify static orange ring instead of pulsing animation in `FormulaDisplay`
- [X] T020 [P] Responsive spot-check — verify formula with inline answer renders correctly on 320px and 1280px viewports

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 (T001) — BLOCKS all user stories
- **US1+US4 (Phase 3)**: Depends on Phase 2 (T002, T003) — core inline input
- **US2+US3 (Phase 4)**: Depends on Phase 2 (T002, T003) — can run in parallel with Phase 3
- **Polish (Phase 5)**: Depends on Phases 3 and 4 completion

### User Story Dependencies

- **US1 (P1) + US4 (P1)**: Combined because they share the same hook and FormulaDisplay changes. Can start after Phase 2.
- **US2 (P2)**: Placeholder restoration is inherently handled by the hook from Phase 2. Phase 4 adds verification tests and any edge-case fixes.
- **US3 (P2)**: Fully independent — only touches TouchNumpad label. Can run in parallel with US1+US4.

### Within Each Phase

- Tests MUST be written and FAIL before implementation (Test-First)
- CSS changes before component changes (T008 before T009)
- Component changes before page wiring (T009, T010 before T011)

### Parallel Opportunities

- **Phase 3**: T004, T005, T006, T007 (all tests) can run in parallel; T008 can run in parallel with tests
- **Phase 4**: T012, T013 (tests) can run in parallel; T014, T015, T016 (implementation) can run in parallel
- **Phase 5**: T018, T019, T020 can run in parallel

---

## Parallel Example: Phase 3 (US1 + US4)

```
# Launch all tests in parallel:
Task T004: "FormulaDisplay component tests"
Task T005: "AnswerInput keyboard handling tests"
Task T006: "Integration test for inline answer round flow"
Task T007: "Accessibility test for FormulaDisplay"

# Launch CSS + tests in parallel (different files):
Task T008: "Pulsing border CSS animation" (FormulaDisplay.module.css)
Task T004: "FormulaDisplay component tests" (FormulaDisplay.test.tsx)
Task T005: "AnswerInput keyboard tests" (AnswerInput.test.tsx)
```

---

## Implementation Strategy

### MVP First (US1 + US4 Only)

1. Complete Phase 1: Setup (T001)
2. Complete Phase 2: Foundational hook (T002, T003)
3. Complete Phase 3: Inline typing + desktop keyboard (T004–T011)
4. **STOP and VALIDATE**: Play a round with inline answer — digits appear in formula, Enter submits, pulsing border works
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Hook ready
2. Add US1 + US4 → Inline answer works on desktop + touch → Deploy (MVP!)
3. Add US2 → Placeholder restoration verified → Deploy
4. Add US3 → Checkmark button on touch keypad → Deploy
5. Polish → Responsive checks, reduced-motion, full test suite green

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- US1 and US4 are combined in Phase 3 because they share the hook, FormulaDisplay, and AnswerInput changes — splitting them would create artificial file conflicts
- US2 is mostly "verify the hook already works" — minimal new code
- US3 is a one-line label change plus cleanup of removed display div
- Total: 20 tasks across 5 phases
- Commit after each task or logical group

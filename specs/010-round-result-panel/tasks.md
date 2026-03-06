# Tasks: Round Result in Status Panel

**Input**: Design documents from `/specs/010-round-result-panel/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/component-contracts.md, quickstart.md

**Tests**: Included — constitution V (Test-First) requires tests for all new features.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story (US1, US2, US3)
- Exact file paths included in every task

---

## Phase 1: Foundational (Blocking Prerequisites)

**Purpose**: Extend FormulaDisplay with `playerAnswer` prop — needed by all user stories before GameStatus can swap to feedback mode (the formula area must show the answered formula when InlineFeedback is removed).

- [X] T001 Add `playerAnswer` prop tests in frontend/tests/components/FormulaDisplay.test.tsx
- [X] T002 [P] Add `playerAnswer` optional prop to FormulaDisplay in frontend/src/components/GamePlay/FormulaDisplay/FormulaDisplay.tsx

**Details for T001**: Add tests for: (1) when `playerAnswer` is provided, the hidden position shows the player's value instead of `'?'`, (2) when `playerAnswer` is undefined, behavior is unchanged (`'?'` displayed), (3) `aria-label` includes the player's answer value when provided. Tests should fail before T002 is implemented.

**Details for T002**: Add optional `playerAnswer?: number` to `FormulaDisplayProps`. In the render logic, when `playerAnswer` is provided, use it instead of `'?'` for the hidden position. Update the `aria-label` to include the answer value. All existing tests must continue to pass.

**Checkpoint**: FormulaDisplay can render answered formulas. Existing behavior unchanged when `playerAnswer` is omitted.

---

## Phase 2: User Story 1 – Feedback Displayed in Status Panel (Priority: P1) 🎯 MVP

**Goal**: After answer submission, the GameStatus panel swaps from round/score/timer to the feedback message ("✓ Correct!" or "✗ Not quite!") with round completion count and colored background. Reverts after ~1.2s.

**Independent Test**: Start a game, submit an answer, verify the status panel shows feedback with completion count, then reverts to normal content after 1.2s.

### Tests for User Story 1

> **Write these tests FIRST — they must FAIL before implementation**

- [X] T003 [P] [US1] Add feedback mode rendering tests in frontend/tests/components/GameStatus.test.tsx, assert layout-shift assertion to cover FR-010 / SC-007.
- [X] T004 [P] [US1] Add feedback mode accessibility tests in frontend/tests/components/GameStatus.test.tsx

**Details for T003**: Add tests for: (1) when `currentPhase='feedback'` and `isCorrect=true`, renders "✓" icon and "Correct!" text, (2) when `currentPhase='feedback'` and `isCorrect=false`, renders "✗" icon, "Not quite!", and "The answer was {N}", (3) renders completion count text "Round X of Y completed", (4) when `currentPhase='input'`, renders normal round/score/timer content (no feedback), (5) round/score/timer content is not visible during feedback phase, (6) countdown bar is hidden during feedback phase.

**Details for T004**: Add tests for: (1) feedback content has `role="status"` and `aria-live="assertive"`, (2) icon span has `aria-hidden="true"`, (3) axe-core accessibility check passes for both correct and incorrect feedback states.

### Implementation for User Story 1

- [X] T005 [P] [US1] Add feedback CSS classes in frontend/src/components/GamePlay/GameStatus/GameStatus.module.css
- [X] T006 [US1] Extend GameStatus props and add feedback rendering in frontend/src/components/GamePlay/GameStatus/GameStatus.tsx
- [X] T007 [US1] Update MainPage to pass feedback props to GameStatus and show FormulaDisplay during feedback in frontend/src/pages/MainPage.tsx

**Details for T005**: Add CSS classes: `.feedbackCorrect` (background `#e8f5e9`, color `#2e7d32`), `.feedbackIncorrect` (background `#ffebee`, color `#c62828`), `.feedbackContent` (flex column, centered, gap), `.feedbackIcon` (font-size 2rem), `.feedbackText` (font-size 1.2rem, font-weight 700), `.feedbackAnswer` (font-size 0.9rem, opacity 0.85), `.completionCount` (font-size 0.85rem). Add `@keyframes fadeIn` animation with `prefers-reduced-motion: reduce` override. Add responsive rules at `@media (max-width: 480px)` to scale feedback font sizes down.

**Details for T006**: Extend `GameStatusProps` with 4 new props: `currentPhase: 'input' | 'feedback'`, `isCorrect: boolean | null`, `correctAnswer: number | null`, `completedRound: number`. In the render: when `currentPhase === 'feedback'`, hide round/score/timer/CountdownBar and instead render a feedback content wrapper with `role="status"` and `aria-live="assertive"` containing: icon span (`aria-hidden="true"`) with ✓ or ✗, text span with "Correct!" or "Not quite!", conditional answer span "The answer was {N}" for incorrect, and completion count span "Round {completedRound} of {totalRounds} completed". Apply `.feedbackCorrect` or `.feedbackIncorrect` class to the root div based on `isCorrect`. When `currentPhase === 'input'`, render existing content unchanged.

**Details for T007**: Import changes: remove InlineFeedback import (but keep the file for now — deletion happens in US3). Pass new props to GameStatus: `currentPhase={gameState.currentPhase}`, `isCorrect={currentRound?.isCorrect ?? null}`, `correctAnswer={correctAnswer}`, `completedRound={gameState.currentRoundIndex + 1}`. In the formula-area div: always render FormulaDisplay; during feedback phase pass `playerAnswer={currentRound?.playerAnswer ?? undefined}` prop. Remove the conditional that swaps between FormulaDisplay and InlineFeedback (but don't delete InlineFeedback files yet).

**Checkpoint**: Status panel shows feedback after answer submission (correct + incorrect), including completion count and colored background. Formula area shows answered formula during feedback. All T003/T004 tests pass.

---

## Phase 3: User Story 2 – Replay Round Feedback (Priority: P2)

**Goal**: During replay rounds, the same feedback-in-panel behavior works with the replay completion count ("Replay X of Y completed").

**Independent Test**: Answer questions incorrectly to trigger replay, submit an answer during replay, verify the status panel shows "Replay X of Y completed".

### Tests for User Story 2

- [X] T008 [P] [US2] Add replay feedback tests in frontend/tests/components/GameStatus.test.tsx

**Details for T008**: Add tests for: (1) when `isReplay=true` and `currentPhase='feedback'`, the completion count text reads "Replay X of Y completed" instead of "Round X of Y completed", (2) feedback visual treatment (colors, icons) is identical to primary round feedback during replay, (3) correct/incorrect rendering is the same in replay mode.

### Implementation for User Story 2

- [X] T009 [US2] Update GameStatus feedback rendering to handle replay completion count in frontend/src/components/GamePlay/GameStatus/GameStatus.tsx

**Details for T009**: In the feedback rendering branch of GameStatus, check the `isReplay` prop. When `isReplay === true`, render "Replay {completedRound} of {totalRounds} completed" instead of "Round {completedRound} of {totalRounds} completed". The `totalRounds` prop already receives `replayQueue.length` from MainPage when in replay mode (this is existing behavior). No changes needed in MainPage — it already passes `totalRounds` correctly for both modes.

**Checkpoint**: Replay rounds show "Replay X of Y completed" in the status panel. All T008 tests pass.

---

## Phase 4: User Story 3 – Remove InlineFeedback (Priority: P2)

**Goal**: Delete the InlineFeedback component entirely. Verify that no separate popups, banners, or overlays appear anywhere — all feedback is exclusively in the status panel.

**Independent Test**: Play a full 10-round game. Verify feedback only appears in the status panel, never in a separate element. Verify no dead InlineFeedback code remains.

### Implementation for User Story 3

- [X] T010 [P] [US3] Delete InlineFeedback component files: frontend/src/components/GamePlay/InlineFeedback/InlineFeedback.tsx and frontend/src/components/GamePlay/InlineFeedback/InlineFeedback.module.css
- [X] T011 [P] [US3] Delete InlineFeedback test file: frontend/tests/components/InlineFeedback.test.tsx
- [X] T012 [US3] Remove any remaining InlineFeedback import/reference from frontend/src/pages/MainPage.tsx

**Details for T010**: Delete both files. The InlineFeedback directory can be removed entirely if empty.

**Details for T011**: Delete the test file. The 6 tests in this file are no longer applicable — the feedback rendering is now tested via GameStatus.test.tsx (T003/T004/T008).

**Details for T012**: Verify and remove any remaining `import InlineFeedback` statement from MainPage.tsx. Also verify there are no other files importing InlineFeedback (search the codebase). After this task, `npm run build` must succeed with no dead import errors.

**Checkpoint**: InlineFeedback is fully removed. Build succeeds. No feedback appears outside the status panel.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final validation across all stories, accessibility audit, and quickstart verification.

- [X] T013 [P] Add axe-core accessibility test for GameStatus feedback mode in frontend/tests/a11y/accessibility.test.tsx
- [X] T014 Run full test suite and verify all tests pass: `cd frontend && npm test`
- [X] T015 Run build and verify no errors: `cd frontend && npm run build`
- [X] T016 Run quickstart.md manual validation per specs/010-round-result-panel/quickstart.md

**Details for T013**: Add an axe-core accessibility test that renders GameStatus in feedback mode (both correct and incorrect states) and asserts no accessibility violations. Follow the existing pattern in the accessibility test file.

**Details for T016**: Follow the 6-step verification process in quickstart.md to manually validate: (1) correct answer shows green panel with "✓ Correct!" + completion count, (2) panel reverts after ~1.2s, (3) incorrect answer shows red panel with "✗ Not quite!" + correct answer + completion count, (4) all 10 rounds show feedback in the same position, (5) replay rounds show "Replay X of Y completed", (6) formula area shows answered formula during feedback.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 1)**: No dependencies — can start immediately
- **US1 (Phase 2)**: Depends on Phase 1 (FormulaDisplay `playerAnswer` prop)
- **US2 (Phase 3)**: Depends on Phase 2 (GameStatus feedback mode must exist)
- **US3 (Phase 4)**: Depends on Phase 2 (MainPage must no longer use InlineFeedback for rendering)
- **Polish (Phase 5)**: Depends on all previous phases

### Within Each Phase

- Tests (T003, T004, T008) MUST be written and FAIL before their implementation tasks
- CSS (T005) can proceed in parallel with tests
- Component implementation (T006) depends on CSS (T005) and tests (T003, T004)
- Orchestrator update (T007) depends on component implementation (T006)
- Deletion tasks (T010, T011) can run in parallel with each other

### Parallel Opportunities

- T001 + T002 can run in parallel (different files)
- T003 + T004 + T005 can run in parallel (T003/T004 are tests, T005 is CSS — all different files)
- T008 can run in parallel with T010 + T011 (different files, but T009 depends on T008)
- T010 + T011 can run in parallel (independent file deletions)
- T013 can start as soon as Phase 2 is complete

---

## Parallel Example: User Story 1

```bash
# Batch 1: Write tests + CSS in parallel (3 tasks, 2 files)
Task T003: "Add feedback mode rendering tests in GameStatus.test.tsx"
Task T004: "Add feedback mode accessibility tests in GameStatus.test.tsx"
Task T005: "Add feedback CSS classes in GameStatus.module.css"

# Batch 2: Implement component (depends on T003, T004, T005)
Task T006: "Extend GameStatus props and add feedback rendering in GameStatus.tsx"

# Batch 3: Integrate (depends on T006)
Task T007: "Update MainPage to pass feedback props and show FormulaDisplay during feedback"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: FormulaDisplay `playerAnswer` prop
2. Complete Phase 2: GameStatus feedback mode + MainPage integration
3. **STOP and VALIDATE**: Test US1 independently — submit answers and verify panel feedback
4. This alone delivers the core value: feedback in the status panel

### Incremental Delivery

1. Phase 1 → FormulaDisplay ready
2. Phase 2 → US1 complete → Feedback works for primary rounds (MVP!)
3. Phase 3 → US2 complete → Replay rounds show correct completion count
4. Phase 4 → US3 complete → InlineFeedback removed, no dead code
5. Phase 5 → Polish → Accessibility audit, full validation

### Scope Summary

- **Total tasks**: 16
- **Phase 1 (Foundational)**: 2 tasks
- **Phase 2 (US1 - MVP)**: 5 tasks
- **Phase 3 (US2)**: 2 tasks
- **Phase 4 (US3)**: 3 tasks
- **Phase 5 (Polish)**: 4 tasks

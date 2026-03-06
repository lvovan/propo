# Tasks: Score Summary Actions

**Input**: Design documents from `/specs/001-score-summary-actions/`
**Prerequisites**: plan.md (required), spec.md (required for user stories)

## Phase 1: Setup (Shared Infrastructure)

- [ ] T001 [P] Ensure frontend/src/components/GamePlay/ScoreSummary/ exists per plan.md
- [ ] T002 [P] Ensure frontend/tests/components/GamePlay/ScoreSummary/ exists for test placement

---

## Phase 2: Foundational (Blocking Prerequisites)

- [ ] T003 [P] Confirm ScoreSummary.tsx and ScoreSummary.module.css are under version control
- [ ] T004 [P] Ensure test framework (Vitest, React Testing Library, axe-core) is configured in frontend/

---

## Phase 3: User Story 1 - Quick Access to Actions (Priority: P1) 🎯 MVP

**Goal**: Move "Play again" and "Back to menu" buttons above the summary table for immediate access

**Independent Test**: After a game ends, both action buttons are visible above the summary table without scrolling

### Implementation for User Story 1

- [ ] T005 [P] [US1] Refactor ScoreSummary layout to render action buttons above the summary table in frontend/src/components/GamePlay/ScoreSummary/ScoreSummary.tsx
- [ ] T006 [P] [US1] Update ScoreSummary.module.css to support new layout and maintain responsive design in frontend/src/components/GamePlay/ScoreSummary/ScoreSummary.module.css
- [ ] T007 [US1] Update aria-labels and tab order for accessibility in frontend/src/components/GamePlay/ScoreSummary/ScoreSummary.tsx
- [ ] T008 [US1] Add/Update test: verify both buttons are visible above the table and accessible in frontend/tests/components/GamePlay/ScoreSummary/ScoreSummary.test.tsx

---

## Phase 4: User Story 2 - Optimized Header Space (Priority: P2)

**Goal**: Reduce vertical space used by "Game Over!" and "Total Score" labels

**Independent Test**: Header area uses less vertical space; more summary content visible without scrolling

### Implementation for User Story 2

- [ ] T009 [P] [US2] Refactor ScoreSummary header to condense or reposition "Game Over!" and "Total Score" in frontend/src/components/GamePlay/ScoreSummary/ScoreSummary.tsx
- [ ] T010 [P] [US2] Update ScoreSummary.module.css for compact header styles in frontend/src/components/GamePlay/ScoreSummary/ScoreSummary.module.css
- [ ] T011 [US2] Add/Update test: verify header space is reduced and content is visible on small screens in frontend/tests/components/GamePlay/ScoreSummary/ScoreSummary.test.tsx

---

## Final Phase: Polish & Cross-Cutting Concerns

- [ ] T012 [P] Update documentation for ScoreSummary changes in frontend/README.md
- [ ] T013 [P] Refactor and clean up ScoreSummary.tsx and ScoreSummary.module.css for maintainability
- [ ] T014 [P] Run axe-core accessibility audit for ScoreSummary in frontend/tests/components/GamePlay/ScoreSummary/ScoreSummary.a11y.test.tsx

---

## Dependencies & Execution Order

- Setup (Phase 1): No dependencies
- Foundational (Phase 2): Depends on Setup
- User Story 1 (Phase 3): Depends on Foundational
- User Story 2 (Phase 4): Depends on Foundational (can run in parallel with US1 if team allows)
- Polish: Depends on all user stories

### Parallel Execution Examples

- T005, T006, T007, T008 (US1) can be worked on in parallel by different devs (different files)
- T009, T010, T011 (US2) can be worked on in parallel
- T012, T013, T014 (Polish) can be parallelized after stories complete

## Implementation Strategy

- MVP: Complete Phase 1, Phase 2, and User Story 1 (T001–T008)
- Incremental: Add User Story 2 (T009–T011) after MVP
- Polish: Complete T012–T014 after all stories

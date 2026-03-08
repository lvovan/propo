# Tasks: percentageOfWhole Target Selection Fix

**Input**: Design documents from `/specs/035-percentage-target-fix/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, quickstart.md ✅

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: No new project setup needed — this feature modifies existing files only. Phase is empty.

*(No tasks — the project is already initialized and the files to modify exist.)*

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Restructure the pool builder to produce per-target sub-pools. This MUST be complete before any user story work.

**⚠️ CRITICAL**: The pool return type change affects the `Pools` interface, `buildAllPools()`, `generateFormulaByType()`, and `generatePercentageOfWholeFormula()`. All callers must be updated atomically.

- [X] T001 Add `PercentageOfWholePoolSet` interface and `PercentageTarget` type alias to `frontend/src/services/formulaGenerator.ts` — define `interface PercentageOfWholePoolSet { first: Triple[]; second: Triple[]; combined: Triple[]; }` and `type PercentageTarget = 'first' | 'second' | 'combined';` near the existing `FRIENDLY_WHOLE_PERCENTAGES` constant
- [X] T002 Modify `buildPercentageOfWholePool()` in `frontend/src/services/formulaGenerator.ts` to return `PercentageOfWholePoolSet` instead of `Triple[]` — keep the same `x,y,z ∈ [1..20]` loop with `10 ≤ total ≤ 50`, but check all three conditions per iteration: push to `first` if `x/total×100 ∈ friendly`, push to `second` if `y/total×100 ∈ friendly`, push to `combined` if `(x+y)/total×100 ∈ friendly`
- [X] T003 Update the `Pools` interface in `frontend/src/services/formulaGenerator.ts` — change `percentageOfWhole: Triple[]` to `percentageOfWhole: PercentageOfWholePoolSet`

**Checkpoint**: `buildPercentageOfWholePool()` returns the new type and `Pools` compiles. Generator function is not yet updated (will break type-check temporarily until T004).

---

## Phase 3: User Story 1 — Random Target Selection (Priority: P1) 🎯 MVP

**Goal**: The generator uniformly selects among first, second, and combined targets for each `percentageOfWhole` question, producing balanced variety across games.

**Independent Test**: Generate 90+ questions across 30+ seeds and verify each target type appears ≥20% of the time.

### Implementation for User Story 1

- [X] T004 [US1] Rewrite `generatePercentageOfWholeFormula()` in `frontend/src/services/formulaGenerator.ts` — change parameter from `pool: Triple[]` to `poolSet: PercentageOfWholePoolSet`. New logic: (1) pick target uniformly via `const targets: PercentageTarget[] = ['first', 'second', 'combined']; const target = targets[Math.floor(randomFn() * 3)];`, (2) pick triple from `poolSet[target]` via `pickRandom()`, (3) pick template via `pickRandom()`, (4) compute `values[]`, `correctAnswer`, and `wordProblemKey` per target using the existing switch/case (keep swap logic for 'second', keep `.combined` suffix for 'combined')
- [X] T005 [US1] Update `buildPercentageOfWholePool` tests in `frontend/tests/services/formulaGenerator.test.ts` — update `buildPercentageOfWholePool` test block: change assertions to expect an object with `.first`, `.second`, `.combined` arrays; verify each sub-pool is non-empty; verify all triples in `.first` satisfy `a/c×100 ∈ {10,20,25,50,75}`, all in `.second` satisfy `b/c×100 ∈ friendly`, all in `.combined` satisfy `(a+b)/c×100 ∈ friendly`; verify each sub-pool covers all 5 friendly percentages
- [X] T006 [US1] Tighten target distribution test in `frontend/tests/services/formulaGenerator.test.ts` — update the 'all 3 target variants appear' test: track `firstCount`, `secondCount`, and `combinedCount` separately; detect 'second' by checking if `values[0]` doesn't match pool `a` (or by checking swapped values pattern); assert each of the 3 targets appears ≥20% of the time over 200 seeds (replacing the current >2% threshold for combined)
- [X] T007 [US1] Verify all friendly percentages appear as answers in `frontend/tests/services/formulaGenerator.test.ts` — update existing 'correctAnswer is always a friendly percentage' test to also collect all distinct `correctAnswer` values and assert all 5 friendly percentages {10, 20, 25, 50, 75} appear across 200 seeded games

**Checkpoint**: All `percentageOfWhole` tests pass. Target distribution is balanced (each ≥20%). `npm test -- --run formulaGenerator` green.

---

## Phase 4: User Story 2 — Friendly Percentage Constraint (Priority: P1)

**Goal**: Every generated answer is guaranteed to be in {10, 20, 25, 50, 75}. This is enforced by pool construction (each sub-pool only contains valid triples for its target).

**Independent Test**: Generate 500+ questions and verify 100% have answers in {10, 20, 25, 50, 75}.

### Implementation for User Story 2

- [X] T008 [US2] Verify constraint enforcement is by-construction in `frontend/src/services/formulaGenerator.ts` — confirm that `generatePercentageOfWholeFormula()` does NOT need runtime fallback logic (no "try another target" or "regenerate counts") because each sub-pool is pre-filtered to only contain triples where the target-specific percentage is friendly. Remove the old `validTargets` array logic that conditionally added 'second' and 'combined' — the new design guarantees validity by picking from the correct sub-pool
- [X] T009 [US2] Add exhaustive constraint test in `frontend/tests/services/formulaGenerator.test.ts` — add test 'percentageOfWhole: all answers are friendly percentages across 500 games': generate 500 seeded games, collect every `percentageOfWhole` formula, assert `correctAnswer ∈ {10, 20, 25, 50, 75}` for every single one (0 exceptions)

**Checkpoint**: Constraint test passes with 0 violations across 500 games. No runtime fallback code needed.

---

## Phase 5: User Story 3 — Deterministic Seeded Selection (Priority: P2)

**Goal**: Same seed always produces identical `percentageOfWhole` questions (same target, same wording, same answer).

**Independent Test**: Run same seed twice and `deepEqual` the results.

### Implementation for User Story 3

- [X] T010 [US3] Verify determinism test still passes in `frontend/tests/services/formulaGenerator.test.ts` — the existing 'deterministic with seeded random' test (seed=42, compare two runs) should already pass since `randomFn()` is called exactly 3 times per formula in the new implementation. Run the test and confirm. If needed, add a second determinism test with a different seed (e.g., seed=12345) to strengthen coverage
- [X] T011 [US3] Add multi-seed determinism test in `frontend/tests/services/formulaGenerator.test.ts` — add test 'percentageOfWhole: deterministic across 50 seeds': for each seed 0..49, generate formulas twice with the same seed, filter to `percentageOfWhole`, assert `JSON.stringify(run1) === JSON.stringify(run2)`

**Checkpoint**: Determinism tests pass for all 50 seeds. Seeded games are provably reproducible.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and cleanup

- [X] T012 Run full test suite via `cd frontend && npm test -- --run` and verify all tests pass (not just formulaGenerator tests)
- [X] T013 Run quickstart.md validation — execute the verification steps from `specs/035-percentage-target-fix/quickstart.md`: run `npm test -- --run formulaGenerator`, confirm all pass

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: Empty — no tasks
- **Phase 2 (Foundational)**: T001 → T002 → T003 — sequential (each builds on prior type change)
- **Phase 3 (US1)**: Depends on Phase 2 completion. T004 first (generator rewrite), then T005–T007 can run in parallel (all are test updates)
- **Phase 4 (US2)**: Depends on T004 (generator rewrite). T008 → T009 sequential
- **Phase 5 (US3)**: Depends on T004 (generator rewrite). T010 → T011 sequential
- **Phase 6 (Polish)**: Depends on all prior phases. T012 → T013 sequential

### User Story Dependencies

- **US1 (P1)**: Depends on Phase 2 only — can start after T003
- **US2 (P1)**: Depends on T004 (from US1) — the generator must be rewritten before constraint can be verified
- **US3 (P2)**: Depends on T004 (from US1) — determinism check needs the new generator

### Parallel Opportunities

After T004 is complete:
- T005, T006, T007 (US1 tests) can run in parallel
- T008 (US2) can run in parallel with US1 tests
- T010 (US3) can run in parallel with US1 tests

### Within Each User Story

- Implementation before tests (T004 before T005–T007)
- Core verification before exhaustive tests (T008 before T009, T010 before T011)

---

## Parallel Example: After T004

```
# These can all run simultaneously after T004 is complete:
T005: Update pool builder tests (frontend/tests/services/formulaGenerator.test.ts)
T006: Tighten distribution test (frontend/tests/services/formulaGenerator.test.ts)
T007: Verify all friendly percentages appear (frontend/tests/services/formulaGenerator.test.ts)
T008: Verify constraint enforcement (frontend/src/services/formulaGenerator.ts)
T010: Verify determinism test (frontend/tests/services/formulaGenerator.test.ts)
```

Note: T005–T007 and T010 all modify the same test file, so true parallelism requires care. In practice, execute T005 → T006 → T007 sequentially within the test file, but T008 (production file) can run in parallel with any test task.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2: T001 → T002 → T003 (type + pool restructure)
2. Complete T004: Rewrite generator function
3. Complete T005–T007: Validate distribution
4. **STOP and VALIDATE**: Run `npm test -- --run formulaGenerator` — all green means MVP is done
5. The core bug is fixed at this point

### Incremental Delivery

1. Phase 2 → Foundation ready (new pool type)
2. US1 (T004–T007) → Target selection is balanced → MVP!
3. US2 (T008–T009) → Exhaustive constraint validation → High confidence
4. US3 (T010–T011) → Determinism proven → Competition-ready
5. Phase 6 (T012–T013) → Full suite green → Ship it

---

## Notes

- **1 production file** changed: `frontend/src/services/formulaGenerator.ts`
- **1 test file** changed: `frontend/tests/services/formulaGenerator.test.ts`
- No UI, component, i18n, or type definition changes needed
- The `Formula` interface and word problem templates (including `.combined` variants) already exist and work correctly
- The `values[]` swap logic for 'second' target already exists and is correct
- Seeded output values WILL change (same seed produces different questions than before the fix) — this is expected and acceptable

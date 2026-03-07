# Tasks: Word Problem Variations

**Input**: Design documents from `/specs/031-word-problem-variations/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Included per constitution Principle V (Test-First). Tests are written first and must fail before implementation.

**Organization**: Tasks grouped by user story. US1 and US2 are already implemented (feature 030) — only US3 (combined variant) requires new work.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story (US3) — omitted for Setup/Polish phases
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: No setup needed — existing project structure is sufficient. US1 and US2 are already implemented.

**Note**: FR-001, FR-002, FR-003, FR-004, FR-008 are satisfied by existing code from feature 030. No tasks needed.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Combined template constant and English i18n keys must exist before variant logic can be implemented

**⚠️ CRITICAL**: US3 implementation depends on these being complete

- [X] T001 Add 58 combined i18n template keys (`story.multiItemRatio.{scene}.combined`) to English locale, each mirroring the existing single-item template but asking about "everything" or "all the [things]" instead of "just the [item]" in `frontend/src/i18n/locales/en.ts`
- [X] T002 Add `MULTI_ITEM_RATIO_COMBINED_TEMPLATES` constant array (58 entries, 1:1 paired with `MULTI_ITEM_RATIO_TEMPLATES`, same unit keys, keys suffixed with `.combined`) in `frontend/src/services/formulaGenerator.ts`

**Checkpoint**: Combined template constant and English keys exist — variant logic can be implemented

---

## Phase 3: User Story 3 — Combined-Item Questions in Multi-Item Ratio Problems (Priority: P2)

**Goal**: Multi-item ratio problems can ask for the total of both item types combined. The variant is selected randomly (~33% combined, ~33% single-first, ~33% single-second). Combined answers must be ≤ 999.

**Independent Test**: Generate 100 games and verify that the "combined" variant appears in at least 15% of multi-item ratio problems, all combined answers are ≤ 999, and determinism is preserved.

### Tests for User Story 3

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T003 [P] [US3] Write variant distribution test: over 100 seeds, all 3 variants (single-first, single-second, combined) appear and no variant exceeds 60% of occurrences in `frontend/tests/services/formulaGenerator.test.ts`
- [X] T004 [P] [US3] Write combined answer validation test: for all multiItemRatio formulas with combined templates across 50 seeds, correctAnswer equals `(values[0]*values[1]) + (values[2]*values[3])` and is ≤ 999 in `frontend/tests/services/formulaGenerator.test.ts`
- [X] T005 [P] [US3] Write combined determinism test: same seed produces identical variant selection and answers across two runs in `frontend/tests/services/formulaGenerator.test.ts`
- [X] T006 [P] [US3] Write combined template key test: every combined formula has a `wordProblemKey` ending in `.combined` in `frontend/tests/services/formulaGenerator.test.ts`

### Implementation for User Story 3

- [X] T007 [US3] Modify `generateMultiItemRatioFormula()` to use 3-way variant selection: replace binary swap (`randomFn() < 0.5`) with 3-way split (`[0,0.33)` → single-first, `[0.33,0.67)` → single-second, `[0.67,1.0)` → combined); for combined variant use `MULTI_ITEM_RATIO_COMBINED_TEMPLATES` at matched index, answer = `(a×b)+(c×d)`, validate ≤ 999 with fallback to single-first in `frontend/src/services/formulaGenerator.ts`

**Checkpoint**: Combined variant works end-to-end — all 3 variants appear with correct templates and answers.

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: i18n for remaining 5 languages, final validation

- [X] T008 [P] Add 58 combined i18n template keys to French locale in `frontend/src/i18n/locales/fr.ts`
- [X] T009 [P] Add 58 combined i18n template keys to Spanish locale in `frontend/src/i18n/locales/es.ts`
- [X] T010 [P] Add 58 combined i18n template keys to Japanese locale in `frontend/src/i18n/locales/ja.ts`
- [X] T011 [P] Add 58 combined i18n template keys to German locale in `frontend/src/i18n/locales/de.ts`
- [X] T012 [P] Add 58 combined i18n template keys to Portuguese locale in `frontend/src/i18n/locales/pt.ts`
- [X] T013 Run quickstart.md validation: verify all files exist, all 58 combined templates present in all 6 locales, MULTI_ITEM_RATIO_COMBINED_TEMPLATES length matches MULTI_ITEM_RATIO_TEMPLATES length in `frontend/src/services/formulaGenerator.ts`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 2)**: No dependencies — can start immediately
- **US3 (Phase 3)**: Depends on Phase 2 (T001, T002) completion
- **Polish (Phase 4)**: Depends on Phase 3 completion (implementation must be working before adding remaining languages)

### Within Each Phase

1. Tests (T003–T006) MUST be written and FAIL before implementation (T007)
2. T001 and T002 can run in parallel
3. T008–T012 can all run in parallel (independent locale files)

### Parallel Opportunities

Within Phase 2: T001, T002 can run in parallel (different files)
Within US3 tests: T003, T004, T005, T006 can all run in parallel (same file, independent test blocks)
Within Phase 4: T008–T012 can all run in parallel (independent locale files)

---

## Parallel Example: Phase 2 (Foundational)

```
# Both tasks can run simultaneously — different files:
T001: frontend/src/i18n/locales/en.ts
T002: frontend/src/services/formulaGenerator.ts
```

## Parallel Example: Phase 4 (i18n)

```
# All 5 tasks can run simultaneously — each targets a different locale file:
T008: frontend/src/i18n/locales/fr.ts
T009: frontend/src/i18n/locales/es.ts
T010: frontend/src/i18n/locales/ja.ts
T011: frontend/src/i18n/locales/de.ts
T012: frontend/src/i18n/locales/pt.ts
```

---

## Implementation Strategy

### MVP First (US3 Only)

1. Complete Phase 2: Foundational (T001–T002)
2. Complete Phase 3: US3 tests then implementation (T003–T007)
3. **STOP and VALIDATE**: Combined variant appears, answers valid, deterministic
4. Deploy/demo — all 3 problem variants working

### Incremental Delivery

1. Foundational → English combined templates + constant ready
2. Add US3 → Combined variant working (English only) ✅
3. Polish → All 6 languages complete ✅

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- US1 (percentageOfWhole shuffle) and US2 (multiItemRatio target swap) are ALREADY IMPLEMENTED in feature 030 — no tasks needed
- Only US3 (combined variant) requires new work
- The combined variant adds 58 new i18n keys per language (348 total across 6 languages)
- Constitution Principle V: all tests written first (red), then implementation (green)
- Max combined answer: 8×50 + 8×50 = 800, always ≤ 999, but code defensively with fallback

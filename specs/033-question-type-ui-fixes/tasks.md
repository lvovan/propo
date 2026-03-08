# Tasks: Question Types & UI Fixes

**Input**: Design documents from `/specs/033-question-type-ui-fixes/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Paths relative to repository root (`frontend/src/...`)

---

## Phase 1: Foundational (Blocking Prerequisites)

**Purpose**: Remove `ratio` from the type system — MUST complete before any user story work since the type union and `PURE_NUMERIC_TYPES` array are imported across all modified files

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T001 Remove `'ratio'` from the `QuestionType` union type in `frontend/src/types/game.ts`
- [x] T002 Remove `'ratio'` from the `PURE_NUMERIC_TYPES` array in `frontend/src/types/game.ts`

**Checkpoint**: TypeScript compiler errors now flag every file referencing the removed `ratio` member. All subsequent phases resolve those errors and build on the narrowed type.

---

## Phase 2: User Story 1 — Remove Ratio Question Type (Priority: P1) 🎯 MVP

**Goal**: No new games generate `ratio` questions. Formula generator distributes 5 numeric rounds across `percentage` and `fraction` only. Legacy `ratio` records in localStorage are displayed as fraction format and analyzed as `fraction` in Improve mode.

**Independent Test**: Start a game in any mode, complete all 10 rounds, verify no round displays A : B = C : D. View a past game summary with historical `ratio` rounds and verify they render as A/B = C/D.

### Implementation

- [x] T003 [US1] Remove `buildRatioPool()` function, `generateRatioFormula()` function, `'ratio'` case from `generateFormulaByType()` switch, and `ratio` pool from `buildAllPools()` in `frontend/src/services/formulaGenerator.ts`
- [x] T004 [US1] Update numeric distribution in `generateFormulas()` from `['percentage', 'percentage', 'ratio', 'ratio', 'fraction']` to `['percentage', 'percentage', 'fraction', 'fraction', pickRandom(PURE_NUMERIC_TYPES, randomFn)]` in `frontend/src/services/formulaGenerator.ts`
- [x] T005 [US1] Update `generateImproveFormulas()` to remove any `ratio` references in `frontend/src/services/formulaGenerator.ts`
- [x] T006 [P] [US1] Add `'ratio'` → `'fraction'` legacy mapping alongside existing `'ruleOfThree'` → `'complexExtrapolation'` mapping in `frontend/src/services/challengeAnalyzer.ts`
- [x] T007 [P] [US1] Map legacy `'ratio'` case to use `fraction` rendering (A/B = C/D) in `frontend/src/components/GamePlay/FormulaDisplay/FormulaDisplay.tsx`
- [x] T008 [P] [US1] Map legacy `'ratio'` case to use `fraction` format string in `frontend/src/components/GamePlay/ScoreSummary/ScoreSummary.tsx`
- [x] T009 [P] [US1] Remove `ratio` entry from `CATEGORY_LABEL_KEYS` Record in `frontend/src/components/GamePlay/ModeSelector/ModeSelector.tsx`
- [x] T010 [US1] Remove `'questionType.ratio'` key from all 6 locale files in `frontend/src/i18n/locales/{en,de,es,fr,pt,ja}.ts`
- [x] T011 [US1] Update unit tests in `frontend/tests/services/formulaGenerator.test.ts`: assert no generated formula has `type: 'ratio'`; verify 5 numeric rounds use only `percentage` and `fraction`
- [x] T012 [P] [US1] Add legacy `'ratio'` → `'fraction'` mapping test in `frontend/tests/services/challengeAnalyzer.test.ts`
- [x] T013 [P] [US1] Add legacy `'ratio'` round renders as fraction format test in `frontend/tests/components/FormulaDisplay.test.tsx`

**Checkpoint**: Ratio question type fully removed. No new games generate ratio rounds. Legacy records display correctly. This is the MVP.

---

## Phase 3: User Story 2 — Enhanced percentageOfWhole with Multi-Target Support (Priority: P1)

**Goal**: The `percentageOfWhole` generator randomly targets one of three options (first item, second item, or sum of both). Combined-target rounds use `.combined`-suffixed i18n template keys. Answer is always a friendly integer percentage. Target selection is deterministic with seeded random.

**Independent Test**: Generate 100+ `percentageOfWhole` formulas and verify all three target variants appear (first, second, combined). Verify every `correctAnswer` is in {10, 20, 25, 50, 75}. Verify combined-target formulas use `.combined` suffixed `wordProblemKey`.

### Implementation

- [x] T014 [US2] Rewrite `generatePercentageOfWholeFormula()` to support 3-target selection with fallback per contract in `contracts/interfaces.md` in `frontend/src/services/formulaGenerator.ts`
- [x] T015 [US2] Add `.combined`-suffixed i18n keys for all 21 `percentageOfWhole` templates in `frontend/src/i18n/locales/en.ts`
- [x] T016 [P] [US2] Add `.combined`-suffixed i18n keys for `percentageOfWhole` templates in `frontend/src/i18n/locales/de.ts`
- [x] T017 [P] [US2] Add `.combined`-suffixed i18n keys for `percentageOfWhole` templates in `frontend/src/i18n/locales/es.ts`
- [x] T018 [P] [US2] Add `.combined`-suffixed i18n keys for `percentageOfWhole` templates in `frontend/src/i18n/locales/fr.ts`
- [x] T019 [P] [US2] Add `.combined`-suffixed i18n keys for `percentageOfWhole` templates in `frontend/src/i18n/locales/pt.ts`
- [x] T020 [P] [US2] Add `.combined`-suffixed i18n keys for `percentageOfWhole` templates in `frontend/src/i18n/locales/ja.ts`
- [x] T021 [US2] Add unit tests for multi-target selection in `frontend/tests/services/formulaGenerator.test.ts`: verify all 3 target variants appear across 100+ generations; verify every `correctAnswer` is in {10, 20, 25, 50, 75}; verify deterministic output with seeded random; verify combined target uses `.combined` key suffix

**Checkpoint**: percentageOfWhole questions now randomly target first item, second item, or combined. All answers are valid friendly percentages. Seeded games produce deterministic results.

---

## Phase 4: User Story 3 — Shared-Link Landing Page Dark Mode Fix (Priority: P2)

**Goal**: SharedResultPage uses CSS module with `@media (prefers-color-scheme: dark)` overrides instead of hardcoded inline styles. All text meets WCAG AA contrast in both modes.

**Independent Test**: Open a shared result URL with system dark mode enabled. Verify the result card, text, and button are readable. Switch to light mode and verify readability is maintained.

### Implementation

- [x] T022 [US3] Create `frontend/src/pages/SharedResultPage.module.css` with theme-aware styles per contract in `contracts/shared-result-styles.md`, including `@media (prefers-color-scheme: dark)` overrides for card background, title color, and seed text color
- [x] T023 [US3] Replace all inline styles in `frontend/src/pages/SharedResultPage.tsx` with CSS module class references (`styles.page`, `styles.title`, `styles.card`, `styles.playerName`, `styles.score`, `styles.seed`, `styles.playButton`); import the CSS module
- [x] T024 [US3] Update tests in `frontend/tests/pages/SharedResultPage.test.tsx` to verify component renders with CSS module classes instead of inline styles
- [x] T025 [US3] Update axe-core tests in `frontend/tests/a11y/SharedResultPage.a11y.test.tsx` to verify accessibility passes (contrast requirements met)

**Checkpoint**: SharedResultPage is fully readable in both light and dark modes. WCAG AA contrast verified.

---

## Phase 5: User Story 4 — Home Page Header Removal (Priority: P3)

**Goal**: The "Ready to play?" heading and "Answer 10 proportion questions…" subtitle are removed from the home page. A visually-hidden heading or existing landmark ensures screen reader accessibility. i18n keys and CSS classes are cleaned up.

**Independent Test**: Open the home page on a 320px viewport. Verify neither heading nor subtitle appears. Verify mode-selection buttons are visible without scrolling.

### Implementation

- [x] T026 [US4] Remove `<h1 className={styles.readyHeading}>` and `<p className={styles.instructions}>` elements from the `status === 'not-started'` block in `frontend/src/pages/MainPage.tsx`; add a visually-hidden `<h1>` for screen reader accessibility
- [x] T027 [US4] Remove `.readyHeading` and `.instructions` CSS classes from `frontend/src/pages/MainPage.module.css`
- [x] T028 [US4] Remove `'game.readyToPlay'` and `'game.instructions'` keys from all 6 locale files in `frontend/src/i18n/locales/{en,de,es,fr,pt,ja}.ts`
- [x] T029 [US4] Add test assertion verifying the home page has a visually-hidden accessible heading (role heading or `<h1>`) after the visible heading is removed, in `frontend/tests/pages/MainPage.test.tsx` or `frontend/tests/a11y/MainPage.a11y.test.tsx`

**Checkpoint**: Home page shows mode-selection buttons and scores without the header text. Screen reader landmark or visually-hidden heading is present and verified by test.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final verification across all user stories

- [x] T030 [P] Run full test suite (`npm test`) and verify no regressions in any game mode
- [x] T031 [P] Run TypeScript type check (`npx tsc --noEmit`) and verify zero errors
- [x] T032 Verify `npm run build` completes successfully with no warnings

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 1)**: No dependencies — start immediately
- **US1 (Phase 2)**: Depends on Phase 1 (type system change enables compiler-guided removal)
- **US2 (Phase 3)**: Depends on Phase 2 (T003–T005 remove ratio from generator; T014 modifies the same file)
- **US3 (Phase 4)**: No dependencies on other phases — can run in parallel with Phase 2/3
- **US4 (Phase 5)**: No dependencies on other phases — can run in parallel with Phase 2/3/4
- **Polish (Phase 6)**: Depends on Phases 2, 3, 4, and 5

### User Story Dependencies

- **US1 (P1)**: Depends on Foundational only — blocks US2 (same file edits)
- **US2 (P1)**: Depends on US1 (generator file edits must be sequential)
- **US3 (P2)**: Fully independent — can start after Foundational or in parallel
- **US4 (P3)**: Fully independent — can start after Foundational or in parallel

### Within Each Phase

- Tasks marked [P] within the same phase can run in parallel
- Non-[P] tasks must run sequentially as listed

### Parallel Opportunities

- T006–T009 (legacy ratio mapping across 4 different files) can all run in parallel
- T012–T013 (ratio legacy tests in different test files) can run in parallel
- T016–T020 (combined i18n keys for 5 non-English locales) can all run in parallel
- T022 (CSS module) can run in parallel with Phase 2 and 3 work (different file)
- Phase 4 and Phase 5 can run entirely in parallel with each other and with Phases 2–3

---

## Parallel Example: Phase 2 (US1)

```
# Batch 1 — sequential (same file):
T003: Remove ratio pool/generator/dispatcher from formulaGenerator.ts
T004: Update numeric distribution in generateFormulas()
T005: Update generateImproveFormulas()

# Batch 2 — all parallel (different files):
T006: challengeAnalyzer.ts legacy mapping
T007: FormulaDisplay.tsx legacy mapping
T008: ScoreSummary.tsx legacy mapping
T009: ModeSelector.tsx CATEGORY_LABEL_KEYS

# Batch 3 — sequential (locale cleanup touches same files as Phase 3):
T010: Remove questionType.ratio from all locales

# Batch 4 — parallel (different test files):
T011: formulaGenerator.test.ts updates
T012: challengeAnalyzer.test.ts updates
T013: FormulaDisplay.test.tsx updates
```

---

## Implementation Strategy

### MVP First (US1 Only)

1. Complete Phase 1: Foundational (T001–T002)
2. Complete Phase 2: US1 (T003–T013)
3. **STOP and VALIDATE**: Run test suite, verify no ratio rounds generated, legacy records display correctly
4. Deploy/demo — players never see ratio questions

### Incremental Delivery

1. Phase 1 → Type system narrowed
2. Phase 2 → MVP: ratio removed entirely
3. Phase 3 → Enhanced percentageOfWhole with multi-target
4. Phase 4 → Shared-link dark mode fix (can ship independently)
5. Phase 5 → Home page header removal (can ship independently)
6. Phase 6 → Polish: full test + build verification

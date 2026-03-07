# Tasks: Story Challenge Expansion

**Input**: Design documents from `/specs/029-story-challenge/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Type system changes and scoring foundation that all user stories depend on.

- [X] T001 Expand `QuestionType` union from 4 to 6 values (remove `ruleOfThree`, add `multiItemRatio`, `percentageOfWhole`, `complexExtrapolation`) and add `timerDurationMs: number` field to `Formula` interface in `frontend/src/types/game.ts`
- [X] T002 [P] Add category helper constants `PURE_NUMERIC_TYPES`, `STORY_CHALLENGE_TYPES`, and `isStoryChallenge()` function in `frontend/src/types/game.ts`
- [X] T003 [P] Remove `ScoringTier` interface from `frontend/src/types/game.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Scoring and timer infrastructure that MUST be complete before any user story work.

**⚠️ CRITICAL**: The scoring and timer changes affect all user stories.

- [X] T004 Replace `SCORING_TIERS` array with `SCORING_THRESHOLDS` (percentage-based: ≥60%→5, ≥40%→3, ≥20%→2, >0%→1), replace `COUNTDOWN_DURATION_MS` with `NUMERIC_TIMER_MS` (20000) and `STORY_TIMER_MS` (50000), and update `calculateScore()` to accept `timerDurationMs` parameter in `frontend/src/constants/scoring.ts`
- [X] T005 Update `handleSubmitAnswer()` in `frontend/src/services/gameEngine.ts` to pass `round.formula.timerDurationMs` as third argument to `calculateScore()`
- [X] T006 Update `useRoundTimer` hook to accept a `durationMs` parameter instead of reading `COUNTDOWN_DURATION_MS`, and update `reset()` to display the correct initial countdown text based on `durationMs` in `frontend/src/hooks/useRoundTimer.ts`
- [X] T007 Update `getBarColor()` in `frontend/src/hooks/useRoundTimer.ts` to accept `(elapsedMs, timerDurationMs)` and compute color thresholds as percentages of the total duration
- [X] T008 Update `MainPage.tsx` to read `timerDurationMs` from the current round's formula and pass it to `useRoundTimer` and related timer lifecycle calls in `frontend/src/pages/MainPage.tsx`
- [X] T009 Update `GameStatus.tsx` to display the per-round timer duration as the initial countdown text (dynamic instead of hardcoded `50.0s`) in `frontend/src/components/GamePlay/GameStatus/GameStatus.tsx`

**Checkpoint**: Scoring and timer infrastructure ready — per-round timer durations and percentage-based scoring functional.

---

## Phase 3: User Story 1 — 50/50 Round Split (Priority: P1) 🎯 MVP

**Goal**: Every game generates exactly 5 Pure Numeric and 5 Story Challenge rounds, randomly interleaved.

**Independent Test**: Start a game, verify 5 numeric + 5 story rounds per game across multiple games.

- [X] T010 [US1] Replace `DEFAULT_DISTRIBUTION` and `generateFormulas()` logic to produce 5 Pure Numeric (balanced across percentage/ratio/fraction) + 5 Story Challenge rounds (1 each sub-type guaranteed + 2 random) with `timerDurationMs` set per category, and shuffle all 10 in `frontend/src/services/formulaGenerator.ts`
- [X] T011 [P] [US1] Remove `buildRuleOfThreePool()` and `WORD_PROBLEM_KEYS` from `frontend/src/services/formulaGenerator.ts`
- [X] T012 [US1] Update `generateImproveFormulas()` to maintain the 5/5 split, biasing numeric slots toward challenging numeric types and story slots toward challenging story types in `frontend/src/services/formulaGenerator.ts`
- [X] T013 [US1] Update tests in `frontend/tests/services/formulaGenerator.test.ts` to verify 5/5 split, all 3 story sub-types present, timer durations correct, and deterministic output with seeded random

**Checkpoint**: Games produce exactly 5+5 rounds. Story Challenge content comes in Phase 4.

---

## Phase 4: User Story 2 — Story Challenge Problem Pools (Priority: P1)

**Goal**: Three distinct story problem sub-types with engaging scenarios, "noise" information, and whole-number answers.

**Independent Test**: Play 20 games, verify all 3 sub-types appear with noise data and correct integer answers.

- [X] T014 [US2] Implement `buildMultiItemRatioPool()` in `frontend/src/services/formulaGenerator.ts` — generates problems with multiple item types at different values, asking for a subset total (constraints: answer ≤ 999, positive integer)
- [X] T015 [P] [US2] Implement `buildPercentageOfWholePool()` in `frontend/src/services/formulaGenerator.ts` — generates problems where a group has different item types and player finds what percentage one type represents (answer is whole number 1–100)
- [X] T016 [P] [US2] Implement `buildComplexExtrapolationPool()` in `frontend/src/services/formulaGenerator.ts` — generates proportional scaling problems with noise context (subsumes old ruleOfThree pool)
- [X] T017 [US2] Add 6 i18n template keys per story sub-type (18 total) plus 3 sub-type label keys (`questionType.multiItemRatio`, `questionType.percentageOfWhole`, `questionType.complexExtrapolation`) to English locale in `frontend/src/i18n/locales/en.ts`
- [X] T018 [P] [US2] Add corresponding story template translations and sub-type labels to French locale in `frontend/src/i18n/locales/fr.ts`
- [X] T019 [P] [US2] Add corresponding story template translations and sub-type labels to Spanish locale in `frontend/src/i18n/locales/es.ts`
- [X] T020 [P] [US2] Add corresponding story template translations and sub-type labels to German locale in `frontend/src/i18n/locales/de.ts`
- [X] T021 [P] [US2] Add corresponding story template translations and sub-type labels to Japanese locale in `frontend/src/i18n/locales/ja.ts`
- [X] T022 [P] [US2] Add corresponding story template translations and sub-type labels to Portuguese locale in `frontend/src/i18n/locales/pt.ts`
- [X] T023 [US2] Update `FormulaDisplay.tsx` to render the 3 new story challenge sub-types (multiItemRatio, percentageOfWhole, complexExtrapolation) using word problem templates with `wordProblemKey`, removing the old `ruleOfThree` rendering branch in `frontend/src/components/GamePlay/FormulaDisplay/FormulaDisplay.tsx`
- [X] T024 [US2] Update `formatFormula()` in `frontend/src/components/GamePlay/ScoreSummary/ScoreSummary.tsx` to handle the 3 new story sub-types and remove the `ruleOfThree` case
- [X] T025 [US2] Update `formatForAria()` in `frontend/src/components/GamePlay/FormulaDisplay/FormulaDisplay.tsx` to produce accessible prose for the 3 new story sub-types
- [X] T026 [US2] Update tests in `frontend/tests/components/FormulaDisplay.test.tsx` to cover rendering for all 3 story sub-types
- [X] T027 [US2] Add pool validation tests in `frontend/tests/services/formulaGenerator.test.ts` — verify each pool produces positive integer answers, includes noise data, and respects value constraints

**Checkpoint**: Story Challenges are fully playable with 3 sub-types, translated into all 6 languages.

---

## Phase 5: User Story 3 — Normalized Scoring (Priority: P2)

**Goal**: Percentage-based scoring is verified end-to-end — same % remaining = same points for both timer durations.

**Independent Test**: Answer at 50% remaining on 20s timer (10s mark) and 50s timer (25s mark), both get +3.

- [X] T028 [US3] Update scoring tests in `frontend/tests/services/gameEngine.test.ts` to verify `calculateScore()` with both 20000ms and 50000ms `timerDurationMs` — same percentage thresholds yield same points
- [X] T029 [P] [US3] Update `ScoreSummary.tsx` to display problem type indicator (Pure Numeric vs Story Challenge) alongside each round in the summary table in `frontend/src/components/GamePlay/ScoreSummary/ScoreSummary.tsx`
- [X] T030 [P] [US3] Update timer tests in `frontend/tests/hooks/useRoundTimer.test.ts` to verify dynamic duration — reset shows correct countdown text for 20s and 50s, bar color thresholds proportional to duration
- [X] T031 [US3] Update integration test in `frontend/tests/integration/gameplayFlow.test.tsx` to verify end-to-end gameplay with 5/5 split and correct per-round scoring

**Checkpoint**: Scoring is verified fair and normalized across both problem types.

---

## Phase 6: User Story 4 — Dark Mode Readability (Priority: P3)

**Goal**: Story Challenge text is readable in dark mode with WCAG AA contrast.

**Independent Test**: Enable dark mode, verify story text has ≥4.5:1 contrast ratio.

- [X] T032 [US4] Add `@media (prefers-color-scheme: dark)` styles for `.problemText` and `.wordProblem` classes — set `color: #E0F0E0`, `background: rgba(0, 0, 0, 0.3)`, `border-radius: 12px`, `padding: 16px` in `frontend/src/components/GamePlay/FormulaDisplay/FormulaDisplay.module.css`
- [X] T033 [US4] Add axe accessibility test for Story Challenge display in dark mode context in `frontend/tests/a11y/FormulaDisplay.a11y.test.tsx`

**Checkpoint**: Story text is readable in both light and dark system themes.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Challenge analyzer backward compatibility, Improve mode update, and final integration.

- [X] T034 Map legacy `ruleOfThree` records to `complexExtrapolation` in `identifyChallengingItems()` filter logic in `frontend/src/services/challengeAnalyzer.ts`
- [X] T035 Update `extractTrickyCategories()` to handle 6 categories and update `ModeSelector` sub-type label keys in `frontend/src/components/GamePlay/ModeSelector/ModeSelector.tsx`
- [X] T036 [P] Update challenge analyzer tests in `frontend/tests/services/challengeAnalyzer.test.ts` to verify 6-category grouping and legacy `ruleOfThree` backward compatibility
- [X] T037 [P] Remove old `ruleOfThree.*` i18n keys from all 6 locale files (en, fr, es, de, ja, pt) and remove `questionType.ruleOfThree` label key
- [X] T038 Run full test suite (`npx vitest run`) and verify 0 failures, then run `npm run build` and verify clean compilation

**Checkpoint**: Feature complete — all story types, scoring, dark mode, and backward compatibility verified.

---

## Dependencies

```
Phase 1 (Types)
  └─▶ Phase 2 (Scoring + Timer infra)
        └─▶ Phase 3 (US1: 5/5 split) ──────────▶ Phase 5 (US3: Scoring verification)
        └─▶ Phase 4 (US2: Story pools + display) ──▶ Phase 6 (US4: Dark mode)
                                                       └─▶ Phase 7 (Polish)
```

### Parallel Execution Examples

**Within Phase 4** (after T017 English locale):
- T018, T019, T020, T021, T022 — all locale translations can run in parallel
- T014, T015, T016 — all 3 pool builders can run in parallel (different functions, shared patterns)

**Across Phases** (after Phase 2):
- Phase 3 (5/5 split) and Phase 4 (story pools) can start simultaneously
- Phase 5 and Phase 6 require their respective prior phases but are independent of each other

---

## Implementation Strategy

1. **MVP First**: Phase 1–3 delivers a working 5/5 split with placeholder story content
2. **Content Second**: Phase 4 adds the real story problems and translations
3. **Verification**: Phase 5 confirms scoring fairness
4. **Polish**: Phase 6–7 handles dark mode and backward compatibility

**Total Tasks**: 38  
**Per User Story**: US1: 4, US2: 14, US3: 4, US4: 2  
**Parallel Opportunities**: 16 tasks marked [P]  
**Suggested MVP Scope**: Phases 1–3 (US1 only — 13 tasks)

# Tasks: Competitive Mode — Scoring & UI Update

**Input**: Design documents from `/specs/032-competitive-scoring-ui/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Paths relative to repository root (`frontend/src/...`)

---

## Phase 1: Foundational (Blocking Prerequisites)

**Purpose**: New scoring function and game engine integration — MUST complete before any user story work

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T001 Add `COMPETITIVE_MAX_POINTS` and `COMPETITIVE_MIN_POINTS` constants to `frontend/src/constants/scoring.ts`
- [x] T002 Implement `calculateCompetitiveScore(isCorrect, elapsedMs, timerDurationMs)` pure function in `frontend/src/constants/scoring.ts` using linear decay formula `Math.max(1, Math.floor(10 - 9 * Math.min(elapsedMs, timerDurationMs) / timerDurationMs))`
- [x] T003 Add unit tests for `calculateCompetitiveScore()` in `frontend/tests/services/scoring.test.ts` covering: instant answer (±10), half-time numeric (±5), half-time story (±5), near-expiry (±1), exact expiry (±1), after expiry (±1), correct vs incorrect signs
- [x] T004 In `frontend/src/services/gameEngine.ts` `handleSubmitAnswer()`, branch on `state.gameMode === 'competitive'` to call `calculateCompetitiveScore()` instead of `calculateScore()` during primary playing phase

**Checkpoint**: Competitive scoring function exists and is wired into the game engine. All subsequent phases depend on this.

---

## Phase 2: User Story 1 — Point-Decay Scoring + User Story 2 — Final Score on Results Screen (Priority: P1) 🎯 MVP

**Goal**: Competition mode uses point-decay scoring (10→1), results screen shows only final score (no completion time), competition scores excluded from Play/Improve aggregates, share URL encodes score instead of time.

**Independent Test**: Start a Competition game, answer rounds at different speeds, verify per-round point values match the decay formula. Complete the game and verify the results screen shows only the cumulative score (no time), and that Play mode aggregates are unaffected.

### Implementation

- [x] T005 [P] [US1] Change aggregate update guard in `saveGameRecord()` from `gameMode !== 'improve'` to `gameMode === 'play'` in `frontend/src/services/playerStorage.ts`
- [x] T006 [P] [US1] Change filter in `getRecentAverage()` from `(r.gameMode ?? 'play') !== 'improve'` to `(r.gameMode ?? 'play') === 'play'` in `frontend/src/services/playerStorage.ts`
- [x] T007 [P] [US1] Change filter in `getRecentHighScores()` from `(r.gameMode ?? 'play') !== 'improve'` to `(r.gameMode ?? 'play') === 'play'` in `frontend/src/services/playerStorage.ts`
- [x] T008 [P] [US1] Change filter in `getGameHistory()` from `(r.gameMode ?? 'play') !== 'improve'` to `(r.gameMode ?? 'play') === 'play'` in `frontend/src/services/playerStorage.ts`
- [x] T009 [US1] Add unit tests for aggregate exclusion in `frontend/tests/services/playerStorage.test.ts`: verify competitive game records do not update `totalScore`/`gamesPlayed` and are excluded from `getRecentAverage()`, `getRecentHighScores()`, and `getGameHistory()`
- [x] T010 [P] [US2] Remove `totalTimeMs` field from `SharedResult` interface in `frontend/src/services/shareUrl.ts`
- [x] T011 [P] [US2] Update `encodeShareUrl()` to remove `time` param encoding in `frontend/src/services/shareUrl.ts`
- [x] T012 [P] [US2] Update `decodeShareUrl()` to remove `time` param requirement in `frontend/src/services/shareUrl.ts`
- [x] T013 [US2] Remove total time display from the competitive info section in `frontend/src/components/GamePlay/ScoreSummary/ScoreSummary.tsx` (remove the `totalTime` div; keep seed display)
- [x] T014 [US2] Update `handleShare()` in `frontend/src/components/GamePlay/ScoreSummary/ScoreSummary.tsx` to call `encodeShareUrl()` without `totalTimeMs`
- [x] T015 [US2] Update `SharedResultPage` in `frontend/src/pages/SharedResultPage.tsx` to display score without total time
- [x] T016 [US2] Add unit tests for share URL encode/decode without time parameter in `frontend/tests/services/shareUrl.test.ts`

**Checkpoint**: Competition mode uses point-decay scoring. Results screen shows only final score. Competition scores are excluded from Play/Improve aggregates. Share URL encodes score without time. This is the MVP.

---

## Phase 3: User Story 3 — Visual Progress Bar with Point Value + User Story 5 — Hidden Remaining Time (Priority: P2)

**Goal**: Progress bar shows current point value with smooth green→orange→red color transition and thicker track. Timer text hidden from status panel during Competition rounds.

**Independent Test**: Start a Competition game, observe the progress bar is thicker than standard, displays the current point value, and transitions color smoothly from green to red. Verify the top status panel does not show remaining time text.

### Implementation

- [x] T017 [US3] Add `getCompetitiveBarColor(elapsedMs, timerDurationMs)` function using HSL interpolation (hue 120→0) in `frontend/src/hooks/useRoundTimer.ts`
- [x] T018 [US3] Add `competitiveMode` parameter and `pointLabelRef` to `useRoundTimer` hook in `frontend/src/hooks/useRoundTimer.ts`
- [x] T019 [US3] Update rAF tick in `useRoundTimer` to write point value to `pointLabelRef.textContent` and use `getCompetitiveBarColor()` for bar color when `competitiveMode` is true in `frontend/src/hooks/useRoundTimer.ts`
- [x] T020 [US3] Update `reset()` in `useRoundTimer` to initialize point label to "10" and bar color to green HSL when `competitiveMode` is true in `frontend/src/hooks/useRoundTimer.ts`
- [x] T021 [P] [US3] Add `.trackCompetitive` CSS class (height: 16px, position: relative) and `.pointLabel` CSS class (absolute centered, white bold text with text-shadow) to `frontend/src/components/GamePlay/CountdownBar/CountdownBar.module.css`
- [x] T022 [US3] Add `pointLabelRef` and `competitive` props to CountdownBar component, render thicker track variant and point label `<span>` when competitive in `frontend/src/components/GamePlay/CountdownBar/CountdownBar.tsx`
- [x] T023 [US5] Update GameStatus to hide timer text `<div className={styles.timer}>` when `gameMode === 'competitive'` (keep CountdownBar visible) in `frontend/src/components/GamePlay/GameStatus/GameStatus.tsx`
- [x] T024 [US3] Add `pointLabelRef` prop to GameStatus and pass it to CountdownBar when `gameMode === 'competitive'` in `frontend/src/components/GamePlay/GameStatus/GameStatus.tsx`
- [x] T025 [US3] Update GameStatus caller (game page) to pass `pointLabelRef` from `useRoundTimer(reducedMotion, gameMode === 'competitive')` in `frontend/src/pages/MainPage.tsx`
- [x] T026 [P] [US3] Add component tests for CountdownBar competitive variant (thicker track, point label rendered) in `frontend/tests/components/CountdownBar.test.tsx`
- [x] T027 [P] [US5] Add component tests for GameStatus timer hidden when `gameMode === 'competitive'`, visible when `gameMode === 'play'` in `frontend/tests/components/GameStatus.test.tsx`

**Checkpoint**: Competition mode has a thicker progress bar with smooth color transition and point value label. Timer text is hidden in the status panel. Play/Improve modes are unaffected.

---

## Phase 4: User Story 4 — Seed Input Forced to Lowercase (Priority: P3)

**Goal**: Seed input field in Competition setup forces all characters to lowercase. URL seeds are also normalized.

**Independent Test**: Type or paste uppercase characters into the seed input and verify they appear as lowercase. Open a seeded URL with uppercase letters and verify the seed is lowercased.

### Implementation

- [x] T028 [P] [US4] Add `.toLowerCase()` to seed input `onChange` handler in `frontend/src/components/GamePlay/CompetitionSetup/CompetitionSetup.tsx`
- [x] T029 [P] [US4] Add `.toLowerCase()` to URL seed extraction in `frontend/src/pages/MainPage.tsx` where seed is read from hash params
- [x] T030 [US4] Add component tests for lowercase enforcement on type and paste in `frontend/tests/components/CompetitionSetup.test.tsx`

**Checkpoint**: All seed input is normalized to lowercase. Competition setup and URL-based seeds are consistent.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Accessibility validation and final verification

- [x] T031 [P] Add axe-core accessibility test for CountdownBar competitive variant in `frontend/tests/a11y/`
- [x] T032 [P] Update ARIA attributes on competitive CountdownBar to reflect point value instead of time remaining in `frontend/src/components/GamePlay/CountdownBar/CountdownBar.tsx`
- [x] T033 Run `quickstart.md` validation: verify all 7 implementation steps are covered by tasks
- [x] T034 Run full test suite (`npm test`) and verify no regressions in Play/Improve modes

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 1)**: No dependencies — start immediately
- **US1+US2 (Phase 2)**: Depends on Phase 1 (scoring function + engine wiring)
- **US3+US5 (Phase 3)**: Depends on Phase 1 (scoring formula needed for point value display)
- **US4 (Phase 4)**: No dependencies on other phases — can run in parallel with Phase 2/3
- **Polish (Phase 5)**: Depends on Phases 2, 3, and 4

### User Story Dependencies

- **US1 (P1)**: Depends on Foundational only — no dependencies on other stories
- **US2 (P1)**: Depends on Foundational only — share URL changes are independent
- **US3 (P2)**: Depends on Foundational (uses same point-decay formula in rAF tick)
- **US4 (P3)**: Fully independent — can start after Foundational or in parallel
- **US5 (P2)**: Depends on Foundational — simple conditional hide

### Within Each Phase

- Tasks marked [P] within the same phase can run in parallel
- Non-[P] tasks must run sequentially as listed

### Parallel Opportunities

- T005–T008 (aggregate filter changes) can all run in parallel (same file, different functions)
- T010–T012 (share URL changes) can all run in parallel
- T021 (CSS) can run in parallel with T017–T020 (hook logic)
- T026, T027 (component tests) can run in parallel
- T028, T029 (lowercase changes) can run in parallel
- Phase 4 can run entirely in parallel with Phases 2 and 3

---

## Parallel Example: Phase 2 (US1 + US2)

```
# Batch 1 — all parallel (different functions/files):
T005: saveGameRecord aggregate guard change
T006: getRecentAverage filter change
T007: getRecentHighScores filter change
T008: getGameHistory filter change
T010: SharedResult interface update
T011: encodeShareUrl update
T012: decodeShareUrl update

# Batch 2 — sequential (depends on Batch 1):
T009: Aggregate exclusion tests
T013: ScoreSummary remove total time
T014: ScoreSummary handleShare update
T015: SharedResultPage update
T016: Share URL tests
```

---

## Implementation Strategy

### MVP First (US1 + US2 Only)

1. Complete Phase 1: Foundational (T001–T004)
2. Complete Phase 2: US1+US2 (T005–T016)
3. **STOP and VALIDATE**: Run test suite, verify competitive scoring works end-to-end
4. Deploy/demo — players can compete with point-decay scoring

### Incremental Delivery

1. Phase 1 → Scoring function wired in
2. Phase 2 → MVP: point-decay scoring + final-score-only results + aggregate exclusion
3. Phase 3 → Enhanced UX: visual progress bar with point value + timer hidden
4. Phase 4 → QoL: seed lowercase normalization
5. Phase 5 → Polish: accessibility + regression verification

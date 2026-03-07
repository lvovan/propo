# Tasks: Competitive Mode

**Input**: Design documents from `/specs/030-competitive-mode/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Included per constitution Principle V (Test-First). Tests are written first and must fail before implementation.

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story (US1, US2, US3) — omitted for Setup/Foundational/Polish phases
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: New service files and constants needed by all user stories

- [X] T001 [P] Create seeded PRNG service with `hashSeed`, `createSeededRandom`, and `createSeededRandomFromString` in `frontend/src/services/seededRandom.ts`
- [X] T002 [P] Create hash URL parameter utility with `getHashSearchParams` and `getHashParam` in `frontend/src/services/hashUrlParams.ts`
- [X] T003 [P] Create total time service with `calculateTotalTime` and `formatTotalTime` in `frontend/src/services/totalTime.ts`
- [X] T004 [P] Create share URL service with `SharedResult` interface, `encodeShareUrl`, and `decodeShareUrl` in `frontend/src/services/shareUrl.ts`
- [X] T005 [P] Add `WRONG_ANSWER_PENALTY_MS = 60_000` constant in `frontend/src/constants/scoring.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Type system and game engine changes that MUST be complete before any user story

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T006 Extend `GameMode` type to `'play' | 'improve' | 'competitive'` in `frontend/src/types/player.ts`
- [X] T007 Add optional `seed?: string` field to `GameState` interface in `frontend/src/types/game.ts`
- [X] T008 Extend `GameAction` to accept `GameMode` and optional `seed` in `START_GAME` action, store seed in state on `START_GAME`, and skip replay (go directly to `'completed'`) when `gameMode === 'competitive'` in `handleNextRoundPlaying()` in `frontend/src/services/gameEngine.ts`
- [X] T009 Add `startCompetitiveGame(seed: string)` function to `useGame` hook that creates seeded PRNG via `createSeededRandomFromString`, passes it to `generateFormulas`, and dispatches `START_GAME` with `mode: 'competitive'` and `seed`; also expose `seed` from `gameState` in `frontend/src/hooks/useGame.ts`
- [X] T010 Verify `playerStorage.ts` aggregate functions (`updatePlayerScore`, `getRecentHighScores`, `getGameHistory`) include `'competitive'` games alongside `'play'` — confirm filtering uses explicit `=== 'improve'` exclusion in `frontend/src/services/playerStorage.ts`
- [X] T011 Add `setPendingSeed(seed)` and `consumePendingSeed()` functions for sessionStorage key `propo_pending_seed` in `frontend/src/services/sessionManager.ts`
- [X] T011b [P] Add competition-related i18n strings (`mode.competition`, `mode.competitionDesc`, `competition.seedInputLabel`, `competition.seedPlaceholder`, `competition.generateSeed`, `competition.startGame`, `competition.totalTime`, `competition.seed`, `competition.share`, `competition.shareCopied`, `sharedResult.title`, `sharedResult.playThisGame`, `sharedResult.score`, `sharedResult.time`, `sharedResult.player`, `sharedResult.error`) to English locale in `frontend/src/i18n/locales/en.ts`

**Checkpoint**: Type system, game engine, core services, and English i18n ready — user story implementation can begin

---

## Phase 3: User Story 1 & 4 — Seed-Based Competition Game + Mode Selection (Priority: P1) 🎯 MVP

**Goal**: Players can select Competition mode, enter a seed (or generate one), start a game with deterministic questions, play 10 rounds (no replays), and see their score. Two players with the same seed get identical questions.

**Independent Test**: Select Competition mode → enter seed "abc123" → Start game → play 10 rounds → verify score displayed. Repeat with same seed → verify identical question sequence.

### Tests for User Story 1 & 4

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T012 [P] [US1] Write seeded PRNG determinism tests: same string seed → same sequence, different seeds → different sequences, output in [0,1) range in `frontend/tests/services/seededRandom.test.ts`
- [X] T013 [P] [US1] Write seeded formula generation tests: same seed → identical 10-question sequence (types, values, hiddenPositions, order); different seeds → different questions in `frontend/tests/services/formulaGenerator.test.ts`
- [X] T014 [P] [US1] Write CompetitionSetup component tests: renders seed input + Generate + Start buttons; Start disabled when seed empty; Generate fills random 6-char string; onStart called with trimmed seed; maxLength 100 in `frontend/tests/components/CompetitionSetup.test.tsx`
- [X] T015 [P] [US1] Write CompetitionSetup accessibility test with axe-core in `frontend/tests/a11y/CompetitionSetup.a11y.test.tsx`
- [X] T016 [P] [US1] Write game engine competitive mode tests: competitive mode skips replay queue after 10 rounds (goes to 'completed' even with incorrect answers); seed stored in GameState in `frontend/tests/services/gameEngine.test.ts`

### Implementation for User Story 1 & 4

- [X] T017 [P] [US1] Create `CompetitionSetup` component with seed input (max 100 chars, trimmed), "Generate seed" button (6 random alphanumeric chars), and "Start game" button (disabled when seed empty) in `frontend/src/components/GamePlay/CompetitionSetup/CompetitionSetup.tsx`
- [X] T018 [P] [US1] Create `CompetitionSetup.module.css` with responsive styles matching ModeSelector patterns, 44×44px touch targets in `frontend/src/components/GamePlay/CompetitionSetup/CompetitionSetup.module.css`
- [X] T019 [US1] Add `onStartCompetition` prop and Competition button with `t('mode.competition')` label to ModeSelector in `frontend/src/components/GamePlay/ModeSelector/ModeSelector.tsx`
- [X] T020 [US1] Integrate Competition flow in MainPage: when competition selected show `CompetitionSetup`; `onStart(seed)` calls `startCompetitiveGame(seed)`; pass `seed` to `ScoreSummary` on completion in `frontend/src/pages/MainPage.tsx`

**Checkpoint**: Competition mode is fully playable — select mode, enter/generate seed, play 10 rounds, see score. Two players with same seed get identical questions.

---

## Phase 4: User Story 2 — Seed via URL (Priority: P2)

**Goal**: Players can share a seeded URL (`/#/play?seed=abc123`). Opening the URL prompts profile selection if needed, then auto-selects Competition mode with the seed pre-filled.

**Independent Test**: Open `/#/play?seed=abc123` without a session → select profile → arrive at Competition setup with "abc123" pre-filled. Open same URL with a session → go directly to Competition setup with "abc123" pre-filled.

### Tests for User Story 2

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T021 [P] [US2] Write hash URL parameter tests: parse `#/play?seed=abc123` → seed="abc123"; handle missing params → null; handle URL-encoded values in `frontend/tests/services/hashUrlParams.test.ts`
- [X] T022 [P] [US2] Write seed persistence tests: `setPendingSeed` stores to sessionStorage; `consumePendingSeed` reads and deletes; returns null when empty in `frontend/tests/services/sessionManager.test.ts`

### Implementation for User Story 2

- [X] T023 [US2] Modify WelcomePage to detect `seed` in hash URL params on mount via `getHashParam('seed')`, call `setPendingSeed(seed)` if found, then proceed to profile selection; after selection navigate to `/play` in `frontend/src/pages/WelcomePage.tsx`
- [X] T024 [US2] Modify MainPage to check `getHashParam('seed')` on mount (direct URL access), then fall back to `consumePendingSeed()` (redirect from WelcomePage); if seed found from either source auto-select Competition mode and pre-fill seed in `frontend/src/pages/MainPage.tsx`

**Checkpoint**: Seeded URLs work end-to-end — both with and without active sessions. Seed persists across profile selection redirect.

---

## Phase 5: User Story 3 — Total Time and Sharing on Results Screen (Priority: P3)

**Goal**: Competition results screen shows total time (with 1-minute penalties for wrong answers), displays the seed, and provides a Share button that generates a shareable URL. Opening the share URL shows the sharer's results and a "Play this game" button.

**Independent Test**: Complete a Competition game → results show score + total time + seed → press Share → link copied → open link in new tab → see sharer's name/score/time → press "Play this game" → arrive at Competition setup with seed pre-filled.

### Tests for User Story 3

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T025 [P] [US3] Write total time calculation tests: sum of elapsedMs + 60s per incorrect answer; all correct → no penalty; 3 wrong → 180s penalty; formatting: <60s→"29.6s", ≥60s→"1m 29.6s" in `frontend/tests/services/totalTime.test.ts`
- [X] T026 [P] [US3] Write share URL encode/decode tests: round-trip data integrity; missing params → null; special characters handled; score/time as integers in `frontend/tests/services/shareUrl.test.ts`
- [X] T027 [P] [US3] Write ScoreSummary competitive mode tests: when `gameMode === 'competitive'` displays total time + seed + Share button; total time NOT shown for play/improve modes in `frontend/tests/components/ScoreSummary.test.ts`
- [X] T028 [P] [US3] Write SharedResultPage tests: renders player name, score, formatted time, seed from URL params; "Play this game" navigates to `/#/play?seed={seed}`; shows error when params missing in `frontend/tests/pages/SharedResultPage.test.tsx`
- [X] T029 [P] [US3] Write SharedResultPage accessibility test with axe-core in `frontend/tests/a11y/SharedResultPage.a11y.test.tsx`

### Implementation for User Story 3

- [X] T030 [US3] Extend ScoreSummary to accept `seed` prop and when `gameMode === 'competitive'` display total time (via `calculateTotalTime` + `formatTotalTime`), seed value, and "Share" button that calls `encodeShareUrl()` and copies to clipboard in `frontend/src/components/GamePlay/ScoreSummary/ScoreSummary.tsx`
- [X] T031 [US3] Create SharedResultPage that parses URL hash params via `decodeShareUrl`, displays player name + score + formatted total time + seed in a card, renders "Play this game" button navigating to `/#/play?seed={seed}`, and shows error for missing params in `frontend/src/pages/SharedResultPage.tsx`
- [X] T032 [US3] Add `/result` route for SharedResultPage and `'/result': 'result'` to Clarity PAGE_NAMES in `frontend/src/App.tsx`

**Checkpoint**: Competition results show total time with penalties, seed is visible, Share generates a working link, and recipients can view results and replay the same game.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: i18n, integration testing, final validation

- [X] T034 [P] Add competition-related i18n strings to French locale in `frontend/src/i18n/locales/fr.ts`
- [X] T035 [P] Add competition-related i18n strings to Spanish locale in `frontend/src/i18n/locales/es.ts`
- [X] T036 [P] Add competition-related i18n strings to Japanese locale in `frontend/src/i18n/locales/ja.ts`
- [X] T037 [P] Add competition-related i18n strings to German locale in `frontend/src/i18n/locales/de.ts`
- [X] T038 [P] Add competition-related i18n strings to Portuguese locale in `frontend/src/i18n/locales/pt.ts`
- [X] T039 Write integration test covering full competitive flow: select Competition → enter seed → play 10 rounds → results with total time + seed → Share → decode link; also test URL seed flow and determinism in `frontend/tests/integration/competitiveMode.test.tsx`
- [X] T040 Run quickstart.md validation: verify all files listed in quickstart.md exist and all contracts are satisfied

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 (T001–T005) completion — BLOCKS all user stories
- **US1&4 (Phase 3)**: Depends on Phase 2 completion
- **US2 (Phase 4)**: Depends on Phase 2 completion; can run in parallel with Phase 3
- **US3 (Phase 5)**: Depends on Phase 2 completion; can run in parallel with Phase 3 & 4
- **Polish (Phase 6)**: Depends on all user story phases being complete

### User Story Dependencies

- **US1&4 (P1)**: Depends on Foundational only — no cross-story dependencies
- **US2 (P2)**: Depends on Foundational only — URL seed mechanics are independent of UI (but benefits from US1 CompetitionSetup being present for integration)
- **US3 (P3)**: Depends on Foundational only — total time + share services are independent (but benefits from US1 ScoreSummary integration)

### Within Each User Story

1. Tests MUST be written and FAIL before implementation
2. Services before components
3. Components before page integration
4. Page integration last

### Parallel Opportunities

Within Phase 1: T001, T002, T003, T004, T005 can all run in parallel (independent files)
Within US1&4 tests: T012, T013, T014, T015, T016 can all run in parallel
Within US1&4 impl: T017+T018 in parallel, then T019, then T020
Within US2 tests: T021, T022 in parallel
Within US3 tests: T025, T026, T027, T028, T029 can all run in parallel
Within Phase 6: T033–T038 can all run in parallel (independent locale files)
Cross-story: Once Foundational is complete, US1&4, US2, and US3 test phases can begin in parallel

---

## Parallel Example: Phase 1 (Setup)

```
# All 5 tasks can run simultaneously — each creates an independent file:
T001: frontend/src/services/seededRandom.ts
T002: frontend/src/services/hashUrlParams.ts
T003: frontend/src/services/totalTime.ts
T004: frontend/src/services/shareUrl.ts
T005: frontend/src/constants/scoring.ts (modification)
```

## Parallel Example: User Story 1&4 Tests

```
# All 5 test tasks can run simultaneously — each targets a different test file:
T012: frontend/tests/services/seededRandom.test.ts
T013: frontend/tests/services/formulaGenerator.test.ts
T014: frontend/tests/components/CompetitionSetup.test.tsx
T015: frontend/tests/a11y/CompetitionSetup.a11y.test.tsx
T016: frontend/tests/services/gameEngine.test.ts
```

---

## Implementation Strategy

### MVP First (User Story 1&4 Only)

1. Complete Phase 1: Setup (T001–T005)
2. Complete Phase 2: Foundational (T006–T011)
3. Complete Phase 3: US1&4 tests then implementation (T012–T020)
4. **STOP and VALIDATE**: Two players with same seed get identical 10-question sequences
5. Deploy/demo — Competition mode is playable

### Incremental Delivery

1. Setup + Foundational → Core infrastructure ready
2. Add US1&4 → Competition mode playable (MVP!) ✅
3. Add US2 → Seeded URLs work, friction-free sharing ✅
4. Add US3 → Total time, share results, result page ✅
5. Polish → i18n complete, integration tests green ✅

### Parallel Team Strategy

With multiple developers:
1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: US1&4 (Competition mode + setup UI)
   - Developer B: US2 (URL seed flow)
   - Developer C: US3 (Total time + sharing + result page)
3. All developers: Polish phase

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- Constitution Principle V: all tests written first (red), then implementation (green)
- US1 and US4 from spec are merged into one phase since US4 (mode selection) is the entry point for US1 (seed-based game)
- Competition games use same 10-round format and scoring as Play mode — only differences: no replays, seed-based generation, total time metric
- Competitive games are included in Play aggregates (not excluded like Improve)

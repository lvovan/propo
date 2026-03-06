# Tasks: Microsoft Clarity Telemetry

**Input**: Design documents from `/specs/019-clarity-telemetry/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/clarity-service.md, quickstart.md

**Tests**: Included — constitution Principle V (Test-First) requires acceptance tests.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Phase 1: Setup

**Purpose**: Install dependency and configure environment

- [x] T001 Install `@microsoft/clarity` npm package in `frontend/`
- [x] T002 [P] Create environment variable placeholder in `frontend/.env.example` with `VITE_CLARITY_PROJECT_ID=`
- [x] T003 [P] Add `VITE_CLARITY_PROJECT_ID` to Vite env types in `frontend/src/vite-env.d.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Create the core telemetry service module that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Create `frontend/src/services/clarityService.ts` with `initClarity()`, internal `safeEvent()`, `safeSet()`, `getTimeTier()`, and module-level `isInitialized` state per contract in `contracts/clarity-service.md`
- [x] T005 Write unit tests for `initClarity()` in `frontend/tests/services/clarityService.test.ts` — verify no-op when env var missing, verify `Clarity.init()` called when env var set, verify try/catch on init failure
- [x] T006 Call `initClarity()` in `frontend/src/main.tsx` before `createRoot()` render call

**Checkpoint**: Foundation ready — Clarity initializes on app load when env var is set. All subsequent story tasks build on `clarityService.ts`.

---

## Phase 3: User Story 1 — Anonymous Usage Tracking Initialization (Priority: P1) 🎯 MVP

**Goal**: Verify that telemetry initializes silently, continues across navigation, and degrades gracefully when blocked

**Independent Test**: Load the app with `VITE_CLARITY_PROJECT_ID` set → session recordings and heatmap data appear in Clarity dashboard

### Tests for User Story 1

- [x] T007 [US1] Write integration test in `frontend/tests/integration/telemetry.test.tsx` — verify app renders without errors when `@microsoft/clarity` module is mocked as unavailable (import fails / init throws)
- [x] T008 [US1] Write unit test in `frontend/tests/services/clarityService.test.ts` — verify `initClarity()` logs console warning (not error) when project ID is empty

### Implementation for User Story 1

- [x] T009 [US1] Verify graceful degradation in `frontend/src/services/clarityService.ts` — ensure all exported functions are no-ops when `isInitialized` is false (safe wrappers)

**Checkpoint**: User Story 1 complete — the app loads telemetry silently, spans SPA navigation (automatic via Clarity), and works normally when blocked

---

## Phase 4: User Story 2 — Game Session Event Tracking (Priority: P2)

**Goal**: Track game_started, answer_submitted, and game_completed custom events with encoded metadata

**Independent Test**: Play a complete game → `game_started_play`, `answer_correct_fast`, `game_completed_play` events appear in Clarity dashboard

### Tests for User Story 2

- [x] T010 [P] [US2] Write unit tests for `trackGameStarted()` in `frontend/tests/services/clarityService.test.ts` — verify `Clarity.event('game_started_play')` and `Clarity.event('game_started_improve')` called with correct encoded names, and `Clarity.setTag('game_mode', ...)` called
- [x] T011 [P] [US2] Write unit tests for `trackAnswerSubmitted()` in `frontend/tests/services/clarityService.test.ts` — verify correct event name encoding for all 8 combinations (correct/wrong × fast/medium/slow/timeout), verify `getTimeTier()` thresholds (≤2000ms→fast, ≤3000ms→medium, ≤4000ms→slow, >4000ms→timeout)
- [x] T012 [P] [US2] Write unit tests for `trackGameCompleted()` in `frontend/tests/services/clarityService.test.ts` — verify `Clarity.event('game_completed_play')` called and `Clarity.setTag('final_score', ...)` and `Clarity.setTag('correct_count', ...)` tags set

### Implementation for User Story 2

- [x] T013 [US2] Implement `trackGameStarted(mode)`, `trackAnswerSubmitted(isCorrect, elapsedMs)`, `trackGameCompleted(mode, score, correctCount)` in `frontend/src/services/clarityService.ts` per contract
- [x] T014 [US2] Wire `trackGameStarted(mode)` call in game flow at game start in `frontend/src/pages/MainPage.tsx` (or the component that calls `startGame()`)
- [x] T015 [US2] Wire `trackAnswerSubmitted(isCorrect, elapsedMs)` call in game flow at answer evaluation in `frontend/src/pages/MainPage.tsx` (or the component that calls `submitAnswer()`)
- [x] T016 [US2] Wire `trackGameCompleted(mode, score, correctCount)` call in game flow when game status transitions to `completed` in `frontend/src/pages/MainPage.tsx`

**Checkpoint**: User Story 2 complete — game start/answer/completion events fire with encoded metadata

---

## Phase 5: User Story 3 — Player Context Tagging (Priority: P3)

**Goal**: Set session-level tags for language and player type to enable segmented analysis

**Independent Test**: Start session with a specific language → `language` and `player_type` tags appear in Clarity dashboard filters

### Tests for User Story 3

- [x] T017 [P] [US3] Write unit tests for `setLanguageTag()` in `frontend/tests/services/clarityService.test.ts` — verify `Clarity.setTag('language', 'en')` called with correct language codes
- [x] T018 [P] [US3] Write unit tests for `setPlayerTypeTag()` in `frontend/tests/services/clarityService.test.ts` — verify `Clarity.setTag('player_type', 'new')` and `Clarity.setTag('player_type', 'returning')` called correctly

### Implementation for User Story 3

- [x] T019 [US3] Implement `setLanguageTag(language)` and `setPlayerTypeTag(type)` in `frontend/src/services/clarityService.ts` per contract
- [x] T020 [US3] Wire `setLanguageTag()` in `frontend/src/i18n/LanguageContext.tsx` — call on initial language load and inside `setLanguage()` callback on language switch
- [x] T021 [US3] Wire `setPlayerTypeTag('returning')` in profile selection flow and `setPlayerTypeTag('new')` in profile creation flow in `frontend/src/pages/WelcomePage.tsx`

**Checkpoint**: User Story 3 complete — language and player type tags are set and updated in telemetry sessions

---

## Phase 6: User Story 4 — Replay and Difficulty Event Tracking (Priority: P4)

**Goal**: Track replay phase events to understand difficulty and engagement

**Independent Test**: Answer incorrectly to trigger replay → `replay_started` event with count appears in Clarity dashboard

### Tests for User Story 4

- [x] T022 [P] [US4] Write unit tests for `trackReplayStarted()` in `frontend/tests/services/clarityService.test.ts` — verify `Clarity.event('replay_started')` called and `Clarity.setTag('replay_count', ...)` tag set with correct count
- [x] T023 [P] [US4] Write unit tests for `trackReplayCompleted()` in `frontend/tests/services/clarityService.test.ts` — verify `Clarity.event('replay_completed')` called

### Implementation for User Story 4

- [x] T024 [US4] Implement `trackReplayStarted(incorrectCount)` and `trackReplayCompleted()` in `frontend/src/services/clarityService.ts` per contract
- [x] T025 [US4] Wire `trackReplayStarted(count)` call when game status transitions to `replay` in `frontend/src/pages/MainPage.tsx`
- [x] T026 [US4] Wire `trackReplayCompleted()` call when replay phase ends (all replayed answers correct) in `frontend/src/pages/MainPage.tsx`

**Checkpoint**: User Story 4 complete — replay phase events fire with correct metadata

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and documentation

- [x] T027 [P] Run full test suite (`npm test`) and verify all tests pass in `frontend/`
- [x] T028 [P] Run linting (`npm run lint`) and type-check (`npx tsc -b`) with zero errors in `frontend/`
- [x] T029 Run quickstart.md verification — validate implementation matches all steps in `specs/019-clarity-telemetry/quickstart.md`
- [x] T030 Document Clarity dashboard setup steps (cookie-less mode, Strict masking) in `frontend/.env.example` comments

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 (npm package installed) — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Phase 2 — foundational service must exist
- **User Story 2 (Phase 4)**: Depends on Phase 2 — can run in parallel with US1, US3, US4
- **User Story 3 (Phase 5)**: Depends on Phase 2 — can run in parallel with US1, US2, US4
- **User Story 4 (Phase 6)**: Depends on Phase 2 — can run in parallel with US1, US2, US3
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Depends on Phase 2 only — no dependencies on other stories
- **User Story 2 (P2)**: Depends on Phase 2 only — no dependencies on other stories
- **User Story 3 (P3)**: Depends on Phase 2 only — no dependencies on other stories
- **User Story 4 (P4)**: Depends on Phase 2 only — no dependencies on other stories

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Service functions before wiring into consumers
- Core implementation before integration points

### Parallel Opportunities

- T002 and T003 can run in parallel (different files, no dependencies)
- T010, T011, T012 can run in parallel (test functions in same file but independent test blocks)
- T017, T018 can run in parallel (independent test blocks)
- T022, T023 can run in parallel (independent test blocks)
- T027, T028 can run in parallel (independent validation tools)
- Once Phase 2 completes, all 4 user stories can start in parallel

---

## Parallel Example: User Story 2

```text
# Launch all tests for US2 together:
T010: "Unit tests for trackGameStarted()"
T011: "Unit tests for trackAnswerSubmitted()"
T012: "Unit tests for trackGameCompleted()"

# Then implement service functions:
T013: "Implement game event functions in clarityService.ts"

# Then wire into consumers (sequential — same file):
T014: "Wire trackGameStarted()"
T015: "Wire trackAnswerSubmitted()"
T016: "Wire trackGameCompleted()"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T003)
2. Complete Phase 2: Foundational (T004–T006)
3. Complete Phase 3: User Story 1 (T007–T009)
4. **STOP and VALIDATE**: App loads, Clarity initializes, no errors when blocked
5. Deploy/demo if ready — immediate heatmap and session recording value

### Incremental Delivery

1. Setup + Foundational → Clarity initializes on app load
2. Add User Story 1 → Graceful degradation verified → Deploy (MVP!)
3. Add User Story 2 → Game events tracked → Deploy
4. Add User Story 3 → Session segmentation tags → Deploy
5. Add User Story 4 → Replay/difficulty events → Deploy
6. Each story adds telemetry insight without breaking previous stories

### Suggested MVP Scope

User Story 1 alone delivers immediate value: session recordings and heatmaps in the Clarity dashboard with zero custom code beyond initialization. This is the recommended stopping point for a first deployment before adding custom events.

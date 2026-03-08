# Tasks: Normal Mode Scoring Alignment & UI Updates

**Input**: Design documents from `/specs/034-normal-mode-scoring-ui/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: Included — Constitution Principle V (Test-First) requires acceptance tests before implementation. axe-core accessibility tests required for modified components.

**Organization**: Tasks grouped by user story. US1 and US2 are merged into a single phase since the bug fix (US2) is inseparable from the formula change (US1).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Frontend SPA**: `frontend/src/`, `frontend/tests/`

---

## Phase 1: Setup (i18n Foundation)

**Purpose**: Add all new i18n keys needed by multiple user stories

- [x] T001 [P] Add `game.pointSingular`, `game.pointPlural`, and `scores.excludingCompetition` keys to `frontend/src/i18n/locales/en.ts`
- [x] T002 [P] Add `game.pointSingular`, `game.pointPlural`, and `scores.excludingCompetition` keys to `frontend/src/i18n/locales/fr.ts`
- [x] T003 [P] Add `game.pointSingular`, `game.pointPlural`, and `scores.excludingCompetition` keys to `frontend/src/i18n/locales/es.ts`
- [x] T004 [P] Add `game.pointSingular`, `game.pointPlural`, and `scores.excludingCompetition` keys to `frontend/src/i18n/locales/de.ts`
- [x] T005 [P] Add `game.pointSingular`, `game.pointPlural`, and `scores.excludingCompetition` keys to `frontend/src/i18n/locales/pt.ts`
- [x] T006 [P] Add `game.pointSingular`, `game.pointPlural`, and `scores.excludingCompetition` keys to `frontend/src/i18n/locales/ja.ts`

**Translations** (from data-model.md):

| Key | en | fr | es | de | pt | ja |
|-----|----|----|----|----|----|----|
| `game.pointSingular` | point | point | punto | Punkt | ponto | ポイント |
| `game.pointPlural` | points | points | puntos | Punkte | pontos | ポイント |
| `scores.excludingCompetition` | excluding competition games | hors jeux de compétition | excluyendo juegos de competición | ohne Wettbewerbsspiele | excluindo jogos de competição | 対戦ゲームを除く |

---

## Phase 2: User Story 1 + 2 — Unified Scoring & 10-Point Bug Fix (Priority: P1) 🎯 MVP

**Goal**: Normal Mode uses the same linear point-decay scoring (10→1) as Competition Mode. The value 10 is visible for the first 1/10th of the timer (bug fix). Both modes share a single scoring function.

**Independent Test**: Start a Normal Mode game. Verify the score starts at 10, decays linearly, and awards/deducts the displayed value on correct/incorrect answers. Compare with Competition Mode to confirm identical behavior.

### Tests for US1 + US2

> **Write these tests FIRST, ensure they FAIL before implementation**

- [x] T007 [P] [US1] Write scoring formula tests: verify `calculateCompetitiveScore(true, 0, 20000) === 10`, `calculateCompetitiveScore(true, 20000, 20000) === 1`, `calculateCompetitiveScore(false, 0, 20000) === -10`, and that value 10 persists for first 1/10th of duration in `frontend/tests/services/scoring.test.ts`
- [x] T008 [P] [US2] Write point-value display tests: verify `getCompetitivePointValue(0, 20000) === 10`, `getCompetitivePointValue(1, 20000) === 10` (not 9), `getCompetitivePointValue(2222, 20000) === 10`, `getCompetitivePointValue(2223, 20000) === 9` in `frontend/tests/hooks/useRoundTimer.test.ts`
- [x] T009 [P] [US1] Write game engine tests: verify `handleSubmitAnswer` uses `calculateCompetitiveScore` for play, improve, and competitive modes and returns identical scores for same inputs in `frontend/tests/services/gameEngine.test.ts`

### Implementation for US1 + US2

- [x] T010 [US1] Fix the off-by-one bug in `calculateCompetitiveScore()`: change formula from `floor(MAX - (MAX-MIN) × fraction)` to `MAX - floor((MAX-MIN) × fraction)` in `frontend/src/constants/scoring.ts`
- [x] T011 [US2] Fix the same off-by-one bug in `getCompetitivePointValue()`: apply identical formula fix `MAX - floor((MAX-MIN) × fraction)` in `frontend/src/hooks/useRoundTimer.ts`
- [x] T012 [US1] Unify scoring dispatch in `handleSubmitAnswer`: replace `calculateScore()` call with `calculateCompetitiveScore()` for all game modes in `frontend/src/services/gameEngine.ts`
- [x] T013 [US1] Remove `competitiveMode` parameter from `useRoundTimer` hook: all modes now use point-decay display and HSL color gradient in `frontend/src/hooks/useRoundTimer.ts`
- [x] T014 [US1] Update all call sites of `useRoundTimer` to remove the `competitiveMode` argument (search for usages across `frontend/src/`)

**Checkpoint**: Normal Mode scoring is identical to Competition Mode. Value 10 appears for the first ~2.2 seconds of a 20-second round. All scoring tests pass.

---

## Phase 3: User Story 3 — Enhanced Progress Bar Display (Priority: P2)

**Goal**: The progress bar is thicker with larger text showing localized "X points" / "1 point" in all modes.

**Independent Test**: Start any game mode. Verify the bar is 16px thick, text is large and shows "10 points" at start, "1 point" near expiry. Switch languages to verify translations.

### Tests for US3

> **Write these tests FIRST, ensure they FAIL before implementation**

- [x] T015 [P] [US3] Write CountdownBar render tests: verify the bar renders with 16px track height, point label displays localized text with correct singular/plural form, and ARIA attributes are present in `frontend/tests/components/CountdownBar.test.tsx`
- [x] T016 [P] [US3] Write axe-core accessibility test for CountdownBar: verify no a11y violations with the updated bar in `frontend/tests/a11y/CountdownBar.a11y.test.tsx`

### Implementation for US3

- [x] T017 [US3] Remove `competitive` prop from `CountdownBar` component: always render 16px track with point label in `frontend/src/components/GamePlay/CountdownBar/CountdownBar.tsx`
- [x] T018 [US3] Update CountdownBar to display localized point label: render `"{N} {t('game.pointPlural')}"` or `"{N} {t('game.pointSingular')}"` based on value in `frontend/src/components/GamePlay/CountdownBar/CountdownBar.tsx`
- [x] T019 [US3] Update CSS: unify track height to 16px for all modes, increase point label font size in `frontend/src/components/GamePlay/CountdownBar/CountdownBar.module.css`
- [x] T020 [US3] Update all call sites of `CountdownBar` to remove the `competitive` prop (search for usages across `frontend/src/`)

**Checkpoint**: Progress bar shows "10 points" at round start in all modes. Bar is 16px thick. Singular/plural is correct. Translations work in all 6 languages.

---

## Phase 4: User Story 4 — Home Screen Score Clarification (Priority: P3)

**Goal**: "excluding competition games" label appears below the "Recent High Scores" heading on the home screen.

**Independent Test**: Navigate to the home screen. Verify the subtitle appears in small font below the heading. Switch languages to confirm translation.

### Tests for US4

> **Write these tests FIRST, ensure they FAIL before implementation**

- [x] T021 [P] [US4] Write RecentHighScores render test: verify the `scores.excludingCompetition` subtitle renders below the heading, is visible when scores are empty, and uses the correct i18n key in `frontend/tests/components/RecentHighScores.test.tsx`
- [x] T022 [P] [US4] Write axe-core accessibility test for RecentHighScores: verify no a11y violations with the new subtitle in `frontend/tests/a11y/RecentHighScores.a11y.test.tsx`

### Implementation for US4

- [x] T023 [US4] Add `<small>` element with `t('scores.excludingCompetition')` below the heading in `frontend/src/components/GamePlay/RecentHighScores/RecentHighScores.tsx`
- [x] T024 [US4] Style the subtitle with reduced font size and muted color in `frontend/src/components/GamePlay/RecentHighScores/RecentHighScores.module.css`

**Checkpoint**: Home screen shows "excluding competition games" in small text below the scores heading. Label is translated in all languages. Always visible regardless of score state.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final validation across all stories

- [x] T025 Run full test suite (`npm test`) and verify all tests pass
- [x] T026 Run quickstart.md verification steps manually: start Normal Mode game → verify 10 points at start → answer at various times → check score → switch language → check home screen label
- [x] T027 Verify existing scoring tests still pass (old `calculateScore` function unchanged, just unused)
- [x] T028 Verify historical scores in localStorage are preserved unchanged after the update

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup i18n)**: No dependencies — can start immediately. All 6 locale tasks are parallel.
- **Phase 2 (US1+US2 Scoring)**: No dependency on Phase 1 (i18n keys not used in scoring logic)
- **Phase 3 (US3 Progress Bar)**: Depends on Phase 1 (needs i18n keys) AND Phase 2 (needs unified timer hook)
- **Phase 4 (US4 Home Screen)**: Depends on Phase 1 (needs i18n key). Independent of Phases 2 and 3.
- **Phase 5 (Polish)**: Depends on all previous phases

### Within Each User Story

- Tests MUST be written and FAIL before implementation begins
- Formula fixes before call-site updates
- Core logic before UI components
- Component changes before CSS changes

### Parallel Opportunities

- All Phase 1 tasks (T001–T006) can run in parallel
- Phase 1 and Phase 2 can run in parallel (different files, no dependencies)
- Phase 4 can run in parallel with Phase 3 (after Phase 1 completes)
- Within Phase 2: T007, T008, T009 (tests) can run in parallel
- Within Phase 3: T015, T016 (tests) can run in parallel
- Within Phase 4: T021, T022 (tests) can run in parallel

---

## Parallel Example: Phase 1 + Phase 2

```text
# All i18n locale updates run in parallel:
T001: Add keys to en.ts
T002: Add keys to fr.ts
T003: Add keys to es.ts
T004: Add keys to de.ts
T005: Add keys to pt.ts
T006: Add keys to ja.ts

# Scoring tests run in parallel (while i18n tasks run):
T007: Scoring formula tests
T008: Point-value display tests
T009: Game engine dispatch tests
```

## Parallel Example: Phase 3 + Phase 4

```text
# After Phase 1 + Phase 2 complete, these can run simultaneously:

# Phase 3 (Progress Bar):
T015: CountdownBar render tests
T016: CountdownBar a11y tests
T017-T020: CountdownBar implementation

# Phase 4 (Home Screen) — in parallel:
T021: RecentHighScores render tests
T022: RecentHighScores a11y tests
T023-T024: RecentHighScores implementation
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 Only)

1. Complete Phase 1: i18n keys (all 6 locales)
2. Complete Phase 2: Scoring unification + bug fix
3. **STOP and VALIDATE**: Normal Mode scoring is 10→1 linear decay, identical to Competition
4. Deploy/demo if ready — the core behavioral change is live

### Incremental Delivery

1. Phase 1 + Phase 2 → Scoring works (MVP!)
2. Add Phase 3 → Progress bar enhanced → Deploy/Demo
3. Add Phase 4 → Home screen label added → Deploy/Demo
4. Phase 5 → Final validation → Ship

---

## Notes

- US1 and US2 are merged because the bug fix (US2) is a direct consequence of the formula change (US1) — they cannot be separated.
- `calculateScore()` is intentionally NOT deleted — it remains in `scoring.ts` for backward compatibility but is no longer called by the game engine.
- The `competitive` prop/parameter is removed from both `CountdownBar` and `useRoundTimer` since all modes now behave identically.
- Historical scores in localStorage are NOT migrated — old scores used a different range (0–50) and will naturally age out of the recent scores list.

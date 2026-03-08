# Implementation Plan: Normal Mode Scoring Alignment & UI Updates

**Branch**: `034-normal-mode-scoring-ui` | **Date**: 2026-03-08 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/034-normal-mode-scoring-ui/spec.md`

## Summary

Unify Normal Mode scoring with Competition Mode's linear point-decay system (10→1), fix the off-by-one bug where 10 is skipped on the first frame, enhance the progress bar with thicker track and localized "X points/point" label in both modes, and add an "excluding competition games" clarification label on the home screen's Recent High Scores section. The approach factors the competitive scoring formula into a shared function used by both modes, corrects the decay formula boundary, adds i18n keys with manual singular/plural variants, and updates CountdownBar CSS dimensions.

## Technical Context

**Language/Version**: TypeScript 5.x (React SPA)
**Primary Dependencies**: React, Vite, CSS Modules
**Storage**: Browser localStorage (scores, player data)
**Testing**: Vitest + React Testing Library + axe-core
**Target Platform**: Static SPA — Chrome, Firefox, Safari, Edge (latest 2 versions), Chromebooks
**Project Type**: Single frontend SPA (`frontend/` directory)
**Performance Goals**: Progress bar updates at ≥10 fps via requestAnimationFrame; Lighthouse Performance ≥ 90
**Constraints**: No server-side code; 320px–1920px responsive; WCAG 2.1 AA
**Scale/Scope**: 6 supported languages (en, fr, es, de, ja, pt); ~10 screens

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Accessibility First | ✅ PASS | Progress bar has ARIA labels (`aria-valuemax`, `aria-valuemin`, `aria-valuenow`). Point label uses text shadow for contrast. Localized text meets readability requirement. |
| II. Simplicity & Clarity | ✅ PASS | Scoring unification *reduces* complexity (one formula instead of two). No new abstractions beyond factoring shared function. YAGNI respected — only builds what spec requires. |
| III. Responsive Design | ✅ PASS | Progress bar is 100% width, height change is CSS-only. Text scales with rem units. No new layout structures needed. |
| IV. Static SPA | ✅ PASS | All changes are client-side React/TypeScript/CSS. No server code. |
| V. Test-First | ✅ PASS | Acceptance tests for scoring formula, progress bar rendering, and i18n label required before implementation. axe-core tests for CountdownBar and RecentHighScores updates. |

**Gate Result**: All principles satisfied. No violations.

## Project Structure

### Documentation (this feature)

```text
specs/034-normal-mode-scoring-ui/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (internal component contracts)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── constants/
│   │   └── scoring.ts              # Unified scoring formula (modify)
│   ├── hooks/
│   │   └── useRoundTimer.ts        # Timer + point decay logic (modify)
│   ├── services/
│   │   └── gameEngine.ts           # Score calculation dispatch (modify)
│   ├── components/
│   │   └── GamePlay/
│   │       ├── CountdownBar/
│   │       │   ├── CountdownBar.tsx          # Progress bar component (modify)
│   │       │   └── CountdownBar.module.css   # Bar styling (modify)
│   │       └── RecentHighScores/
│   │           ├── RecentHighScores.tsx       # Home screen scores (modify)
│   │           └── RecentHighScores.module.css # Scores styling (modify)
│   ├── i18n/
│   │   └── locales/
│   │       ├── en.ts   # Add point/points + exclusion label keys (modify)
│   │       ├── fr.ts   # (modify)
│   │       ├── es.ts   # (modify)
│   │       ├── de.ts   # (modify)
│   │       ├── ja.ts   # (modify)
│   │       └── pt.ts   # (modify)
│   └── pages/
│       └── MainPage.tsx  # Review only — no changes expected
└── tests/
    ├── components/       # CountdownBar tests (add/modify)
    ├── hooks/            # useRoundTimer tests (add/modify)
    ├── services/         # gameEngine scoring tests (add/modify)
    └── a11y/             # axe-core tests for modified components (add/modify)
```

**Structure Decision**: Single `frontend/` directory per Constitution Principle IV. All changes are within existing directories — no new folders created.

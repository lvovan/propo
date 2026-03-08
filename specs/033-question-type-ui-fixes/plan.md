# Implementation Plan: Question Types & UI Fixes

**Branch**: `033-question-type-ui-fixes` | **Date**: 2026-03-08 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/033-question-type-ui-fixes/spec.md`

## Summary

Remove the `ratio` question type (redundant with `fraction`), enhance `percentageOfWhole` to randomly target one of three options (first item, second item, or their sum), fix the shared-link landing page's dark mode contrast by replacing hardcoded inline styles with CSS module classes, and remove the home page "Ready to play?" heading and subtitle for mobile readability.

## Technical Context

**Language/Version**: TypeScript ~5.9.3  
**Primary Dependencies**: React ^19.2.0, React Router DOM ^7.13.0 (HashRouter), Vite ^7.3.1  
**Storage**: Browser localStorage (player data under `propo_players` schema v5)  
**Testing**: Vitest ^4.0.18, @testing-library/react ^16.3.2, vitest-axe ^0.1.0  
**Target Platform**: Static SPA — latest 2 versions of Chrome, Firefox, Safari, Edge; Chromebooks  
**Project Type**: Single frontend SPA  
**Performance Goals**: Lighthouse Performance ≥ 90 mobile, TTI < 3s on 3G  
**Constraints**: Pure client-side (no server), WCAG 2.1 AA, mobile-first (320px–1920px), COPPA/GDPR-K  
**Scale/Scope**: ~12 source files modified, 0 new routes, 0 new components, 1 function modified, 1 CSS module added

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Principle | Status | Notes |
|---|-----------|--------|-------|
| I | Accessibility First | ✅ PASS | SharedResultPage dark mode fix directly improves WCAG AA compliance. Home page heading removal is compensated by existing `<header>` landmark with app title. FormulaDisplay fallback for legacy `ratio` → `fraction` preserves screen reader label coverage. |
| II | Simplicity & Clarity | ✅ PASS | Removing `ratio` reduces type system from 6 to 5 members — net simplification. `percentageOfWhole` enhancement adds one branch to an existing generator function, no new abstractions. SharedResultPage replaces inline styles with a CSS module — standard project pattern. |
| III | Responsive Design | ✅ PASS | Home page heading removal improves mobile readability. SharedResultPage CSS module uses same responsive patterns as existing components. No layout changes affect the 320px–1920px range. |
| IV | Static SPA | ✅ PASS | All changes are client-side. No new dependencies, no server-side code. Single `frontend/` directory structure preserved. |
| V | Test-First | ✅ PASS | Existing test files cover all modified modules: `formulaGenerator.test.ts`, `challengeAnalyzer.test.ts`, `FormulaDisplay.test.tsx`, `SharedResultPage.test.tsx`, `SharedResultPage.a11y.test.tsx`. Tests will be updated to verify ratio removal, multi-target percentage, dark mode contrast, and heading removal. |

**Gate Result**: All 5 principles PASS (pre-Phase 0). No violations requiring justification.

## Project Structure

### Documentation (this feature)

```text
specs/033-question-type-ui-fixes/
├── plan.md              # This file
├── research.md          # Phase 0: ratio removal strategy, percentage pool math, dark mode approach
├── data-model.md        # Phase 1: QuestionType change, Triple target semantics
├── quickstart.md        # Phase 1: implementation guide
├── contracts/           # Phase 1: updated interfaces
└── tasks.md             # Phase 2 output (NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── types/
│   │   └── game.ts                        # MODIFY: remove 'ratio' from QuestionType, PURE_NUMERIC_TYPES
│   ├── services/
│   │   ├── formulaGenerator.ts            # MODIFY: remove ratio pool/generator, update numeric distribution, enhance percentageOfWhole
│   │   └── challengeAnalyzer.ts           # MODIFY: add ratio → fraction legacy mapping
│   ├── components/
│   │   └── GamePlay/
│   │       ├── FormulaDisplay/
│   │       │   └── FormulaDisplay.tsx      # MODIFY: map legacy ratio → fraction display
│   │       ├── ScoreSummary/
│   │       │   └── ScoreSummary.tsx        # MODIFY: map legacy ratio → fraction in round summary
│   │       └── ModeSelector/
│   │           └── ModeSelector.tsx        # MODIFY: remove ratio from CATEGORY_LABEL_KEYS
│   ├── pages/
│   │   ├── MainPage.tsx                   # MODIFY: remove readyHeading and instructions
│   │   └── SharedResultPage.tsx           # MODIFY: replace inline styles with CSS module
│   │   └── SharedResultPage.module.css    # ADD: theme-aware styles with dark mode support
│   └── i18n/
│       └── locales/
│           ├── en.ts                      # MODIFY: remove 'questionType.ratio', 'game.readyToPlay', 'game.instructions'; add combined-target template variants
│           ├── de.ts                      # MODIFY: remove 'questionType.ratio', 'game.readyToPlay', 'game.instructions'; add combined-target variants
│           ├── es.ts                      # MODIFY: same
│           ├── fr.ts                      # MODIFY: same
│           ├── pt.ts                      # MODIFY: same
│           └── ja.ts                      # MODIFY: same
└── tests/
    ├── services/
    │   ├── formulaGenerator.test.ts       # MODIFY: ratio removal assertions, percentageOfWhole multi-target tests
    │   └── challengeAnalyzer.test.ts      # MODIFY: ratio → fraction legacy mapping tests
    ├── components/
    │   ├── FormulaDisplay.test.tsx         # MODIFY: legacy ratio → fraction rendering test
    │   └── ScoreSummary.test.tsx           # MODIFY: (if exists) legacy ratio rendering
    ├── pages/
    │   └── SharedResultPage.test.tsx       # MODIFY: dark mode contrast assertions
    └── a11y/
        ├── SharedResultPage.a11y.test.tsx  # MODIFY: axe-core with dark mode media query
        └── MainPage.a11y.test.tsx          # MODIFY: (if exists) verify heading/landmark after removal
```

**Structure Decision**: Single `frontend/` SPA directory (per constitution principle IV). All changes modify existing files — one new CSS module file (`SharedResultPage.module.css`) is added to replace inline styles. No new components or routes needed.

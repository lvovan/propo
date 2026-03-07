# Implementation Plan: Competitive Mode

**Branch**: `030-competitive-mode` | **Date**: 2026-03-07 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/030-competitive-mode/spec.md`

## Summary

Add a "Competition" game mode where two players on different devices can play the exact same sequence of 10 questions by sharing a seed string. The seed deterministically generates identical questions via a seeded PRNG injected into the existing `generateFormulas(randomFn)` function. The feature includes: a new Competition mode button with seed input + "Generate seed" button on the home screen; URL-based seed sharing (`/#/play?seed=...`) with seed persistence across the profile-selection redirect; no replay rounds in Competition mode; a 1-minute time penalty per incorrect answer added to cumulative time; total time + seed display on the Competition results screen; and a Share button that generates a shareable URL encoding player name, score, total time, and seed (with a standalone result page and "Play this game" replay button).

## Technical Context

**Language/Version**: TypeScript ~5.9.3  
**Primary Dependencies**: React ^19.2.0, React Router DOM ^7.13.0 (HashRouter), Vite ^7.3.1  
**Storage**: Browser localStorage (player data) + sessionStorage (session, seed persistence)  
**Testing**: Vitest ^4.0.18, @testing-library/react ^16.3.2, vitest-axe ^0.1.0  
**Target Platform**: Static SPA — latest 2 versions of Chrome, Firefox, Safari, Edge; Chromebooks  
**Project Type**: Single frontend SPA  
**Performance Goals**: Lighthouse Performance ≥ 90 mobile, TTI < 3s on 3G  
**Constraints**: Pure client-side (no server), WCAG 2.1 AA, mobile-first (320px–1920px), COPPA/GDPR-K  
**Scale/Scope**: ~12 source files modified/added, 1 new route, 2 new components, i18n additions for 6 languages

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Principle | Status | Notes |
|---|-----------|--------|-------|
| I | Accessibility First | ✅ PASS | Seed input, Generate button, Start button, Share button all standard form elements. New Competition results section uses text. All will get ARIA labels and large touch targets. axe-core tests required. |
| II | Simplicity & Clarity | ✅ PASS | One new mode with one input (seed). No complex abstractions — reuses existing `generateFormulas(randomFn)` with a seeded PRNG. Share page is read-only display. |
| III | Responsive Design | ✅ PASS | Seed input and buttons use same CSS module patterns as existing ModeSelector. Share result page is a simple card layout. Mobile-first. |
| IV | Static SPA | ✅ PASS | No server needed. Seed-to-questions is a pure client-side function. Shared results encoded in URL hash parameters. No SSR, no API. |
| V | Test-First | ✅ PASS | Deterministic seeded PRNG is inherently testable. Will write acceptance tests for: same seed → same questions, URL seed persistence, total time + penalty calculation, Competition results display. axe-core tests for new components. |

**Gate Result**: All 5 principles PASS. No violations requiring justification.

## Project Structure

### Documentation (this feature)

```text
specs/030-competitive-mode/
├── plan.md              # This file
├── research.md          # Phase 0: seeded PRNG approach, URL parameter handling
├── data-model.md        # Phase 1: updated GameMode, GameState, GameRecord, share URL schema
├── quickstart.md        # Phase 1: implementation guide
├── contracts/           # Phase 1: component interfaces, route contracts
└── tasks.md             # Phase 2 output (NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── types/
│   │   └── player.ts              # Extend GameMode type
│   ├── services/
│   │   ├── formulaGenerator.ts    # Use with seeded PRNG via generateFormulas(randomFn)
│   │   ├── seededRandom.ts        # NEW: seeded PRNG utility
│   │   ├── gameEngine.ts          # Extend GameAction, GameState for competitive
│   │   ├── playerStorage.ts       # Handle competitive mode in aggregates
│   │   ├── sessionManager.ts      # Seed persistence in sessionStorage
│   │   └── shareUrl.ts            # NEW: encode/decode share URL data
│   ├── hooks/
│   │   └── useGame.ts             # Extend startGame for competitive mode
│   ├── components/
│   │   └── GamePlay/
│   │       ├── ModeSelector/
│   │       │   └── ModeSelector.tsx  # Add Competition button + seed input
│   │       ├── ScoreSummary/
│   │       │   └── ScoreSummary.tsx   # Add total time + seed + Share for competitive
│   │       └── CompetitionSetup/
│   │           ├── CompetitionSetup.tsx        # NEW: seed input + generate + start
│   │           └── CompetitionSetup.module.css # NEW: styles
│   ├── pages/
│   │   ├── MainPage.tsx           # Handle seed from URL, competitive flow
│   │   ├── WelcomePage.tsx        # Preserve seed across profile selection
│   │   └── SharedResultPage.tsx   # NEW: display shared competition result
│   ├── i18n/
│   │   └── locales/{en,fr,es,ja,de,pt}.ts  # Add competition-related strings
│   └── App.tsx                    # Add /result route for shared results
└── tests/
    ├── services/
    │   ├── seededRandom.test.ts       # NEW: determinism tests
    │   └── formulaGenerator.test.ts   # Extend with seeded generation tests
    ├── components/
    │   ├── CompetitionSetup.test.tsx   # NEW: seed input, generate, validation
    │   └── ScoreSummary.test.ts       # Extend with competition display tests
    ├── pages/
    │   └── SharedResultPage.test.tsx  # NEW: share page rendering tests
    ├── integration/
    │   └── competitiveMode.test.tsx    # NEW: end-to-end competitive flow
    └── a11y/
        ├── CompetitionSetup.a11y.test.tsx   # NEW: axe-core for setup
        └── SharedResultPage.a11y.test.tsx   # NEW: axe-core for share page
```

**Structure Decision**: Single `frontend/` directory per constitution (Principle IV: Static SPA).
All new code goes in the existing frontend structure. Two new service files (`seededRandom.ts`, `shareUrl.ts`),
one new component (`CompetitionSetup`), and one new page (`SharedResultPage`). Everything else modifies existing files.

## Post-Design Constitution Re-Check

| # | Principle | Status | Notes |
|---|-----------|--------|-------|
| I | Accessibility First | ✅ PASS | CompetitionSetup: labeled input, keyboard-accessible buttons, 44×44px targets. SharedResultPage: semantic HTML, heading hierarchy. axe-core tests specified for both new components. All text in i18n (age-appropriate). |
| II | Simplicity & Clarity | ✅ PASS | No new abstractions beyond what's required. seededRandom is a 6-line pure function. Share URL uses native URLSearchParams. CompetitionSetup has one input + two buttons. No over-engineering. |
| III | Responsive Design | ✅ PASS | CompetitionSetup uses CSS Modules with same patterns as ModeSelector. SharedResultPage is a simple card. Both designed mobile-first with no horizontal scrolling. |
| IV | Static SPA | ✅ PASS | Everything is client-side. Share URLs encode data in hash params — no server. No SSR, no API. Single `frontend/` directory. |
| V | Test-First | ✅ PASS | Acceptance tests defined for: deterministic PRNG, URL param parsing, total time calc, share encode/decode, CompetitionSetup validation, SharedResultPage rendering. axe-core tests for new components. Integration test for full competitive flow. |

**Post-Design Gate Result**: All 5 principles PASS. No violations.

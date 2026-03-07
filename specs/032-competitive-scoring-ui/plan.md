# Implementation Plan: Competitive Mode — Scoring & UI Update

**Branch**: `032-competitive-scoring-ui` | **Date**: 2026-03-07 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/032-competitive-scoring-ui/spec.md`

## Summary

Replace the existing Competition mode scoring model (time-based 0–5 points + 60s wrong-answer penalty) with a per-round point-decay model where each round starts at 10 points, decreases linearly to 1 over the round timer, and awards/deducts the current value based on correct/incorrect answers. Update the UI: replace the 8px CountdownBar with a thicker, color-transitioning (green→orange→red) progress bar showing the current point value; hide the remaining-time display in the top status panel for Competition mode; show only the final score (no completion time) on the results screen; force all seed input to lowercase; update the share URL to encode score instead of time; and exclude Competition scores from Play/Improve aggregates.

## Technical Context

**Language/Version**: TypeScript ~5.9.3  
**Primary Dependencies**: React ^19.2.0, React Router DOM ^7.13.0 (HashRouter), Vite ^7.3.1  
**Storage**: Browser localStorage (player data under `propo_players` schema v5)  
**Testing**: Vitest ^4.0.18, @testing-library/react ^16.3.2, vitest-axe ^0.1.0  
**Target Platform**: Static SPA — latest 2 versions of Chrome, Firefox, Safari, Edge; Chromebooks  
**Project Type**: Single frontend SPA  
**Performance Goals**: Lighthouse Performance ≥ 90 mobile, TTI < 3s on 3G, progress bar updates ≥ 10 FPS (rAF loop)  
**Constraints**: Pure client-side (no server), WCAG 2.1 AA, mobile-first (320px–1920px), COPPA/GDPR-K  
**Scale/Scope**: ~8 source files modified, 0 new routes, 0 new components (extends existing), 1 new scoring function

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Principle | Status | Notes |
|---|-----------|--------|-------|
| I | Accessibility First | ✅ PASS | Progress bar has `role="progressbar"` with ARIA attributes. Point value text label paired with color (not color-only). White text on colored bar uses `text-shadow` for contrast. Seed lowercase is a normalization, not a barrier. |
| II | Simplicity & Clarity | ✅ PASS | Scoring formula is a single linear equation (`10 - 9 * fraction`). One new pure function added. UI changes modify existing components — no new abstractions. Aggregate filter change is a 4-line edit. |
| III | Responsive Design | ✅ PASS | 16px bar height and centered point label work at all viewports (320px–1920px). Timer text removal reduces horizontal space. No layout changes beyond existing component boundaries. |
| IV | Static SPA | ✅ PASS | All changes are client-side pure computation. Share URL format change is client-side encoding. No server, SSR, or external dependencies. |
| V | Test-First | ✅ PASS | `calculateCompetitiveScore()` is a pure function — trivially testable at all boundaries. Aggregate exclusion testable via existing storage test patterns. Component tests for CountdownBar variant, GameStatus timer visibility, and seed lowercase. axe-core tests for competitive CountdownBar. |

**Gate Result**: All 5 principles PASS (pre-Phase 0 and post-Phase 1). No violations requiring justification.

## Project Structure

### Documentation (this feature)

```text
specs/032-competitive-scoring-ui/
├── plan.md              # This file
├── research.md          # Phase 0: point-decay math, color interpolation, aggregate separation
├── data-model.md        # Phase 1: updated Round, GameRecord, SharedResult types
├── quickstart.md        # Phase 1: implementation guide
├── contracts/           # Phase 1: updated component/function interfaces
└── tasks.md             # Phase 2 output (NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── constants/
│   │   └── scoring.ts             # MODIFY: add competitive point-decay scoring function + constants
│   ├── hooks/
│   │   └── useRoundTimer.ts       # MODIFY: support competitive mode color gradient + point display + thicker bar
│   ├── components/
│   │   └── GamePlay/
│   │       ├── CountdownBar/
│   │       │   ├── CountdownBar.tsx        # MODIFY: accept competitive mode props (thickness, point label)
│   │       │   └── CountdownBar.module.css # MODIFY: thicker variant, color transition styles
│   │       ├── GameStatus/
│   │       │   └── GameStatus.tsx          # MODIFY: hide timer text for competitive mode
│   │       ├── CompetitionSetup/
│   │       │   └── CompetitionSetup.tsx    # MODIFY: force seed input to lowercase
│   │       └── ScoreSummary/
│   │           └── ScoreSummary.tsx        # MODIFY: hide total time for competitive, show only score
│   ├── services/
│   │   ├── gameEngine.ts          # MODIFY: use competitive scoring for point calculation
│   │   ├── playerStorage.ts       # MODIFY: exclude competitive from aggregates
│   │   ├── shareUrl.ts            # MODIFY: replace time with score in share URL
│   │   └── totalTime.ts           # NO CHANGE (kept for backward compatibility, unused in competitive)
│   └── pages/
│       └── SharedResultPage.tsx   # MODIFY: display score instead of time for competitive results
└── tests/
    ├── services/
    │   ├── scoring.test.ts        # MODIFY: add competitive scoring tests
    │   ├── playerStorage.test.ts  # MODIFY: add aggregate exclusion tests
    │   └── shareUrl.test.ts       # MODIFY: test score-based share URL
    ├── hooks/
    │   └── useRoundTimer.test.ts  # MODIFY: test competitive timer behavior
    └── components/
        ├── CountdownBar.test.tsx   # MODIFY: test competitive variant
        ├── GameStatus.test.tsx     # MODIFY: test timer hidden for competitive
        └── CompetitionSetup.test.tsx # MODIFY: test lowercase enforcement
```

**Structure Decision**: Single `frontend/` SPA directory (per constitution principle IV). All changes modify existing files — no new components or routes needed. The competitive point-decay scoring function is added to the existing `scoring.ts` constants module.

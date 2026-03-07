# Implementation Plan: Story Challenge Expansion

**Branch**: `029-story-challenge` | **Date**: 2026-03-07 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/029-story-challenge/spec.md`

## Summary

Expand the proportional reasoning game with a 50/50 round split: 5 Pure Numeric questions (percentage, ratio, fraction) and 5 Story Challenges (multi-item ratio, percentage-of-whole, complex extrapolation). The existing `ruleOfThree` type is absorbed into Story Challenges. Scoring is normalized via percentage-of-time-remaining tiers that apply identically to both 20s (numeric) and 50s (story) timers. Dark mode gets a high-contrast treatment for Story Challenge text.

## Technical Context

**Language/Version**: TypeScript ~5.9.3, React 19.2  
**Primary Dependencies**: Vite 7.3, React Router DOM 7.13, CSS Modules  
**Storage**: Browser localStorage (`propo_players`), sessionStorage (`propo_session`)  
**Testing**: Vitest 4, React Testing Library 16, vitest-axe  
**Target Platform**: Static SPA, browsers (Chrome/Firefox/Safari/Edge latest 2 versions)  
**Project Type**: Single frontend directory (`frontend/`)  
**Performance Goals**: Lighthouse ≥90, TTI <3s on 3G  
**Constraints**: WCAG 2.1 AA, 320–1920px viewport, ages 6–12 audience  
**Scale/Scope**: 10 source files modified/created, 6 locale files updated

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Accessibility First | **PASS** | Story text gets WCAG AA contrast in dark mode (FR-014). ARIA labels extended for new question types. Color never sole indicator. |
| II. Simplicity & Clarity | **PASS** | Minimal new abstractions: extends existing `QuestionType` union, reuses `Formula` interface. Per-round timer driven by formula metadata. No new screens. |
| III. Responsive Design | **PASS** | Story text container uses existing `max-width: 400px` with `margin-inline: auto`. Font sizes scale via existing media queries. |
| IV. Static SPA | **PASS** | All logic client-side. Question pools built at runtime. No backend. |
| V. Test-First | **PASS** | Acceptance tests for 5/5 split, scoring normalization, pool validation, dark mode contrast. Axe checks on Story Challenge display. |

## Project Structure

### Documentation (this feature)

```text
specs/029-story-challenge/
├── plan.md              # This file
├── research.md          # Phase 0: unknowns resolution
├── data-model.md        # Phase 1: entity changes
├── quickstart.md        # Phase 1: developer onboarding
├── contracts/           # Phase 1: API contracts
│   ├── formula-generator.md
│   └── scoring.md
└── checklists/
    └── requirements.md  # Quality checklist
```

### Source Code (files to modify/create)

```text
frontend/
├── src/
│   ├── types/
│   │   └── game.ts                          # Extend QuestionType, add timerDurationMs to Formula
│   ├── constants/
│   │   └── scoring.ts                       # Replace fixed-ms tiers with %-based scoring
│   ├── services/
│   │   ├── formulaGenerator.ts              # New pools, 5/5 split, absorb ruleOfThree
│   │   ├── gameEngine.ts                    # Pass timer duration through to scoring
│   │   └── challengeAnalyzer.ts             # 6-category analysis
│   ├── hooks/
│   │   ├── useRoundTimer.ts                 # Accept per-round duration, dynamic reset
│   │   └── useGame.ts                       # Thread timer duration into round lifecycle
│   ├── components/
│   │   └── GamePlay/
│   │       ├── FormulaDisplay/
│   │       │   ├── FormulaDisplay.tsx        # Render 3 new story sub-types
│   │       │   └── FormulaDisplay.module.css # Dark mode story text styles
│   │       ├── GameStatus/
│   │       │   └── GameStatus.tsx            # Dynamic timer reset value
│   │       ├── CountdownBar/
│   │       │   └── CountdownBar.tsx          # Proportional color thresholds
│   │       └── ScoreSummary/
│   │           └── ScoreSummary.tsx          # Problem type column in table
│   ├── i18n/
│   │   └── locales/
│   │       ├── en.ts                         # New story templates + sub-type labels
│   │       ├── fr.ts                         # Translations
│   │       ├── es.ts                         # Translations
│   │       ├── de.ts                         # Translations
│   │       ├── ja.ts                         # Translations
│   │       └── pt.ts                         # Translations
│   └── pages/
│       └── MainPage.tsx                     # Thread timer duration to useRoundTimer
└── tests/
    ├── services/
    │   ├── formulaGenerator.test.ts          # 5/5 split, sub-type coverage, pool validation
    │   ├── challengeAnalyzer.test.ts         # 6-category grouping
    │   └── gameEngine.test.ts                # Per-round timer scoring
    ├── components/
    │   ├── FormulaDisplay.test.tsx            # Story Challenge rendering
    │   └── ScoreSummary.test.tsx              # Problem type column
    ├── hooks/
    │   └── useRoundTimer.test.ts              # Dynamic duration
    ├── integration/
    │   └── gameplayFlow.test.tsx              # End-to-end 5/5 split
    └── a11y/
        └── FormulaDisplay.a11y.test.tsx       # Dark mode contrast
```

**Structure Decision**: Single `frontend/` directory. All changes extend existing modules — no new directories needed.

## Complexity Tracking

No constitution violations. No additional complexity justification needed.

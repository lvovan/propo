# Implementation Plan: Inline Answer Input

**Branch**: `023-inline-answer-input` | **Date**: 2026-02-17 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/023-inline-answer-input/spec.md`

## Summary

Remove the separate answer text field and display area during gameplay. Player-typed digits appear directly in the formula's hidden slot (replacing "?"). The touch keypad "Go" button label becomes a checkmark ("✔️"). A slow-pulsing orange border highlights the active hidden slot during the input phase.

## Technical Context

**Language/Version**: TypeScript ~5.9.3, React ^19.2.0
**Primary Dependencies**: Vite ^7.3.1, React Router DOM ^7.13.0, CSS Modules
**Storage**: N/A (no data model changes)
**Testing**: Vitest ^4.0.18, @testing-library/react ^16.3.2, vitest-axe, jsdom ^28.0.0
**Target Platform**: Static SPA — browsers (Chrome, Firefox, Safari, Edge latest 2 major versions, Chromebooks)
**Project Type**: Single `frontend/` directory
**Performance Goals**: Lighthouse Performance ≥ 90 mobile, <100ms perceived input latency
**Constraints**: WCAG 2.1 AA, 44×44 px touch targets, mobile-first (320px–1920px), no SSR
**Scale/Scope**: 4 components modified, 1 CSS file updated, 1 new CSS animation, i18n files unchanged (checkmark is a literal Unicode character)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Accessibility First | PASS | Pulsing border adds a non-color visual cue; hidden slot retains `role="math"` and aria-label. Keyboard fully supported. |
| II. Simplicity & Clarity | PASS | Removes a redundant UI element; reduces cognitive load. No new abstractions introduced. |
| III. Responsive Design | PASS | FormulaDisplay already responsive (480px breakpoint). Touch keypad already meets 44×44 px. No layout changes. |
| IV. Static SPA | PASS | Pure client-side change, no server needed. |
| V. Test-First | PASS | Acceptance tests will cover inline display, placeholder restore, checkmark label, and keyboard input. Axe tests maintained. |

**Gate result: PASS — no violations.**

## Project Structure

### Documentation (this feature)

```text
specs/023-inline-answer-input/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (empty — no API contracts)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (affected files)

```text
frontend/
├── src/
│   ├── components/
│   │   └── GamePlay/
│   │       ├── AnswerInput/
│   │       │   ├── AnswerInput.tsx          # MODIFY: remove desktop input, pass typed digits up
│   │       │   ├── TouchNumpad.tsx          # MODIFY: replace "Go" label with "✔️", remove answer display div
│   │       │   └── TouchNumpad.module.css   # MODIFY: remove .display styles, adjust .go if needed
│   │       └── FormulaDisplay/
│   │           ├── FormulaDisplay.tsx        # MODIFY: accept live typed digits, display inline
│   │           └── FormulaDisplay.module.css # MODIFY: add pulsing orange border animation
│   ├── pages/
│   │   └── MainPage.tsx                     # MODIFY: lift answer state, wire FormulaDisplay ↔ input
│   └── types/
│       └── game.ts                          # NO CHANGE
├── tests/
│   ├── components/                          # ADD/MODIFY: tests for inline answer display
│   ├── integration/                         # ADD/MODIFY: round flow integration tests
│   └── a11y/                                # ADD/MODIFY: axe accessibility tests
```

**Structure Decision**: Single `frontend/` directory. No new directories created. Changes are concentrated in the `GamePlay` component subtree and `MainPage` orchestrator.

## Complexity Tracking

> No constitution violations — table not required.

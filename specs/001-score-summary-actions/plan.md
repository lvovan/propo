# Implementation Plan: [FEATURE]

**Branch**: `001-score-summary-actions` | **Date**: 2026-02-20 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-score-summary-actions/spec.md`

## Summary

This feature moves the "Play again" and "Back to menu" buttons to the top of the Score Summary page for immediate access, and reduces header vertical space by condensing or repositioning "Game Over!" and "Total Score" labels. The goal is to improve usability, especially on small screens, while maintaining accessibility and all summary table functionality.

## Technical Context

**Language/Version**: TypeScript (React 18+)
**Primary Dependencies**: React, Vite, CSS Modules, React Testing Library, Vitest, axe-core
**Storage**: N/A (UI only; all data in memory or browser storage)
**Testing**: Vitest, React Testing Library, axe-core
**Target Platform**: Static SPA (latest Chrome, Firefox, Safari, Edge; 320px–1920px)
**Project Type**: Web (single frontend/ directory)
**Performance Goals**: No measurable regression; maintain Lighthouse Perf ≥ 90
**Constraints**: Must pass accessibility (WCAG 2.1 AA), responsive at 320px, no horizontal scroll, touch targets ≥ 44×44px
**Scale/Scope**: Affects only ScoreSummary component and related styles

## Constitution Check

**Accessibility First**: All buttons must remain keyboard/screen reader accessible, with visible focus and ARIA labels as needed.
**Simplicity & Clarity**: UI must be immediately understandable, with clear hierarchy and no clutter.
**Responsive Design**: Layout must work at 320px width, with no horizontal scroll and touch targets ≥ 44×44px.
**Static SPA**: All changes are in frontend/; no backend or SSR.
**Test-First**: Acceptance and accessibility tests must be written before implementation.

**GATE: PASSED** (no violations)

## Project Structure

### Documentation (this feature)

```text
specs/001-score-summary-actions/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── components/
│   │   └── GamePlay/
│   │       └── ScoreSummary/
│   ├── styles/
│   └── ...
└── tests/
    └── components/
        └── GamePlay/
            └── ScoreSummary/
```
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# [REMOVE IF UNUSED] Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# [REMOVE IF UNUSED] Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure: feature modules, UI flows, platform tests]
```

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |

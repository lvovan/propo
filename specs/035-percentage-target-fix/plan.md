# Implementation Plan: percentageOfWhole Target Selection Fix

**Branch**: `035-percentage-target-fix` | **Date**: 2026-03-08 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/035-percentage-target-fix/spec.md`

## Summary

Fix the `percentageOfWhole` question generator so all three target options (first item, second item, sum of both) are selected with roughly equal frequency. The current pool construction guarantees only that `a/c` is a friendly percentage, making 'first' nearly always the only valid target. The fix restructures pool indexing into per-target sub-pools so the generator can pick a target uniformly first, then sample a matching triple.

## Technical Context

**Language/Version**: TypeScript (strict), React 18
**Primary Dependencies**: Vite, React, i18next
**Storage**: Browser localStorage (no backend)
**Testing**: Vitest + React Testing Library + axe-core
**Target Platform**: Static SPA — modern browsers (Chrome, Firefox, Safari, Edge latest 2 versions; Chromebooks)
**Project Type**: Single frontend project (`frontend/`)
**Performance Goals**: Lighthouse ≥ 90 on mobile; TTI < 3s on 3G
**Constraints**: All correct answers must be in {10, 20, 25, 50, 75}; seeded games must be fully deterministic
**Scale/Scope**: 60 word-problem templates × 6 locales; each template has a `.combined` variant

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Accessibility First | PASS | No UI changes — this is a generation-logic fix only. Word problem text already meets WCAG AA contrast. |
| II. Simplicity & Clarity | PASS | Fix simplifies understanding: uniform target distribution is more predictable than bias. No new abstractions beyond sub-pool arrays. |
| III. Responsive Design | PASS | No layout or UI changes. |
| IV. Static SPA | PASS | Pure client-side logic change in `formulaGenerator.ts`. No backend. |
| V. Test-First | PASS | Existing tests cover pool invariants, determinism, and target distribution. Tests will be tightened to assert ≥20% per target type (currently only asserts >2% for combined). |

**Gate result**: PASS — no violations. Proceeding to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/035-percentage-target-fix/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (N/A — no API)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── services/
│   │   └── formulaGenerator.ts    # Pool builder + generator (PRIMARY change)
│   └── types/
│       └── game.ts                # Triple, Formula, QuestionType (NO changes expected)
└── tests/
    └── services/
        └── formulaGenerator.test.ts  # Tighten distribution tests
```

**Structure Decision**: Single `frontend/` directory. Change touches 1 production file and 1 test file. No new files needed in source.

## Complexity Tracking

No violations — table not needed.

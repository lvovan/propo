# Implementation Plan: Word Problem Variations

**Branch**: `031-word-problem-variations` | **Date**: 2026-03-07 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/031-word-problem-variations/spec.md`

## Summary

Improve word problem question generation by: (1) randomly swapping the target element position in percentage-of-whole problems so the target isn't always first, (2) randomly swapping which item type is the target in multi-item ratio problems, and (3) adding a "combined" variant for multi-item ratio problems where the question asks for the total of both item types. The swap logic for (1) and (2) already exists from feature 030 — this plan refines it and adds the combined variant. The combined variant requires 58 new i18n template strings per language (348 total across 6 languages).

## Technical Context

**Language/Version**: TypeScript ~5.9.3  
**Primary Dependencies**: React ^19.2.0, Vite ^7.3.1  
**Storage**: N/A (no persistence changes)  
**Testing**: Vitest ^4.0.18, @testing-library/react ^16.3.2  
**Target Platform**: Static SPA — latest 2 versions of Chrome, Firefox, Safari, Edge; Chromebooks  
**Project Type**: Single frontend SPA  
**Performance Goals**: No performance-sensitive changes (pool generation is already fast)  
**Constraints**: Pure client-side, WCAG 2.1 AA, all randomization via injectable `randomFn`  
**Scale/Scope**: ~2 source files modified, 6 i18n locale files extended (58 new keys each), tests extended

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Principle | Status | Notes |
|---|-----------|--------|-------|
| I | Accessibility First | ✅ PASS | No UI changes. Word problem text remains readable. Combined templates use same age-appropriate language patterns as existing templates. |
| II | Simplicity & Clarity | ✅ PASS | No new abstractions. Combined variant reuses existing `Formula` interface. Template selection is a simple conditional. |
| III | Responsive Design | ✅ PASS | No layout changes. Combined templates produce text of similar length to existing templates. |
| IV | Static SPA | ✅ PASS | No server-side changes. All logic remains in the browser. |
| V | Test-First | ✅ PASS | Statistical distribution tests will verify variant distribution across many seeds. Existing determinism tests continue to pass. |

**Gate Result**: All 5 principles PASS.

## Project Structure

### Documentation (this feature)

```text
specs/031-word-problem-variations/
├── plan.md              # This file
├── research.md          # Phase 0: approach analysis
├── data-model.md        # Phase 1: combined template structure
├── quickstart.md        # Phase 1: implementation guide
├── contracts/           # Phase 1: function contracts
└── tasks.md             # Phase 2 output (NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── services/
│   │   └── formulaGenerator.ts    # Modify: add combined variant logic to generateMultiItemRatioFormula
│   └── i18n/
│       └── locales/
│           ├── en.ts              # Add 58 combined template keys
│           ├── fr.ts              # Add 58 combined template keys
│           ├── es.ts              # Add 58 combined template keys
│           ├── ja.ts              # Add 58 combined template keys
│           ├── de.ts              # Add 58 combined template keys
│           └── pt.ts              # Add 58 combined template keys
└── tests/
    └── services/
        └── formulaGenerator.test.ts  # Extend: variant distribution tests, combined answer validation
```

**Structure Decision**: Single `frontend/` directory per constitution (Principle IV: Static SPA). Only `formulaGenerator.ts` and the 6 i18n locale files are modified. No new source files needed.

## Post-Design Constitution Re-Check

| # | Principle | Status | Notes |
|---|-----------|--------|-------|
| I | Accessibility First | ✅ PASS | Combined templates follow same sentence structure as existing templates. No new interactive elements. |
| II | Simplicity & Clarity | ✅ PASS | Single function modification + template additions. No new abstractions. |
| III | Responsive Design | ✅ PASS | No layout or rendering changes. |
| IV | Static SPA | ✅ PASS | Pure client-side. |
| V | Test-First | ✅ PASS | Distribution tests verify FR-009 (no variant > 60%). Answer validation tests verify FR-006 (1–999 range). |

**Post-Design Gate Result**: All 5 principles PASS.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |

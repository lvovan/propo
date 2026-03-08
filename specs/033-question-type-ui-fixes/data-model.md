# Data Model: Question Types & UI Fixes

**Feature**: 033-question-type-ui-fixes  
**Date**: 2026-03-08

## Overview

This feature modifies the `QuestionType` union (removes `ratio`), enhances the `percentageOfWhole` generation logic (multi-target support), and changes display styles on two pages. No new types or entities are introduced.

## Modified Entities

### QuestionType (MODIFIED — member removed)

```
QuestionType (BEFORE)                          QuestionType (AFTER)
├── 'percentage'                               ├── 'percentage'
├── 'ratio'                        # REMOVED   │
├── 'fraction'                                 ├── 'fraction'
├── 'multiItemRatio'                           ├── 'multiItemRatio'
├── 'percentageOfWhole'                        ├── 'percentageOfWhole'
└── 'complexExtrapolation'                     └── 'complexExtrapolation'
```

**Changes**: `'ratio'` removed from the union. The type narrows from 6 to 5 members. Compile-time only — runtime stored data may still contain the string `'ratio'`.

### PURE_NUMERIC_TYPES (MODIFIED — member removed)

```
PURE_NUMERIC_TYPES (BEFORE)        PURE_NUMERIC_TYPES (AFTER)
├── 'percentage'                   ├── 'percentage'
├── 'ratio'              # REMOVED│
└── 'fraction'                     └── 'fraction'
```

**Changes**: Array shrinks from 3 to 2. Used by `generateFormulas()` for the 5th slot random pick and by `generateImproveFormulas()`.

### Formula (unchanged structure, modified generation semantics)

```
Formula
├── type: QuestionType          # No longer produces 'ratio'
├── values: number[]            # Unchanged
├── hiddenPosition: HiddenPosition  # Unchanged
├── correctAnswer: number       # Unchanged
├── wordProblemKey?: string     # MODIFIED: may now use '.combined' suffix keys
├── answerUnitKey?: string      # Unchanged
├── timerDurationMs: number     # Unchanged
```

**Changes for percentageOfWhole**: The `wordProblemKey` field may now reference `.combined`-suffixed i18n keys (e.g., `'story.percentageOfWhole.petshop.combined'`) when the target variant is "combined." The `values` array semantics change per target variant:

| Target variant | `values[0]` | `values[1]` | `values[2]` | `correctAnswer` |
|---|---|---|---|---|
| First item | Count of first item | Count of second item | Total | `(values[0] / values[2]) * 100` |
| Second item | Count of second item | Count of first item | Total | `(values[0] / values[2]) * 100` |
| Combined | Count of first item | Count of second item | Total | `((values[0] + values[1]) / values[2]) * 100` |

Note: For "first" and "second" variants, `values[0]` is always the target count (existing behavior — the swap puts the target in position 0). For "combined," `values[0]` and `values[1]` are both needed to compute the answer, and the template addresses both by name.

### Pools (modified — ratio pool removed)

```
Pools (BEFORE)                     Pools (AFTER)
├── percentage: Triple[]           ├── percentage: Triple[]
├── ratio: Quad[]       # REMOVED  │
├── fraction: Quad[]               ├── fraction: Quad[]
├── multiItemRatio: Quad[]         ├── multiItemRatio: Quad[]
├── percentageOfWhole: Triple[]    ├── percentageOfWhole: Triple[]
└── complexExtrapolation: Quad[]   └── complexExtrapolation: Quad[]
```

## New Constants

None.

## Modified Behaviors (by function)

### Formula Generation

| Function | Before | After |
|----------|--------|-------|
| `buildRatioPool()` | Builds ratio Quad pool | REMOVED |
| `generateRatioFormula()` | Generates ratio formulas | REMOVED |
| `buildAllPools()` | Builds 6 pools including ratio | Builds 5 pools (no ratio) |
| `generateFormulaByType()` | Switch with 6 cases | Switch with 5 cases (no `'ratio'`) |
| `generateFormulas()` | Numeric distribution: 2 percentage + 2 ratio + 1 fraction (5th random from 3 types) | Numeric distribution: 2 percentage + 2 fraction (5th random from 2 types) |
| `generateImproveFormulas()` | Uses `PURE_NUMERIC_TYPES` (3 members) | Uses `PURE_NUMERIC_TYPES` (2 members) |
| `generatePercentageOfWholeFormula()` | Swaps a↔b (2 targets) | Selects from 3 targets (first, second, combined) with fallback |

### Challenge Analyzer

| Function | Before | After |
|----------|--------|-------|
| `analyzeChallenges()` | Maps `ruleOfThree` → `complexExtrapolation` | Also maps `ratio` → `fraction` |

### Display

| Component | Before | After |
|-----------|--------|-------|
| `FormulaDisplay` | Renders `ratio` as `A : B = C : D` | Maps legacy `ratio` to `fraction` format |
| `ScoreSummary` | Renders `ratio` as `A : B = C : D` | Maps legacy `ratio` to `fraction` format |
| `ModeSelector` | `CATEGORY_LABEL_KEYS` has 6 entries | 5 entries (no `ratio`) |

### Pages

| Page | Before | After |
|------|--------|-------|
| `MainPage` | Renders `<h1>` heading + `<p>` subtitle | Heading and subtitle removed; visually-hidden `<h1>` added for accessibility |
| `SharedResultPage` | Inline styles, no dark mode support | CSS module with `@media (prefers-color-scheme: dark)` overrides |

## Validation Rules

| Field | Rule | Scope |
|-------|------|-------|
| `QuestionType` | Must be one of 5 valid values | All new game records |
| Legacy `QuestionType` | `'ratio'` and `'ruleOfThree'` accepted at runtime for backward compat | Stored game records |
| `percentageOfWhole` correctAnswer | Must be in {10, 20, 25, 50, 75} | All targets (first, second, combined) |
| Combined target | `(values[0] + values[1]) / values[2] * 100` must be an integer in the friendly set | Generation-time validation with fallback |

## State Transitions

No changes to game state machine.

# Quickstart: Question Types & UI Fixes

**Feature**: 033-question-type-ui-fixes  
**Date**: 2026-03-08

## Prerequisites

- Node.js, npm installed
- Run `cd frontend && npm install`
- Branch: `033-question-type-ui-fixes`

## Implementation Steps

### Step 1: Remove `ratio` from the type system

**Files**: `frontend/src/types/game.ts`

1. Remove `'ratio'` from the `QuestionType` union.
2. Remove `'ratio'` from the `PURE_NUMERIC_TYPES` array.
3. Let TypeScript compiler errors guide remaining removals (they will flag all switch cases, Record keys, and function calls that reference the removed member).

### Step 2: Remove ratio formula generation

**Files**: `frontend/src/services/formulaGenerator.ts`

1. Remove `buildRatioPool()` function and `Quad` export (keep `Quad` if still used by `fraction`).
2. Remove `generateRatioFormula()` function.
3. Remove `ratio` case from `generateFormulaByType()` switch.
4. Remove `ratio` pool from `buildAllPools()`.
5. Update `generateFormulas()` numeric distribution from `['percentage', 'percentage', 'ratio', 'ratio', 'fraction']` to `['percentage', 'percentage', 'fraction', 'fraction', pickRandom(PURE_NUMERIC_TYPES, randomFn)]`.
6. Update `generateImproveFormulas()` similarly if it references ratio.

### Step 3: Add ratio → fraction legacy mapping

**Files**: `frontend/src/services/challengeAnalyzer.ts`, `frontend/src/components/GamePlay/FormulaDisplay/FormulaDisplay.tsx`, `frontend/src/components/GamePlay/ScoreSummary/ScoreSummary.tsx`

1. In `challengeAnalyzer.ts`, extend the legacy type mapping: add `'ratio'` → `'fraction'` alongside the existing `'ruleOfThree'` → `'complexExtrapolation'`.
2. In `FormulaDisplay.tsx`, map the `'ratio'` case to use `fraction` rendering.
3. In `ScoreSummary.tsx`, map the `'ratio'` case to use `fraction` format string.

### Step 4: Remove ratio from UI labels & locales

**Files**: `frontend/src/components/GamePlay/ModeSelector/ModeSelector.tsx`, 6 locale files

1. Remove `ratio` entry from `CATEGORY_LABEL_KEYS`.
2. Remove `'questionType.ratio'` from all 6 locale files (en, de, es, fr, pt, ja).

### Step 5: Enhance percentageOfWhole with multi-target support

**Files**: `frontend/src/services/formulaGenerator.ts`, 6 locale files

1. Modify `generatePercentageOfWholeFormula()` to select from 3 target options (first item, second item, combined) per the contract in `contracts/interfaces.md`.
2. Add `.combined`-suffixed i18n keys for all 21 `percentageOfWhole` templates across all 6 locales.
3. Ensure the seeded `randomFn` is used for deterministic target selection.

### Step 6: Fix SharedResultPage dark mode

**Files**: `frontend/src/pages/SharedResultPage.tsx`, `frontend/src/pages/SharedResultPage.module.css` (NEW)

1. Create `SharedResultPage.module.css` with theme-aware styles per the contract in `contracts/shared-result-styles.md`.
2. Replace all inline styles in `SharedResultPage.tsx` with CSS module class references.
3. Import the CSS module at the top of the component.

### Step 7: Remove home page heading

**Files**: `frontend/src/pages/MainPage.tsx`, 6 locale files

1. Remove the `<h1 className={styles.readyHeading}>` and `<p className={styles.instructions}>` elements.
2. Add a visually-hidden `<h1>` for screen reader accessibility (e.g., `<h1 className="sr-only">{t('app.title')}</h1>`), or verify that the `<header>` landmark is sufficient.
3. Remove `game.readyToPlay` and `game.instructions` keys from all 6 locale files.
4. Remove `.readyHeading` and `.instructions` CSS classes from `MainPage.module.css`.

## Test Strategy

| Test file | What to verify |
|-----------|---------------|
| `formulaGenerator.test.ts` | No `ratio` formulas generated; `percentageOfWhole` produces all 3 target variants across many runs; combined target always yields friendly percentage |
| `challengeAnalyzer.test.ts` | Legacy `ratio` records mapped to `fraction`; tricky-category detection counts `ratio` as `fraction` |
| `FormulaDisplay.test.tsx` | Legacy `ratio` data renders as fraction format |
| `SharedResultPage.test.tsx` | Component renders without inline style dependencies; text elements have proper class names |
| `SharedResultPage.a11y.test.tsx` | axe-core passes with `prefers-color-scheme: dark` emulation |
| `MainPage` tests | No heading/subtitle rendered; screen reader landmark still present |

## Verification

```bash
cd frontend
npm test            # All tests pass
npm run build       # No TypeScript errors
npx tsc --noEmit    # Type checking clean
```

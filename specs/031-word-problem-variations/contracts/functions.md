# Contracts: Word Problem Variations

**Feature**: 031-word-problem-variations  
**Date**: 2026-03-07

## Modified Functions

### 1. generateMultiItemRatioFormula (modified)

**File**: `frontend/src/services/formulaGenerator.ts`

**Current signature** (unchanged):
```typescript
function generateMultiItemRatioFormula(pool: Quad[], randomFn: () => number): Formula
```

**Behavior change**:
- Uses first `randomFn()` call to select variant (3-way split instead of 2-way)
- For "single-first": values = `[a, b, c, d]`, answer = `a × b`, template from `MULTI_ITEM_RATIO_TEMPLATES`
- For "single-second": values = `[c, d, a, b]`, answer = `c × d`, template from `MULTI_ITEM_RATIO_TEMPLATES`
- For "combined": values = `[a, b, c, d]`, answer = `(a×b) + (c×d)`, template from `MULTI_ITEM_RATIO_COMBINED_TEMPLATES` at matching index
- Combined answer validated ≤ 999 (falls back to single-first if exceeded)

### 2. generatePercentageOfWholeFormula (unchanged)

**File**: `frontend/src/services/formulaGenerator.ts`

No changes needed — the swap logic from feature 030 already satisfies FR-001 and FR-002.

## New Constants

### MULTI_ITEM_RATIO_COMBINED_TEMPLATES

**File**: `frontend/src/services/formulaGenerator.ts`

```typescript
export const MULTI_ITEM_RATIO_COMBINED_TEMPLATES: StoryTemplate[] = [
  // 58 entries, 1:1 paired with MULTI_ITEM_RATIO_TEMPLATES
  // Same unit keys, keys suffixed with '.combined'
];
```

**Invariant**: `MULTI_ITEM_RATIO_COMBINED_TEMPLATES.length === MULTI_ITEM_RATIO_TEMPLATES.length`  
**Invariant**: `MULTI_ITEM_RATIO_COMBINED_TEMPLATES[i].unitKey === MULTI_ITEM_RATIO_TEMPLATES[i].unitKey`

## i18n Contract

### New Keys (per locale)

58 keys matching the pattern `story.multiItemRatio.{scene}.combined`.

**Template text contract**:
- MUST include all 4 placeholders: `{a}`, `{b}`, `{c}`, `{d}`
- MUST include the unit (matching `unitKey`)
- MUST ask about the total of **all/everything** (not "just the [item]")
- MUST be age-appropriate (simple vocabulary, short sentences)
- MUST be grammatically natural in the target language

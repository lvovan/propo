# Data Model: Word Problem Variations

**Feature**: 031-word-problem-variations  
**Date**: 2026-03-07

## Entity Changes

### 1. Formula (unchanged)

**File**: `frontend/src/types/game.ts`

No changes to the `Formula` interface. The combined variant uses the same structure:
- `type`: `'multiItemRatio'` (same as single-item)
- `values`: `[countA, valueA, countB, valueB]` (same layout)
- `correctAnswer`: `(countA × valueA) + (countB × valueB)` for combined, or `countTarget × valueTarget` for single
- `wordProblemKey`: points to `.combined` template key for combined variant
- `hiddenPosition`: `'D'` (same as single-item)

The Formula itself does not encode which variant it is — the variant is implicit in the `wordProblemKey` (original key vs. `.combined` key) and the `correctAnswer` value.

### 2. MULTI_ITEM_RATIO_COMBINED_TEMPLATES (new constant)

**File**: `frontend/src/services/formulaGenerator.ts`

```typescript
export const MULTI_ITEM_RATIO_COMBINED_TEMPLATES: StoryTemplate[] = [
  { key: 'story.multiItemRatio.backpack.combined', unitKey: 'unit.g' },
  { key: 'story.multiItemRatio.kitchen.combined', unitKey: 'unit.g' },
  // ... 1:1 counterpart for each of the 58 existing templates
];
```

**Purpose**: Paired array of combined template keys, same length and unit-ordering as `MULTI_ITEM_RATIO_TEMPLATES`. The paired relationship allows selecting the matching combined template when the variant is "combined".

### 3. i18n Combined Template Keys (new)

**File**: `frontend/src/i18n/locales/{en,fr,es,ja,de,pt}.ts`

58 new keys per locale, following the pattern:
```
'story.multiItemRatio.{scene}.combined': 'A {scene} has {a} {itemA} ({b}{unit} each) and {c} {itemB} ({d}{unit} each). What is the total {unit} of everything?'
```

## Variant Selection Logic

The `generateMultiItemRatioFormula()` function uses `randomFn()` to select one of three variants:

| Range | Variant | Template Source | Answer |
|-------|---------|----------------|--------|
| [0, 0.33) | single-first | `MULTI_ITEM_RATIO_TEMPLATES` | `values[0] × values[1]` |
| [0.33, 0.67) | single-second | `MULTI_ITEM_RATIO_TEMPLATES` (values swapped) | `values[0] × values[1]` (after swap) |
| [0.67, 1.0) | combined | `MULTI_ITEM_RATIO_COMBINED_TEMPLATES` (paired) | `(a×b) + (c×d)` |

For the combined variant, no value swap is needed — both items contribute to the answer. The template is selected from the paired combined array at the same index as the original template.

# Quickstart: Word Problem Variations

**Feature**: 031-word-problem-variations  
**Date**: 2026-03-07  
**Prerequisites**: Read [spec.md](spec.md), [plan.md](plan.md), [research.md](research.md), [data-model.md](data-model.md)

## Implementation Order

### Layer 1: Combined Templates (i18n)

1. **Add 58 combined template keys to English locale** (`frontend/src/i18n/locales/en.ts`)
   - For each existing `story.multiItemRatio.{scene}` key, add `story.multiItemRatio.{scene}.combined`
   - Change "just the [item]" → "everything" / "all the [things]"
   - Keep same sentence structure and placeholders `{a}`, `{b}`, `{c}`, `{d}`

2. **Add `MULTI_ITEM_RATIO_COMBINED_TEMPLATES` array** (`frontend/src/services/formulaGenerator.ts`)
   - 58 entries, 1:1 paired with `MULTI_ITEM_RATIO_TEMPLATES`
   - Same unit keys, keys suffixed with `.combined`

3. **Repeat for 5 other languages** (fr, es, ja, de, pt)

### Layer 2: Variant Selection Logic

4. **Modify `generateMultiItemRatioFormula()`** (`frontend/src/services/formulaGenerator.ts`)
   - Replace binary swap (`randomFn() < 0.5`) with 3-way variant selection
   - Pick template index first, then select variant
   - For combined: use `MULTI_ITEM_RATIO_COMBINED_TEMPLATES[templateIndex]`
   - Validate combined answer ≤ 999

### Layer 3: Tests

5. **Add variant distribution tests** (`frontend/tests/services/formulaGenerator.test.ts`)
   - Verify all three variants appear across 100+ seeds
   - Verify no variant > 60% of occurrences
   - Verify combined answers are always ≤ 999
   - Verify determinism: same seed → same variant

## Key Decision Points

| Decision | Choice | Reason |
|----------|--------|--------|
| Template pairing | 1:1 paired arrays by index | Simplest; guarantees matching unit keys |
| Variant distribution | Equal thirds (~33% each) | Satisfies FR-009 (no variant > 60%) |
| Combined answer validation | Defensive ≤999 check with fallback | Even though max is 800, code defensively |
| percentageOfWhole changes | None needed | Feature 030 already implemented the swap |
| Template selection for combined | Select template index first, then pick combined/single array | Ensures combined template matches the narrative context |

## What's Already Done (from Feature 030)

- ✅ Percentage-of-whole swap (FR-001, FR-002) — already in `generatePercentageOfWholeFormula()`
- ✅ Multi-item ratio single-item swap (FR-003) — already in `generateMultiItemRatioFormula()`
- ✅ Tests for swap distribution and answer validity

## What Remains

- 🔲 `MULTI_ITEM_RATIO_COMBINED_TEMPLATES` constant (58 entries)
- 🔲 Combined template i18n keys (58 × 6 languages = 348 keys)
- 🔲 3-way variant selection in `generateMultiItemRatioFormula()`
- 🔲 Combined answer validation (≤ 999)
- 🔲 Distribution tests for 3 variants

# Research: Word Problem Variations

**Feature**: 031-word-problem-variations  
**Date**: 2026-03-07

## Research Task 1: Percentage-of-Whole Swap Approach

### Decision: Keep existing swap mechanism from feature 030

### Rationale

The current implementation in `generatePercentageOfWholeFormula()` already randomly swaps `{a}` and `{b}` values with 50% probability when `b/total` yields a friendly percentage. This satisfies FR-001 and FR-002 directly. Over 100 games with diverse seeds, the target appears in non-first position well above the 30% threshold (SC-001).

No further changes needed for this problem type — the feature 030 implementation already covers US1 completely.

### Verification

Existing test `percentageOfWhole: target element varies` confirms both positions are used across seeds. The `percentageOfWhole: correctAnswer is always a friendly percentage` test confirms answer validity after swap.

---

## Research Task 2: Multi-Item Ratio Target Swap

### Decision: Keep existing swap mechanism from feature 030

### Rationale

The current `generateMultiItemRatioFormula()` already randomly swaps item pairs (50% probability), satisfying FR-003. The swap reorders `values[0..3]` so the template's `{a},{b}` always represents the target, regardless of which pool entry was picked.

No further changes needed for single-item target variation — feature 030 already covers US2.

---

## Research Task 3: Combined Variant for Multi-Item Ratio

### Decision: Add a third variant alongside the existing single-first/single-second

### Rationale

Currently `generateMultiItemRatioFormula()` has a binary swap: 50% chance of targeting item A, 50% chance of targeting item B. For the combined variant, the function needs to select from three outcomes:

1. **single-first** (~33%): answer = `countA × valueA` (existing behavior when `swapItems = false`)
2. **single-second** (~33%): answer = `countB × valueB` (existing behavior when `swapItems = true`)
3. **combined** (~33%): answer = `(countA × valueA) + (countB × valueB)` (new)

**Variant selection**: Use `randomFn()` to pick one of three outcomes with approximately equal probability. Split [0, 1) into thirds:
- `[0, 0.33)` → single-first
- `[0.33, 0.67)` → single-second
- `[0.67, 1.0)` → combined

**Combined answer validation**: The combined answer `(a×b) + (c×d)` must be ≤ 999 (FR-006). When it exceeds 999, fall back to a single-item variant. Given the pool ranges (counts 2–8, values 2–50), the maximum combined answer is `8×50 + 8×50 = 800`, which is always ≤ 999. So the fallback is not needed in practice, but should be coded defensively.

**Template selection**: For combined variants, use `MULTI_ITEM_RATIO_COMBINED_TEMPLATES` (new array, 58 entries, 1:1 counterparts of existing templates). For single variants, use existing `MULTI_ITEM_RATIO_TEMPLATES`.

### Alternatives Considered

| Alternative | Why Rejected |
|---|---|
| Use a flag in Formula to indicate combined | Over-engineering; the template key itself distinguishes single from combined |
| Use the same template with text substitution | Fragile across 6 languages; explicit templates are clearer |
| Weight combined lower (e.g., 20%) | Spec says no variant > 60%; equal thirds (~33%) is simplest and satisfies FR-009 |

---

## Research Task 4: Combined Template Naming Convention

### Decision: Use `.combined` suffix on existing template keys

### Rationale

Each existing `story.multiItemRatio.{scene}` key gets a counterpart `story.multiItemRatio.{scene}.combined`. For example:
- `story.multiItemRatio.backpack` → "What is the total weight of just the blue folders?"
- `story.multiItemRatio.backpack.combined` → "What is the total weight of everything in the backpack?"

This convention:
- Is self-documenting
- Maps 1:1 to existing templates
- Can be programmatically derived: `template.key + '.combined'`
- Keeps the template array in a separate constant (`MULTI_ITEM_RATIO_COMBINED_TEMPLATES`) for type safety

### Template Text Pattern

Combined templates follow the same structure as single-item templates but replace "just the [item]" with a total-of-everything phrasing:
- "What is the total weight of **everything**?"
- "What is the total cost of **all the items**?"
- "What is the total number of **all the [things]**?"

The exact phrasing varies by template to sound natural in context.

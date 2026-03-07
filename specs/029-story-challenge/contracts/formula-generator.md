# Contract: Formula Generator

**Feature**: 029-story-challenge  
**Date**: 2026-03-07  
**Module**: `frontend/src/services/formulaGenerator.ts`

## Changes

### Removed Exports
- `buildRuleOfThreePool()` — absorbed into `buildComplexExtrapolationPool()`
- `WORD_PROBLEM_KEYS` — replaced by per-sub-type `StoryTemplate[]` arrays

### New Types

#### `StoryTemplate`
```typescript
interface StoryTemplate { key: string; unitKey: string }
```
Pairs an i18n template key with the unit label key for the answer (e.g., `{ key: 'story.multiItemRatio.backpack', unitKey: 'unit.g' }`).

### New Exports

#### `MULTI_ITEM_RATIO_TEMPLATES: StoryTemplate[]`
60 template pairs for multi-item ratio problems across 12+ unit types (g, kg, cal, $, cm, m, pages, ml, L, min, pts).

#### `PERCENTAGE_OF_WHOLE_TEMPLATES: StoryTemplate[]`
60 template pairs for percentage-of-whole problems. All use `unitKey: 'unit.percent'`.

#### `COMPLEX_EXTRAPOLATION_TEMPLATES: StoryTemplate[]`
60 template pairs for complex extrapolation problems with object-specific units (eggs, tanks, seeds, etc.).

#### Derived key arrays
- `MULTI_ITEM_RATIO_KEYS: string[]` — extracted from `MULTI_ITEM_RATIO_TEMPLATES`
- `PERCENTAGE_OF_WHOLE_KEYS: string[]` — extracted from `PERCENTAGE_OF_WHOLE_TEMPLATES`
- `COMPLEX_EXTRAPOLATION_KEYS: string[]` — extracted from `COMPLEX_EXTRAPOLATION_TEMPLATES`

#### `buildMultiItemRatioPool(): Quad[]`
Generates story problems where multiple item types have different friendly values ({2, 3, 4, 5, 10, 15, 20, 25, 50}) and the player finds the total of a specific subset. Answer ≤ 999.

#### `buildPercentageOfWholePool(): Triple[]`
Generates story problems where a group has different item types and the player finds what percentage one type represents. Answers restricted to {10, 20, 25, 50, 75}. Pool stores `{ a: targetCount, b: otherCount, c: total }` — the percentage is computed at formula generation time.

#### `buildComplexExtrapolationPool(): Quad[]`
Generates story problems with proportional scaling (subsumes old ruleOfThree). Includes "noise" context. Answer ≤ 999.

### Modified: `generateFormulas(randomFn?): Formula[]`

**New Distribution**: 5 Pure Numeric + 5 Story Challenge (was 3+2+2+3).

**Algorithm**:
1. Generate 5 Pure Numeric: balanced across percentage, ratio, fraction (2+2+1 or similar shuffle).
2. Generate 5 Story Challenges: 1 of each sub-type guaranteed + 2 random.
3. Set `timerDurationMs = 20000` on Pure Numeric, `50000` on Story Challenges.
4. Set `answerUnitKey` from the selected `StoryTemplate.unitKey` on each Story Challenge formula.
5. Concatenate and Fisher-Yates shuffle all 10.

**Postconditions**:
- Result has exactly 10 elements.
- Exactly 5 have `type ∈ PURE_NUMERIC_TYPES`, 5 have `type ∈ STORY_CHALLENGE_TYPES`.
- All 3 story sub-types represented.
- All `correctAnswer` values are positive integers ≤ 999.
- `percentageOfWhole` answers are restricted to {10, 20, 25, 50, 75}.
- `multiItemRatio` per-item values are restricted to {2, 3, 4, 5, 10, 15, 20, 25, 50}.
- All Story Challenge formulas have `wordProblemKey` set.
- All Story Challenge formulas have `answerUnitKey` set.
- All formulas have `timerDurationMs` set.

### Modified: `generateImproveFormulas(challengingItems, randomFn?): Formula[]`

Maintains 5/5 split. Within the 5 Pure Numeric slots, biases toward challenging numeric types. Within the 5 Story Challenge slots, biases toward challenging story types. Legacy `ruleOfThree` challenging items are treated as `complexExtrapolation`.

## Test Contract

```typescript
const formulas = generateFormulas(createSeededRandom(42));
expect(formulas).toHaveLength(10);

const numeric = formulas.filter(f => PURE_NUMERIC_TYPES.includes(f.type));
const story = formulas.filter(f => STORY_CHALLENGE_TYPES.includes(f.type));
expect(numeric).toHaveLength(5);
expect(story).toHaveLength(5);

// All 3 story sub-types present
const storyTypes = new Set(story.map(f => f.type));
expect(storyTypes.size).toBe(3);

// Timer durations correct
numeric.forEach(f => expect(f.timerDurationMs).toBe(20000));
story.forEach(f => expect(f.timerDurationMs).toBe(50000));

// All story formulas have word problem keys
story.forEach(f => expect(f.wordProblemKey).toBeTruthy());

// All story formulas have answer unit keys
story.forEach(f => expect(f.answerUnitKey).toBeTruthy());
```

# Contract: Formula Generator

**Feature**: 029-story-challenge  
**Date**: 2026-03-07  
**Module**: `frontend/src/services/formulaGenerator.ts`

## Changes

### Removed Exports
- `buildRuleOfThreePool()` — absorbed into `buildComplexExtrapolationPool()`
- `WORD_PROBLEM_KEYS` — replaced by per-sub-type key arrays

### New Exports

#### `buildMultiItemRatioPool(): StoryPoolEntry[]`
Generates story problems where multiple item types have different values and the player finds the total of a specific subset.

#### `buildPercentageOfWholePool(): StoryPoolEntry[]`
Generates story problems where a group has different item types and the player finds what percentage one type represents.

#### `buildComplexExtrapolationPool(): StoryPoolEntry[]`
Generates story problems with proportional scaling (subsumes old ruleOfThree). Includes "noise" context.

### Modified: `generateFormulas(randomFn?): Formula[]`

**New Distribution**: 5 Pure Numeric + 5 Story Challenge (was 3+2+2+3).

**Algorithm**:
1. Generate 5 Pure Numeric: balanced across percentage, ratio, fraction (2+2+1 or similar shuffle).
2. Generate 5 Story Challenges: 1 of each sub-type guaranteed + 2 random.
3. Set `timerDurationMs = 20000` on Pure Numeric, `50000` on Story Challenges.
4. Concatenate and Fisher-Yates shuffle all 10.

**Postconditions**:
- Result has exactly 10 elements.
- Exactly 5 have `type ∈ PURE_NUMERIC_TYPES`, 5 have `type ∈ STORY_CHALLENGE_TYPES`.
- All 3 story sub-types represented.
- All `correctAnswer` values are positive integers ≤ 999.
- All Story Challenge formulas have `wordProblemKey` set.
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
```

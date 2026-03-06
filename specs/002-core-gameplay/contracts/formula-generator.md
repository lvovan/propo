````markdown
# Contract: Formula Generator

**Module**: `frontend/src/services/formulaGenerator.ts`
**Type**: Pure function (no side effects, no React dependency)
**Feature**: 002-core-gameplay
**Updated**: 2026-03-06

## Purpose

Generates 10 proportional-reasoning questions for a single game. Questions are drawn from four categories: percentage (A% of B = C), ratio (A : B = C : D), fraction equivalence (A/B = C/D), and rule-of-three word problems. Each category has a pre-built pool of valid question triples/quads. The default distribution is 3 percentage, 2 ratio, 2 fraction, 3 rule-of-three, shuffled randomly.

## Dependencies

- `Formula`, `QuestionType`, `HiddenPosition`, `ChallengingItem` from `types/game.ts`

## Exports

### `generateFormulas(randomFn?: () => number): Formula[]`

Generates an array of exactly 10 `Formula` objects with a balanced mix of question types.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `randomFn` | `() => number` | `Math.random` | Random number generator returning [0, 1). Inject for deterministic testing. |

**Returns**: `Formula[]` — Exactly 10 elements.

**Algorithm**:
1. Build pools for each question type (percentage, ratio, fraction, ruleOfThree).
2. Allocate 3 percentage, 2 ratio, 2 fraction, 3 ruleOfThree slots.
3. For each slot, pick a random question from the corresponding pool.
4. For each question, randomly assign a hidden position.
5. For ruleOfThree questions, randomly assign a word-problem i18n key.
6. Fisher-Yates shuffle the final 10 questions.

**Postconditions**:
- Result has exactly 10 elements.
- All values are positive integers.
- `correctAnswer` equals `values[indexOf(hiddenPosition)]`.
- All four question types are represented.

### `generateImproveFormulas(challengingItems: ChallengingItem[], randomFn?: () => number): Formula[]`

Generates 10 formulas biased toward the player's challenging question categories.

**Parameters**:

| Name | Type | Description |
|------|------|-------------|
| `challengingItems` | `ChallengingItem[]` | Non-empty array of challenging categories, sorted by difficulty |
| `randomFn` | `() => number` | Optional RNG. Defaults to `Math.random` |

**Returns**: `Formula[]` — Exactly 10 elements.

**Postconditions**:
- Each of the 4 question types appears at least once.
- Challenging categories receive proportionally more slots.

### Pool builders (exported for testing)

- `buildPercentagePool(): Triple[]`
- `buildRatioPool(): Quad[]`
- `buildFractionPool(): Quad[]`
- `buildRuleOfThreePool(): Quad[]`

## Test Contract

```typescript
const mockRandom = createSeededRandom(42);
const formulas = generateFormulas(mockRandom);

expect(formulas).toHaveLength(10);
formulas.forEach(f => {
  expect(['percentage', 'ratio', 'fraction', 'ruleOfThree']).toContain(f.type);
  f.values.forEach(v => {
    expect(v).toBeGreaterThan(0);
    expect(Number.isInteger(v)).toBe(true);
  });
  const idx = ['A', 'B', 'C', 'D'].indexOf(f.hiddenPosition);
  expect(f.correctAnswer).toBe(f.values[idx]);
});

// All 4 types present
const types = new Set(formulas.map(f => f.type));
expect(types.size).toBe(4);
```
````

# Data Model: percentageOfWhole Target Selection Fix

**Feature**: 035-percentage-target-fix
**Date**: 2026-03-08

## Entities

### Triple (unchanged)

Represents a set of counts for a percentage-of-whole word problem.

| Field | Type   | Description |
|-------|--------|-------------|
| a     | number | First named item count |
| b     | number | Second named item count |
| c     | number | Total (a + b + remainder) |

**Invariants**:
- `a ≥ 1`, `b ≥ 1`
- `c ≥ 10`, `c ≤ 50`
- `a + b < c` (there must be a non-zero remainder)
- At least one of `a/c`, `b/c`, or `(a+b)/c` × 100 is in {10, 20, 25, 50, 75}

### PercentageOfWholePoolSet (new)

Replaces the single `Triple[]` pool with three indexed sub-pools.

| Field    | Type     | Description |
|----------|----------|-------------|
| first    | Triple[] | Triples where `a/c × 100 ∈ {10, 20, 25, 50, 75}` |
| second   | Triple[] | Triples where `b/c × 100 ∈ {10, 20, 25, 50, 75}` |
| combined | Triple[] | Triples where `(a+b)/c × 100 ∈ {10, 20, 25, 50, 75}` |

**Invariants**:
- Each sub-pool is non-empty (guaranteed by the mathematical properties of the search space)
- A single Triple may appear in multiple sub-pools
- Sub-pools are computed once per game, not per question

### PercentageTarget (new type alias)

```typescript
type PercentageTarget = 'first' | 'second' | 'combined';
```

Enumerates the three valid targets for a percentage-of-whole question.

### Formula (unchanged)

No changes to the Formula interface. The existing fields already support all three targets:

| Field          | Type           | How it varies by target |
|----------------|----------------|------------------------|
| values         | number[]       | `[a, b, c]` for first/combined; `[b, a, c]` for second |
| correctAnswer  | number         | `a/c×100`, `b/c×100`, or `(a+b)/c×100` respectively |
| wordProblemKey | string         | Base key for first/second; base key + `.combined` for combined |

## State Transitions

None. This feature modifies a stateless generation function. No state machine or lifecycle changes.

## Relationships

```
PercentageOfWholePoolSet
  ├── first:    Triple[] ──→ used when target = 'first'
  ├── second:   Triple[] ──→ used when target = 'second'
  └── combined: Triple[] ──→ used when target = 'combined'

generatePercentageOfWholeFormula(poolSet, randomFn)
  1. Pick target: PercentageTarget (uniform random)
  2. Pick triple: Triple from poolSet[target]
  3. Pick template: StoryTemplate from PERCENTAGE_OF_WHOLE_TEMPLATES
  4. Compute correctAnswer + build values[] + resolve wordProblemKey
  └──→ Formula
```

## Validation Rules

| Rule | Description |
|------|-------------|
| Friendly answer | `correctAnswer ∈ {10, 20, 25, 50, 75}` — enforced by pool construction |
| Non-trivial | `correctAnswer ≠ 0` and `correctAnswer ≠ 100` — guaranteed by pool constraints (`a ≥ 1`, remainder ≥ 1`) |
| Positive counts | `values[0] ≥ 1`, `values[1] ≥ 1`, `values[2] ≥ 10` |
| Deterministic | Same `randomFn` sequence → same Formula output |

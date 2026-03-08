# Contracts: percentageOfWhole Target Selection Fix

No API contracts apply. This feature modifies a pure client-side generation function with no network, storage, or component interface changes.

The only "contract" is the internal function signature change:

```typescript
// Before:
function buildPercentageOfWholePool(): Triple[]
function generatePercentageOfWholeFormula(pool: Triple[], randomFn: () => number): Formula

// After:
function buildPercentageOfWholePool(): PercentageOfWholePoolSet
function generatePercentageOfWholeFormula(poolSet: PercentageOfWholePoolSet, randomFn: () => number): Formula
```

The `Formula` output interface is unchanged.

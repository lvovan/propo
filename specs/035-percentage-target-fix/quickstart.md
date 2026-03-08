# Quickstart: percentageOfWhole Target Selection Fix

**Feature**: 035-percentage-target-fix
**Date**: 2026-03-08

## What Changed

The `percentageOfWhole` question generator now selects the question target uniformly at random among three options:
1. **First item** — "What percentage are the kittens?"
2. **Second item** — "What percentage are the puppies?"
3. **Combined** — "What percentage are the kittens or puppies?"

Previously, the generator almost always asked about the first item due to biased pool construction.

## Files Modified

| File | Change |
|------|--------|
| `frontend/src/services/formulaGenerator.ts` | Modified `buildPercentageOfWholePool()` to return `PercentageOfWholePoolSet` with three sub-pools. Modified `generatePercentageOfWholeFormula()` to pick target first, then sample from the matching sub-pool. |
| `frontend/tests/services/formulaGenerator.test.ts` | Tightened distribution test to assert each target type appears ≥20% of the time. Updated pool-builder tests for new return type. |

## How to Verify

```bash
cd frontend
npm test -- --run formulaGenerator
```

All existing tests plus tightened distribution assertions must pass.

## Manual Verification

1. Start a game that includes `percentageOfWhole` rounds
2. Play 5+ games, noting the question phrasing for percentage questions
3. Verify you see a mix of:
   - Questions about the first named item
   - Questions about the second named item
   - Questions about "either X or Y" (combined)

## Key Design Decision

**Target-first selection**: Instead of building a single pool and filtering valid targets at generation time, the pool is now indexed by target type. The generator picks a target uniformly, then samples a triple from the corresponding sub-pool. This guarantees balanced distribution by construction.

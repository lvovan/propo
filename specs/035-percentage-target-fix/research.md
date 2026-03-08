# Research: percentageOfWhole Target Selection Fix

**Feature**: 035-percentage-target-fix
**Date**: 2026-03-08

## Research Tasks

### RT-1: Why does the current generator always pick the first item?

**Context**: The spec reports the generator "always selects the first listed item." Investigation needed to understand root cause.

**Findings**:

The code at `frontend/src/services/formulaGenerator.ts:377` already has three-target selection logic:

```typescript
const validTargets: Target[] = ['first'];  // 'first' always valid
if (FRIENDLY_WHOLE_PERCENTAGES.has(bPct)) validTargets.push('second');
if (FRIENDLY_WHOLE_PERCENTAGES.has(combinedPct)) validTargets.push('combined');
const target = validTargets[Math.floor(randomFn() * validTargets.length)];
```

The root cause is the **pool construction** at line 357:
- `buildPercentageOfWholePool()` iterates `x, y, z ∈ [1..20]` and only accepts triples where `x / (x+y+z) * 100` is a friendly percentage.
- This guarantees `a/c` (first item) is always valid but places **no constraint on `b/c` or `(a+b)/c`**.
- Result: `validTargets` is frequently just `['first']`, making 'second' and 'combined' rare.

**Mathematical analysis**: For a triple `{a, b, c}` where `a/c` is friendly:
- `b/c` is also friendly only when `b` happens to satisfy `b/c ∈ {0.1, 0.2, 0.25, 0.5, 0.75}` — this depends on the specific `y` value relative to `c`.
- `(a+b)/c` is friendly only when `(a+b)/c ∈ {0.1, 0.2, 0.25, 0.5, 0.75}`.

Over the ~3,600 triples in the pool, a minority have valid 'second' or 'combined' targets. The existing test only asserts `combinedCount / total > 0.02` (2%), confirming the heavy bias.

**Decision**: The fix must restructure pool indexing so target selection is uniform.
**Rationale**: The current approach of "build one pool, hope other targets are valid" structurally guarantees bias. The only way to achieve uniform distribution is to index the pool by valid target.
**Alternatives considered**:
1. **Filter pool to only multi-target triples**: Rejected — reduces pool size drastically, hurting variety.
2. **Generate triples on-the-fly per target**: Rejected — adds complexity with no benefit over pre-computed sub-pools.
3. **Pre-compute per-target sub-pools** (chosen): Build three sub-pools at pool-build time, one for each target type. Each sub-pool contains triples where that target yields a friendly percentage. At generation time, pick target first (uniform), then sample from the corresponding sub-pool.

---

### RT-2: How should per-target sub-pools be structured?

**Context**: Need to ensure each target type has a non-empty sub-pool with good variety.

**Findings**:

Current pool builder loops `x, y, z ∈ [1..20]` with `10 ≤ total ≤ 50` and checks `x/total ∈ friendly`. This produces ~3,600 triples where 'first' is valid.

For separate sub-pools:
- **First pool**: triples where `a/c ∈ friendly` → same as current pool (~3,600 entries).
- **Second pool**: triples where `b/c ∈ friendly` → loop same ranges, check `y/(x+y+z) ∈ friendly` → similar count, ~3,600 entries (symmetric to first).
- **Combined pool**: triples where `(a+b)/c ∈ friendly` → check `(x+y)/(x+y+z) ∈ friendly` → also ~3,600 entries.

Actually, a simpler approach: the current pool already contains all triples where `a/c` is friendly. We can derive 'second' and 'combined' validity directly from the same triples at build time:

```
For each triple {a, b, c} in the current pool:
  - If b/c is friendly → add to secondPool
  - If (a+b)/c is friendly → add to combinedPool
```

But this undercounts — there may be triples where `b/c` is friendly but `a/c` is NOT friendly, so they're not in the current pool. The fix should scan the full space for each target independently.

**Decision**: Modify `buildPercentageOfWholePool()` to return an object with three arrays:
```typescript
interface PercentageOfWholePoolSet {
  first: Triple[];    // a/c is friendly
  second: Triple[];   // b/c is friendly
  combined: Triple[]; // (a+b)/c is friendly
}
```
Each array is independently populated by scanning the full `[1..20]³` space.

**Rationale**: Maximizes variety for each target type without mutual dependency.
**Alternatives considered**: Single pool with per-triple metadata — rejected as more complex with no benefit.

---

### RT-3: How should 'second' target handle values[] ordering and template keys?

**Context**: When target='second', the current code swaps `values[0]` and `values[1]` so the question asks about `b` using the same template key. Need to verify this is correct.

**Findings**:

Current behavior for target='second':
```typescript
case 'second':
  values = [triple.b, triple.a, triple.c];  // swap a↔b
  correctAnswer = bPct;
  wordProblemKey = template.key;             // same base key (no .combined suffix)
  break;
```

Template example: `'A pet shop has {a} kittens, {b} puppies, and some hamsters — {c} animals in total. What percentage of all the animals are the kittens?'`

When `values = [b, a, c]`, the template interpolates `{a}` as `triple.b` and asks about "the kittens" (which is now the second item count). This is **semantically correct** — the question reads naturally because the template always asks about `{a}`.

**Decision**: Keep the existing values-swap approach for 'second' target. No template changes needed.
**Rationale**: Elegant and already working — swapping values makes the template ask about whichever count is in position `{a}`.

---

### RT-4: Seeded determinism with sub-pools

**Context**: Must ensure the fix preserves deterministic behavior for seeded games.

**Findings**:

Current flow:
1. `randomFn()` called by `pickRandom(pool, randomFn)` to select a triple
2. `randomFn()` called by `pickRandom(templates, randomFn)` to select a template
3. `randomFn()` called to select from `validTargets`

Proposed flow:
1. `randomFn()` called to select target type (0, 1, or 2 → first, second, combined)
2. `randomFn()` called by `pickRandom(subPool[target], randomFn)` to select a triple
3. `randomFn()` called by `pickRandom(templates, randomFn)` to select a template

The number of `randomFn()` calls changes (was 3, now still 3 but in different order). This **will change** the output for existing seeds. This is acceptable because:
- The feature explicitly changes which questions are generated
- Seed determinism is preserved (same seed → same output) even though the output differs from before the fix
- No save-game or replay system depends on question-level backward compatibility

**Decision**: Accept that existing seeded outputs change. Ensure new implementation calls `randomFn()` exactly 3 times per formula for clean determinism.
**Rationale**: Backward compatibility of seeded outputs is not a requirement.

---

### RT-5: Pool builder performance

**Context**: Building three sub-pools instead of one — verify performance is acceptable.

**Findings**:

Current: single loop over `20³ = 8,000` iterations, producing ~3,600 triples.
Proposed: same single loop (not 3×), but checking all three conditions per iteration. Each matching triple is pushed to the relevant sub-pool(s). A triple can appear in multiple sub-pools if multiple targets are valid.

Estimated total entries across all 3 sub-pools: ~10,800 (3 × ~3,600). Array allocations are trivial. The pool is built once per game (10 questions), not per question.

**Decision**: No performance concern. Single loop with three condition checks.
**Rationale**: O(8000) iterations with constant-time checks is negligible.

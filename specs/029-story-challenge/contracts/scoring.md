# Contract: Scoring

**Feature**: 029-story-challenge  
**Date**: 2026-03-07  
**Module**: `frontend/src/constants/scoring.ts`

## Changes

### Removed
- `SCORING_TIERS: ScoringTier[]` — fixed-ms thresholds
- `COUNTDOWN_DURATION_MS` — global constant (replaced by per-formula value)
- `ScoringTier` interface from `types/game.ts`

### New

#### `SCORING_THRESHOLDS`
```typescript
export const SCORING_THRESHOLDS = [
  { minPercent: 0.60, points: 5 },
  { minPercent: 0.40, points: 3 },
  { minPercent: 0.20, points: 2 },
  { minPercent: 0.0001, points: 1 },  // >0%
] as const;
```

#### `NUMERIC_TIMER_MS` / `STORY_TIMER_MS`
```typescript
export const NUMERIC_TIMER_MS = 20_000;
export const STORY_TIMER_MS = 50_000;
```

### Modified: `calculateScore(isCorrect, elapsedMs, timerDurationMs): number`

**New Signature**:
```typescript
function calculateScore(isCorrect: boolean, elapsedMs: number, timerDurationMs: number): number
```

**Algorithm**:
```typescript
if (!isCorrect) return INCORRECT_PENALTY;
const remainingPercent = Math.max(0, (timerDurationMs - elapsedMs) / timerDurationMs);
for (const t of SCORING_THRESHOLDS) {
  if (remainingPercent >= t.minPercent) return t.points;
}
return DEFAULT_POINTS;
```

**Postconditions**:
- `calculateScore(true, 0, 20000)` → 5 (instant answer, 100% remaining)
- `calculateScore(true, 8000, 20000)` → 5 (60% remaining)
- `calculateScore(true, 10000, 20000)` → 3 (50% remaining)
- `calculateScore(true, 20000, 50000)` → 5 (60% remaining on 50s timer)
- `calculateScore(true, 25000, 50000)` → 3 (50% remaining on 50s timer)
- `calculateScore(true, 20000, 20000)` → 0 (0% remaining)
- `calculateScore(false, 5000, 20000)` → -2 (always)

## Downstream Impact

- `gameEngine.ts`: Must pass `round.formula.timerDurationMs` to `calculateScore()`
- `useRoundTimer.ts`: Must accept `durationMs` parameter instead of reading `COUNTDOWN_DURATION_MS`
- `CountdownBar`: Color thresholds derived from percentage of elapsed vs. duration
- Bar color function: `getBarColor(elapsedMs, timerDurationMs)` — uses same percentage breakpoints

# Component Contracts: Scoring & Display

**Feature**: 034-normal-mode-scoring-ui
**Date**: 2026-03-08

## 1. Scoring Function Contract

### `calculateCompetitiveScore(isCorrect, elapsedMs, timerDurationMs) → number`

**Location**: `frontend/src/constants/scoring.ts`

**Used by**: All game modes (Play, Improve, Competitive)

| Parameter | Type | Constraints |
|-----------|------|-------------|
| `isCorrect` | boolean | — |
| `elapsedMs` | number | ≥ 0 |
| `timerDurationMs` | number | > 0 |
| **Returns** | number | integer in [-10, +10] |

**Behavior**:
```
fraction = min(elapsedMs, timerDurationMs) / timerDurationMs
pointValue = max(1, 10 - floor(9 × fraction))

if isCorrect → return +pointValue
else         → return -pointValue
```

**Invariants**:
- `calculateCompetitiveScore(true, 0, any) === 10`
- `calculateCompetitiveScore(true, duration, duration) === 1`
- `calculateCompetitiveScore(false, 0, any) === -10`
- Result is always an integer
- `|result|` monotonically non-increasing as `elapsedMs` increases

---

### `getCompetitivePointValue(elapsedMs, timerDurationMs) → number`

**Location**: `frontend/src/hooks/useRoundTimer.ts`

**Used by**: `useRoundTimer` animation loop (display only)

| Parameter | Type | Constraints |
|-----------|------|-------------|
| `elapsedMs` | number | ≥ 0 |
| `timerDurationMs` | number | > 0 |
| **Returns** | number | integer in [1, 10] |

**Behavior**: Same formula as `calculateCompetitiveScore` but returns unsigned value only.

**Critical**: Both functions MUST use the identical formula. Any fix to one must be applied to the other.

---

## 2. CountdownBar Component Contract

### `<CountdownBar barRef pointLabelRef />`

**Location**: `frontend/src/components/GamePlay/CountdownBar/CountdownBar.tsx`

**Props** (changed):

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `barRef` | `RefObject<HTMLDivElement>` | Yes | Timer writes width/color |
| `pointLabelRef` | `RefObject<HTMLElement>` | Yes | Timer writes point value |

**Removed Props**:
- `competitive?: boolean` — No longer needed; all modes use unified bar

**Rendered output**:
- Track: 16px height (all modes)
- Fill bar: animated width %, HSL color gradient
- Point label: `"{N} {pointWord}"` where `pointWord` is localized singular/plural
- ARIA: `aria-valuenow={N}`, `aria-valuetext="{N} points available"`, `aria-valuemax=10`, `aria-valuemin=0`

---

## 3. useRoundTimer Hook Contract

### `useRoundTimer(reducedMotion?) → UseRoundTimerReturn`

**Location**: `frontend/src/hooks/useRoundTimer.ts`

**Changed parameter**:
- Removed: `competitiveMode?: boolean` — all modes now behave identically

**Return value** (unchanged shape):

| Property | Type | Description |
|----------|------|-------------|
| `displayRef` | `RefObject<HTMLElement>` | No longer used (timer text hidden in all modes) |
| `barRef` | `RefObject<HTMLDivElement>` | Progress bar fill element |
| `pointLabelRef` | `RefObject<HTMLElement>` | Point value label element |
| `start()` | function | Start timer |
| `stop()` | function → number | Stop and return elapsed ms |
| `reset()` | function | Reset to initial state |
| `setDuration(ms)` | function | Set timer duration |

**Animation loop behavior** (all modes):
1. Compute `elapsedMs` via `performance.now()`
2. Compute `pointValue` via fixed decay formula
3. Update bar width: `(remaining / duration) × 100%`
4. Update bar color: smooth HSL interpolation
5. Update point label: `String(pointValue)` (just the number — component adds text)
6. Update ARIA attributes

---

## 4. RecentHighScores Component Contract

### `<RecentHighScores scores isEmpty />`

**Location**: `frontend/src/components/GamePlay/RecentHighScores/RecentHighScores.tsx`

**Props** (unchanged):

| Prop | Type | Description |
|------|------|-------------|
| `scores` | `GameRecord[]` | Ranked scores to display |
| `isEmpty` | `boolean` | Whether no games have been played |

**New rendered element**:
- Below the heading (`t('scores.title')`): `<small>{t('scores.excludingCompetition')}</small>`
- Always visible regardless of `isEmpty` state
- Styled with reduced font size

---

## 5. Game Engine Dispatch Contract

### Score Calculation in `handleSubmitAnswer`

**Location**: `frontend/src/services/gameEngine.ts`

**Changed behavior**:
```
// Before:
points = (mode === 'competitive')
  ? calculateCompetitiveScore(...)
  : calculateScore(...)

// After:
points = calculateCompetitiveScore(...)  // All modes use same formula
```

**Impact**: Play and Improve modes now receive scores in [-10, +10] instead of [-2, +5]. Game score range changes from [-20, +50] to [-100, +100].

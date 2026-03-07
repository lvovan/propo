# Research: Competitive Mode — Scoring & UI Update

**Feature**: 032-competitive-scoring-ui  
**Date**: 2026-03-07

## Research Task 1: Point-Decay Scoring Formula & Integration

### Decision: Add `calculateCompetitiveScore()` to `scoring.ts`; call from `handleSubmitAnswer()` when `gameMode === 'competitive'`

### Rationale

The existing `calculateScore(isCorrect, elapsedMs, timerDurationMs)` implements the standard tier-based scoring (5/3/2/1/0 points correct, −2 incorrect). The competitive point-decay model has fundamentally different semantics:

- Correct answers **earn** the current point value (1–10, not 0–5)
- Incorrect answers **deduct** the same value (not a flat −2)
- The value is continuous/linear, not threshold-based

These differences make extending `calculateScore()` with a mode parameter messy. A separate pure function is cleaner and independently testable:

```typescript
// Constants
export const COMPETITIVE_MAX_POINTS = 10;
export const COMPETITIVE_MIN_POINTS = 1;

// Pure function
export function calculateCompetitiveScore(
  isCorrect: boolean,
  elapsedMs: number,
  timerDurationMs: number,
): number {
  const clamped = Math.min(elapsedMs, timerDurationMs);
  const fraction = clamped / timerDurationMs;
  // Linear decay from 10 → 1: pointValue = 10 - 9 * fraction
  const raw = COMPETITIVE_MAX_POINTS
    - (COMPETITIVE_MAX_POINTS - COMPETITIVE_MIN_POINTS) * fraction;
  const pointValue = Math.max(COMPETITIVE_MIN_POINTS, Math.floor(raw));
  return isCorrect ? pointValue : -pointValue;
}
```

**Integration point**: In `gameEngine.ts` → `handleSubmitAnswer()`, the line `points = calculateScore(isCorrect, elapsedMs, round.formula.timerDurationMs)` needs a conditional:

```typescript
if (state.gameMode === 'competitive') {
  points = calculateCompetitiveScore(isCorrect, elapsedMs, round.formula.timerDurationMs);
} else {
  points = calculateScore(isCorrect, elapsedMs, round.formula.timerDurationMs);
}
```

No other engine changes required — the `newScore = state.score + points` line already handles positive and negative values.

### Edge Cases Verified

| Scenario | elapsedMs | timerDurationMs | fraction | raw | floor | Result |
|----------|-----------|-----------------|----------|-----|-------|--------|
| Instant answer | 0 | 20000 | 0.000 | 10.0 | 10 | ±10 |
| Half time (numeric) | 10000 | 20000 | 0.500 | 5.5 | 5 | ±5 |
| Near expiry | 19500 | 20000 | 0.975 | 1.225 | 1 | ±1 |
| Exact expiry | 20000 | 20000 | 1.000 | 1.0 | 1 | ±1 |
| After expiry | 25000 | 20000 | 1.000* | 1.0 | 1 | ±1 |
| Story half time | 25000 | 50000 | 0.500 | 5.5 | 5 | ±5 |

*Clamped to `timerDurationMs`.

### Alternatives Considered

| Alternative | Why Rejected |
|---|---|
| Extend `calculateScore()` with a `gameMode` param | Mixes two unrelated scoring strategies; harder to test independently; existing callers would need updating |
| Continuous (non-floored) values | Spec requires "displayed integer is the floor of the continuous value at the moment of submission" — floating point scoring would create UI/math mismatches |
| Ceiling instead of floor | `ceil(1.0)` = 1, but `ceil(9.9)` = 10, which would make sub-second answers earn 10 even at 1+ seconds — inconsistent with the spec's "decreases linearly" intent |

---

## Research Task 2: Progress Bar Color Interpolation (Green → Orange → Red)

### Decision: Use CSS HSL interpolation via linear gradient stop calculation in the rAF tick

### Rationale

The existing `getBarColor()` in `useRoundTimer.ts` uses discrete CVD-safe color steps (green, lightGreen, orange, red) at threshold percentages. The spec requires **smooth** color transition for competitive mode.

HSL (Hue-Saturation-Lightness) provides the most natural interpolation for green→red:
- Green: `hsl(120, 80%, 33%)` ≈ `#0e8a1e`
- Orange: `hsl(30, 90%, 42%)` ≈ `#d47604`  
- Red: `hsl(0, 80%, 45%)` ≈ `#c5221f`

Linear hue interpolation from `120` (green) to `0` (red) as `elapsedPercent` goes from 0% to 100%:

```typescript
function getCompetitiveBarColor(elapsedMs: number, timerDurationMs: number): string {
  const fraction = Math.min(elapsedMs / timerDurationMs, 1);
  // Hue: 120 (green) → 0 (red) linearly
  const hue = 120 * (1 - fraction);
  // Saturation: keep high (80-90%)
  const saturation = 80 + 10 * fraction;
  // Lightness: slight adjustment for mid-range visibility
  const lightness = 33 + 12 * fraction;
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}
```

This produces a **smooth visual gradient** through green → yellow-green → orange → red-orange → red.

**Accessibility note**: The point value number is always displayed alongside the color, satisfying the constitution's requirement that "visual feedback (color) MUST never be the sole indicator of state." The color is a supplementary visual cue.

**Integration point**: In the rAF tick within `useRoundTimer.ts`, add a conditional to use `getCompetitiveBarColor()` when in competitive mode. The hook already writes style directly to the DOM ref, so this is a drop-in replacement for the color portion.

### Alternatives Considered

| Alternative | Why Rejected |
|---|---|
| CSS transition between 4 discrete colors | Not "smooth" as spec requires; visible color jumps |
| CSS `@keyframes` animation | Less precise — animation timing doesn't match the rAF tick; would fight with the imperative style writes |
| RGB linear interpolation | Green→red via RGB passes through muddy brown tones (poor visual quality) |

---

## Research Task 3: Aggregate Exclusion Strategy

### Decision: Change filter from `!== 'improve'` to `=== 'play'` in `playerStorage.ts`

### Rationale

Currently, `saveGameRecord()`, `getRecentAverage()`, `getRecentHighScores()`, and `getGameHistory()` all exclude only `improve` mode — meaning `competitive` is included. The clarification (FR-019) requires excluding `competitive` from these aggregates.

The simplest change: replace `(r.gameMode ?? 'play') !== 'improve'` with `(r.gameMode ?? 'play') === 'play'` in the three filter functions. In `saveGameRecord()`, change the aggregate update guard from `gameMode !== 'improve'` to `gameMode === 'play'`.

This:
- Excludes `competitive` from averages, high scores, sparkline, and cumulative totals
- Keeps backward compatibility (records with no `gameMode` default to `'play'`)
- Is a minimal 4-line change across the file
- Makes the filter intent explicit: "only play mode contributes to aggregates"

### Alternatives Considered

| Alternative | Why Rejected |
|---|---|
| Add a second filter condition `&& !== 'competitive'` | Works but is fragile — any future mode would need manual exclusion. `=== 'play'` is more robust |
| Keep competitive in aggregates but normalize scores | Spec clarification explicitly chose "exclude entirely" |
| Store competitive scores in separate player field | Over-engineering — game records already carry `gameMode` for filtering |

---

## Research Task 4: Share URL Format Migration

### Decision: Replace `time` param with `score` param in `shareUrl.ts`; make `totalTimeMs` optional in `SharedResult`

### Rationale

The current `SharedResult` interface and `encodeShareUrl()` encode `time` (total time in ms). The clarification (FR-021) replaces this with `score` for competitive results.

However, the share URL is also used by `SharedResultPage` to display results. We need to consider:

1. **Encoding**: For competitive results, encode `score` instead of `time`. Since the score is already in `SharedResult`, we only need to stop encoding `time` and change the param name.
2. **Decoding**: `decodeShareUrl()` should parse `score` from the URL. The `time` parameter becomes absent.
3. **SharedResultPage**: Must display score (not time) when time is absent.

The simplest approach: remove `totalTimeMs` from `SharedResult` entirely, since competitive mode (the only mode that uses sharing) no longer tracks time. The URL becomes `#/result?seed=abc123&player=Alice&score=45`.

```typescript
export interface SharedResult {
  seed: string;
  playerName: string;
  score: number;
}
```

This is a breaking change for old shared URLs (which had `time`), but since this feature isn't shipped yet (030-competitive-mode is still in development), there are no existing shared URLs to worry about.

### Alternatives Considered

| Alternative | Why Rejected |
|---|---|
| Keep both `time` and `score` params | Redundant — competition no longer shows time; adds complexity for zero value |
| Use a version param to differentiate old vs new format | Over-engineering for an unreleased feature |

---

## Research Task 5: Point Value Display on Progress Bar

### Decision: Add a `pointLabelRef` to `useRoundTimer` hook; render a `<span>` overlay on CountdownBar

### Rationale

The progress bar (`CountdownBar`) currently has one ref (`barRef`) that `useRoundTimer` writes to directly (width + color). For the point value display, we need to also write the current integer point value to a text element on each rAF tick.

Options considered:
1. **Additional ref**: Add a `pointLabelRef` managed by `useRoundTimer`. In the rAF tick (when competitive mode is active), calculate the point value and write it to `pointLabelRef.textContent`. The label `<span>` is rendered inside `CountdownBar` when a `pointLabelRef` is provided.
2. **React state**: Would cause re-renders 60x/sec — unacceptable for performance. The existing imperative approach using refs is correct.

The point value calculation in the rAF tick mirrors the scoring formula:

```typescript
const raw = 10 - 9 * (clampedElapsed / duration);
const pointValue = Math.max(1, Math.floor(raw));
pointLabelRef.current.textContent = String(pointValue);
```

**Bar thickness**: The competitive variant uses a conditional CSS class `.trackCompetitive` with `height: 16px` instead of the default `8px`.

### Alternatives Considered

| Alternative | Why Rejected |
|---|---|
| Separate component for competitive bar | Unnecessary duplication — 90% of logic is shared |
| CSS `::after` pseudo-element with `attr()` | Cannot dynamically update pseudo-element text content via JS; `attr()` is limited to data attributes and poorly supported for computed values |
| Tooltip/popover above bar | Distracting; takes additional space; harder to make accessible |

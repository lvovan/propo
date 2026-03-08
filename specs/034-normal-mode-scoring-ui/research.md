# Research: Normal Mode Scoring Alignment & UI Updates

**Feature**: 034-normal-mode-scoring-ui
**Date**: 2026-03-08
**Status**: Complete

## Research Task 1: Off-by-One Bug in Point Decay Formula

### Decision: Fix `Math.floor` placement in the linear decay formula

### Rationale

The current formula in both `calculateCompetitiveScore()` and `getCompetitivePointValue()`:

```
raw = MAX - (MAX - MIN) × fraction
pointValue = max(MIN, floor(raw))
```

With `MAX = 10`, `MIN = 1`:
- At `fraction = 0` (elapsed = 0ms): `raw = 10`, `floor(10) = 10` — correct
- At `fraction = ε` (elapsed = 1ms on 20s timer, ~0.00005): `raw ≈ 9.9996`, `floor(9.9996) = 9` — **bug**

The value 10 is only visible when `elapsed` is exactly 0, which means it effectively never appears on screen because `requestAnimationFrame` always fires with some small positive elapsed time.

**Fix**: Restructure to `MAX - floor((MAX - MIN) × fraction)`:
- At `fraction = 0`: `10 - floor(0) = 10`
- At `fraction = 0.11`: `10 - floor(0.99) = 10 - 0 = 10`
- At `fraction = 0.112`: `10 - floor(1.008) = 10 - 1 = 9`
- At `fraction = 1.0`: `10 - floor(9) = 10 - 9 = 1`

Each value gets exactly 1/10th of the timer duration (±1 frame).

### Alternatives considered

1. **Use `Math.ceil` instead of `Math.floor`**: Would produce 10→2 range instead of 10→1, losing the minimum score of 1.
2. **Add a time offset**: Shift the start time by ~2 seconds to keep 10 visible. Rejected — fragile and timer-dependent.
3. **Use `Math.round`**: Would split boundaries unevenly between values, creating a visible stutter at transitions.

---

## Research Task 2: Scoring Unification Strategy

### Decision: Replace `calculateScore()` calls with `calculateCompetitiveScore()` for Normal Mode

### Rationale

Currently:
- **Normal Mode** uses `calculateScore()` — threshold-based (5/3/2/1/0 correct, -2 incorrect)
- **Competition Mode** uses `calculateCompetitiveScore()` — linear decay (10→1, ±N)

The spec requires both modes to use the same linear decay. The clearest approach:

1. Fix the off-by-one bug in `calculateCompetitiveScore()` and `getCompetitivePointValue()`
2. In `gameEngine.ts`, change the `handleSubmitAnswer` dispatch to use `calculateCompetitiveScore()` for all modes (not just competitive)
3. Keep `calculateScore()` in place (not deleted) for backward compatibility or future use, but remove its usage from the game engine

This requires changes in exactly 3 locations:
- `scoring.ts`: Fix formula (used by both `calculateCompetitiveScore` and `getCompetitivePointValue`)
- `gameEngine.ts`: Change play/improve mode to use `calculateCompetitiveScore`
- `useRoundTimer.ts`: Enable point label display and competitive bar behavior for all modes

### Alternatives considered

1. **Rename `calculateCompetitiveScore` to a generic name**: Would improve naming but adds unnecessary churn. The function name doesn't affect behavior.
2. **Create a new unified function**: Adds complexity with no benefit — the existing `calculateCompetitiveScore` already implements the correct algorithm.
3. **Modify `calculateScore` to match competitive**: Risks breaking the function's contract and existing tests.

---

## Research Task 3: Progress Bar Unification (Visual + Behavioral)

### Decision: Apply competitive bar styling to all modes; add localized point label

### Rationale

Currently the `CountdownBar` component has two rendering paths:
- **Play Mode**: 8px track, countdown timer text ("19.2s"), 4-step color thresholds
- **Competitive Mode**: 16px track, point value label, smooth HSL color gradient

After unification, all modes need:
- Thicker track (currently competitive uses 16px — spec says "thicker than before")
- Point label showing "X points" / "X point" text instead of just the number
- The `competitive` CSS class controls track height

**Implementation approach**:
- Remove the `competitive` flag distinction in `CountdownBar` — always render the thicker bar with point label
- `useRoundTimer` should always compute and display point values, not countdown text
- Colors: Use the smooth HSL gradient (currently competitive-only) for both modes, as it pairs better with the point-decay display
- Keep the countdown timer display hidden (same as competitive) since point value is now shown

### Alternatives considered

1. **Keep timer text alongside point label**: Clutters the bar with two values. Rejected for simplicity.
2. **Create a third variant**: Unnecessary complexity when the competitive bar is the target design.
3. **Keep step-based colors for play mode**: Inconsistent with the unified scoring model and visually jarring with the smooth decay.

---

## Research Task 4: i18n Pluralization for Point Labels

### Decision: Use manual singular/plural i18n keys (no pluralization library)

### Rationale

The app uses a simple interpolation-based i18n system without pluralization support. Adding a full ICU pluralization library (e.g., `@formatjs/intl`) would be overkill for a single use case.

**Approach**: Add two keys per language:
- `'game.pointSingular'`: "point" / "ponto" / "punto" / "Punkt" / "point" / "ポイント"
- `'game.pointPlural'`: "points" / "pontos" / "puntos" / "Punkte" / "points" / "ポイント"

The display code selects the key based on `value === 1`.

**Language-specific forms**:
| Language | Singular | Plural | Notes |
|----------|----------|--------|-------|
| en | point | points | |
| fr | point | points | |
| es | punto | puntos | |
| de | Punkt | Punkte | |
| pt | ponto | pontos | |
| ja | ポイント | ポイント | Same form (no grammatical plural) |

### Alternatives considered

1. **Full ICU MessageFormat**: Heavy dependency; the app only needs one singular/plural distinction. Rejected per YAGNI.
2. **Single key with conditional suffix in code**: `"{score} point{s}"` — doesn't work for languages where the plural isn't just adding "s" (e.g., German Punkt → Punkte).
3. **Template string with plural directly**: `"{score} {pointWord}"` with interpolation — This is essentially what we're doing, just with explicit key names.

---

## Research Task 5: Home Screen Label Placement

### Decision: Add "excluding competition games" as subtitle below `scores.title` in RecentHighScores

### Rationale

The `RecentHighScores` component renders the heading from `t('scores.title')` ("Recent High Scores"). The exclusion note should appear directly below this heading as a `<small>` element.

**New i18n key**: `'scores.excludingCompetition'`
| Language | Value |
|----------|-------|
| en | excluding competition games |
| fr | hors jeux de compétition |
| es | excluyendo juegos de competición |
| de | ohne Wettbewerbsspiele |
| pt | excluindo jogos de competição |
| ja | 対戦ゲームを除く |

### Alternatives considered

1. **Modify the heading itself**: "Recent High Scores (excl. competition)" — Makes the heading too long and harder to translate.
2. **Show only when competition games exist**: Adds state management complexity for marginal UX benefit. The spec requires it always visible.
3. **Tooltip on hover**: Not accessible on touch devices; violates Constitution Principle I.

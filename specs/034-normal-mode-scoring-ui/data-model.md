# Data Model: Normal Mode Scoring Alignment & UI Updates

**Feature**: 034-normal-mode-scoring-ui
**Date**: 2026-03-08

## Entities

### Point Decay Function

Maps elapsed time to an integer point value for a single round.

| Attribute | Type | Description |
|-----------|------|-------------|
| `maxPoints` | integer | Starting value (10) |
| `minPoints` | integer | Ending/minimum value (1) |
| `timerDurationMs` | integer | Total round timer in milliseconds |
| `elapsedMs` | integer | Time elapsed since round start |

**Derived value**:
```
pointValue = maxPoints - floor((maxPoints - minPoints) × (elapsedMs / timerDurationMs))
pointValue = max(minPoints, pointValue)
```

**Value distribution** (for 20-second timer):
| Point Value | Time Range (seconds) | Duration |
|-------------|---------------------|----------|
| 10 | 0.000 – 2.222 | 2.222s |
| 9 | 2.222 – 4.444 | 2.222s |
| 8 | 4.444 – 6.667 | 2.222s |
| 7 | 6.667 – 8.889 | 2.222s |
| 6 | 8.889 – 11.111 | 2.222s |
| 5 | 11.111 – 13.333 | 2.222s |
| 4 | 13.333 – 15.556 | 2.222s |
| 3 | 15.556 – 17.778 | 2.222s |
| 2 | 17.778 – 20.000 | 2.222s |
| 1 | ≥ 20.000 (expired) | — |

### Round Score

Points earned or lost in a single round.

| Attribute | Type | Description |
|-----------|------|-------------|
| `points` | integer | Points for this round (-10 to +10) |
| `isCorrect` | boolean | Whether the answer was correct |
| `elapsedMs` | number | Time taken to answer |

**Rules**:
- Correct answer: `points = +pointValue` (from decay function at `elapsedMs`)
- Incorrect answer: `points = -pointValue`
- Timer expired: `points = -1` (min point value, negative)

### Game Score

Cumulative score for a complete game.

| Attribute | Type | Description |
|-----------|------|-------------|
| `score` | integer | Sum of all round scores |
| `gameMode` | enum | `'play'`, `'improve'`, `'competitive'` |

**Constraints**:
- Range: -100 to +100 (10 rounds × ±10 max per round)
- Applies identically to Play and Competitive modes
- Improve mode uses same formula but scores excluded from aggregation

## State Transitions

```
Round Start
  │
  ├─ pointValue = 10 (elapsed = 0)
  │
  ▼
Timer Running (rAF loop)
  │
  ├─ pointValue decays: 10 → 9 → 8 → ... → 2 → 1
  ├─ Progress bar updates: width %, color, label text
  │
  ├─► Player answers correctly → +pointValue → Feedback
  ├─► Player answers incorrectly → -pointValue → Feedback
  └─► Timer expires → -1 → Feedback
```

## Relationships

- **Point Decay Function** is consumed by **Round Score** (provides pointValue at answer time)
- **Round Score** aggregates into **Game Score** (10 rounds per game)
- **Game Score** feeds into **RecentHighScores** display (Play mode only, Competition excluded)

## i18n Data

### New Keys

| Key | Purpose |
|-----|---------|
| `game.pointSingular` | "point" — singular form for progress bar label |
| `game.pointPlural` | "points" — plural form for progress bar label |
| `scores.excludingCompetition` | "excluding competition games" — home screen subtitle |

### Translations

| Key | en | fr | es | de | pt | ja |
|-----|----|----|----|----|----|----|
| `game.pointSingular` | point | point | punto | Punkt | ponto | ポイント |
| `game.pointPlural` | points | points | puntos | Punkte | pontos | ポイント |
| `scores.excludingCompetition` | excluding competition games | hors jeux de compétition | excluyendo juegos de competición | ohne Wettbewerbsspiele | excluindo jogos de competição | 対戦ゲームを除く |

## Validation Rules

- `elapsedMs` must be ≥ 0 and ≤ `timerDurationMs`
- `pointValue` must be an integer in range [1, 10]
- `score` (game total) must be an integer in range [-100, 100]
- Singular form used when `pointValue === 1`; plural otherwise

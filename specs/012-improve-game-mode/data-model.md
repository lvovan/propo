# Data Model: Improve Game Mode

**Feature**: 012-improve-game-mode  
**Date**: 2026-02-16  
**Updated**: 2026-03-06  
**Source**: [spec.md](spec.md), [research.md](research.md)

## Entity Diagram

```
PlayerStore (v5)
└── Player[]
    └── gameHistory: GameRecord[]
        ├── score: number
        ├── completedAt: number
        ├── gameMode?: 'play' | 'improve'     ← NEW
        └── rounds?: RoundResult[]             ← NEW
            ├── type: QuestionType
            ├── values: number[]
            ├── isCorrect: boolean
            └── elapsedMs: number
```

## Entities

### RoundResult (NEW)

A record of a single round's outcome within a completed game. Captures the initial-attempt data from the primary phase.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | `QuestionType` | Yes | Which question category this round used (`'percentage'`, `'ratio'`, `'fraction'`, `'ruleOfThree'`) |
| `values` | `number[]` | Yes | The values array from the formula (for challenge analysis) |
| `isCorrect` | `boolean` | Yes | Whether the player answered correctly on the initial (primary-phase) attempt |
| `elapsedMs` | `number` | Yes | Response time in milliseconds for the initial (primary-phase) attempt |

**Notes**:
- Captures the **initial attempt** data, not replay data. If a round was replayed, `isCorrect` is `false` and `elapsedMs` reflects the time before replay.
- Legacy records from the multiplication-based game may contain `factorA`/`factorB` instead of `type`/`values`; these are skipped during challenge analysis.

### GameRecord (EXTENDED)

Existing entity extended with two optional fields.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `score` | `number` | Yes | Total points scored (existing) |
| `completedAt` | `number` | Yes | Unix timestamp of game completion (existing) |
| `rounds` | `RoundResult[]` | No | Per-round results from the primary phase. Array of exactly 10 entries for games recorded post-v5. Absent for pre-v5 records. |
| `gameMode` | `'play' \| 'improve'` | No | Which mode this game was played in. Absent for pre-v5 records (implicitly `'play'`). |

**Notes**:
- `rounds` is optional because pre-v5 game records lack this data. Consumers default to `?? []`.
- `gameMode` is optional because pre-v5 records are implicitly `'play'`. Consumers default to `?? 'play'`.
- When `gameMode === 'improve'`, the record MUST be excluded from `updatePlayerScore()`, `getRecentHighScores()`, `getRecentAverage()`, `getGameHistory()` (for progression graph), `totalScore`, and `gamesPlayed` aggregations.

### GameMode (NEW — type alias)

```typescript
type GameMode = 'play' | 'improve';
```

Used by the game engine, hooks, and components to propagate mode context through the game lifecycle.

### ChallengingItem (DERIVED — not persisted)

Computed by the challenge analysis function from recent games' `RoundResult[]` data, grouped by question type.

| Field | Type | Description |
|-------|------|-------------|
| `type` | `QuestionType` | Question category this item targets (`'percentage'`, `'ratio'`, `'fraction'`, `'ruleOfThree'`) |
| `mistakeCount` | `number` | Total incorrect answers across analyzed games (≥ 0) |
| `avgMs` | `number` | Mean response time in ms across all occurrences (> 0) |

**Notes**:
- When mistakes exist: only categories with mistakes are returned, sorted by `mistakeCount` desc, then `avgMs` desc.
- When all correct: all categories are returned, sorted by `avgMs` desc (slowest = trickiest).

## Relationships

```
Player ──has-many──▶ GameRecord ──has-many──▶ RoundResult
                     │
                     └── gameMode distinguishes Play vs. Improve

GameRecord ──analyzed-by──▶ identifyChallengingItems() ──produces──▶ ChallengingItem[]
                                                                      │
ChallengingItem[] ──used-by──▶ generateImproveFormulas() ──produces──▶ Formula[]
ChallengingItem[] ──used-by──▶ extractTrickyCategories() ──produces──▶ QuestionType[]
```

## Validation Rules

| Entity | Rule | Source |
|--------|------|--------|
| `RoundResult.type` | One of `'percentage'`, `'ratio'`, `'fraction'`, `'ruleOfThree'` | Question categories |
| `RoundResult.values` | Non-empty array of positive integers | Formula values |
| `RoundResult.elapsedMs` | value > 0 | Must be a positive response time |
| `GameRecord.rounds` | Length = 10 when present | 10 primary rounds per game |
| `GameRecord.gameMode` | `'play'` or `'improve'` when present | Two valid modes |
| `Player.gameHistory` | Length ≤ 100 | Existing cap, enforced on write |

## State Transitions

### Game Mode Selection

```
not-started ──[user selects Play]──▶ playing (gameMode='play')
not-started ──[user selects Improve]──▶ playing (gameMode='improve')
```

### Game Completion (score persistence)

```
completed ──[gameMode='play']──▶ updatePlayerScore() + saveRoundResults()
completed ──[gameMode='improve']──▶ saveRoundResults() only (NO score update)
```

### Challenging Category Analysis

```
GameRecord[] (up to 10 recent with rounds[]) ──▶ identifyChallengingItems()
  ├── categories found ──▶ Improve button shown
  └── no categories ──▶ Improve button hidden + encouraging message
```

## Migration

### v4 → v5

- Bump `CURRENT_VERSION` from 4 to 5.
- Add migration block: `if (parsed.version === 4) { parsed.version = 5; writeStore(parsed); }`
- No data transformation — existing `GameRecord` objects are not modified.
- New records created post-migration include `rounds` and `gameMode` fields.

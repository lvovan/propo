# Data Model: Competitive Mode — Scoring & UI Update

**Feature**: 032-competitive-scoring-ui  
**Date**: 2026-03-07

## Overview

This feature modifies scoring logic, UI display behavior, and aggregate filtering. No new types or entities are introduced. Existing types are narrowed or extended with modified semantics for competitive mode.

## Modified Entities

### Round (unchanged structure, modified semantics)

```
Round
├── formula: Formula          # Unchanged
├── playerAnswer: number|null # Unchanged
├── isCorrect: boolean|null   # Unchanged
├── elapsedMs: number|null    # Unchanged
├── points: number|null       # MODIFIED RANGE: was [-2, 5]; now [-10, 10] for competitive
├── firstTryCorrect: boolean|null # Unchanged
```

**Changes**: The `points` field stores competitive point-decay values (−10 to +10) when `gameMode === 'competitive'`. No structural change — the field already accepts any integer. The extended range only affects competitive mode; play/improve modes continue to use −2 to +5.

### GameState (unchanged structure)

```
GameState
├── status: 'not-started'|'playing'|'replay'|'completed'
├── rounds: Round[]
├── replayQueue: number[]
├── currentRoundIndex: number
├── currentPhase: 'input'|'feedback'
├── score: number             # MODIFIED RANGE: was [0, 50]; now [-100, 100] for competitive
├── gameMode: GameMode
├── seed?: string
```

**Changes**: The `score` field can now be negative in competitive mode. Was bounded 0–50; now ranges −100 to +100 for competitive (unchanged for play/improve). No structural change.

### GameRecord (unchanged structure, modified semantics)

```
GameRecord
├── score: number             # Can be negative for competitive
├── completedAt: number
├── rounds?: RoundResult[]
├── gameMode?: GameMode
```

**Changes**: `score` can now be negative for competitive records stored in game history.

### SharedResult (MODIFIED — field removed)

```
SharedResult (BEFORE)              SharedResult (AFTER)
├── seed: string                   ├── seed: string
├── playerName: string             ├── playerName: string
├── score: number                  ├── score: number
├── totalTimeMs: number            # REMOVED
```

**Changes**: `totalTimeMs` removed entirely. Competition mode no longer tracks or shares completion time. The share URL format changes from `#/result?seed=...&player=...&score=...&time=...` to `#/result?seed=...&player=...&score=...`.

## New Constants

| Constant | Value | Location | Purpose |
|----------|-------|----------|---------|
| `COMPETITIVE_MAX_POINTS` | `10` | `scoring.ts` | Starting point value per competitive round |
| `COMPETITIVE_MIN_POINTS` | `1` | `scoring.ts` | Minimum point value (at/after timer expiry) |

## Modified Behaviors (by function)

### Scoring

| Function | Before | After |
|----------|--------|-------|
| `calculateScore()` | Used for all modes | Unchanged — still used for play/improve |
| `calculateCompetitiveScore()` | N/A | NEW: linear decay 10→1, returns ±pointValue |

### Aggregates

| Function | Before | After |
|----------|--------|-------|
| `saveGameRecord()` | Aggregates for `gameMode !== 'improve'` | Aggregates for `gameMode === 'play'` only |
| `getRecentAverage()` | Filters `!== 'improve'` | Filters `=== 'play'` |
| `getRecentHighScores()` | Filters `!== 'improve'` | Filters `=== 'play'` |
| `getGameHistory()` | Filters `!== 'improve'` | Filters `=== 'play'` |

### Share URL

| Function | Before | After |
|----------|--------|-------|
| `encodeShareUrl()` | Encodes `seed, player, score, time` | Encodes `seed, player, score` |
| `decodeShareUrl()` | Requires `seed, player, score, time` | Requires `seed, player, score` |

## Validation Rules

| Field | Rule | Scope |
|-------|------|-------|
| `Round.points` | −10 ≤ points ≤ 10 | Competitive mode only |
| `Round.points` | −2 ≤ points ≤ 5 | Play mode only |
| `GameState.score` | −100 ≤ score ≤ 100 | Competitive mode only |
| `GameState.score` | 0 ≤ score ≤ 50 | Play mode only |
| Seed input | Trimmed, lowercased, 1–100 chars | Competitive setup |

## State Transitions

No changes to game state machine. The `playing → completed` transition (skipping replay) from 030-competitive-mode is unchanged. Only the score values computed within each round differ.

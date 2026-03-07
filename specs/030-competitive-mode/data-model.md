# Data Model: Competitive Mode

**Feature**: 030-competitive-mode  
**Date**: 2026-03-07

## Entity Changes

### 1. GameMode (modified)

**File**: `frontend/src/types/player.ts`

**Before:**
```typescript
export type GameMode = 'play' | 'improve';
```

**After:**
```typescript
export type GameMode = 'play' | 'improve' | 'competitive';
```

**Impact**: All code referencing `GameMode` must handle the new variant. Competition is treated like `'play'` for scoring aggregates.

---

### 2. GameState (modified)

**File**: `frontend/src/types/game.ts`

**Before:**
```typescript
export interface GameState {
  status: GameStatus;
  rounds: Round[];
  replayQueue: number[];
  currentRoundIndex: number;
  currentPhase: 'input' | 'feedback';
  score: number;
  gameMode: 'play' | 'improve';
}
```

**After:**
```typescript
export interface GameState {
  status: GameStatus;
  rounds: Round[];
  replayQueue: number[];
  currentRoundIndex: number;
  currentPhase: 'input' | 'feedback';
  score: number;
  gameMode: GameMode;
  seed?: string;  // Only set for competitive mode
}
```

**New field**: `seed?: string` — stores the game seed for display on setup/results screens. Optional to avoid breaking play/improve flows.

---

### 3. GameAction (modified)

**File**: `frontend/src/services/gameEngine.ts`

**Before:**
```typescript
export type GameAction =
  | { type: 'START_GAME'; formulas: Formula[]; mode?: 'play' | 'improve' }
  | { type: 'SUBMIT_ANSWER'; answer: number; elapsedMs: number }
  | { type: 'NEXT_ROUND' }
  | { type: 'RESET_GAME' };
```

**After:**
```typescript
export type GameAction =
  | { type: 'START_GAME'; formulas: Formula[]; mode?: GameMode; seed?: string }
  | { type: 'SUBMIT_ANSWER'; answer: number; elapsedMs: number }
  | { type: 'NEXT_ROUND' }
  | { type: 'RESET_GAME' };
```

**Changes**: `mode` now accepts `'competitive'`; optional `seed` field added.

---

### 4. GameRecord (unchanged)

**File**: `frontend/src/types/player.ts`

```typescript
interface GameRecord {
  score: number;
  completedAt: number;
  rounds?: RoundResult[];
  gameMode?: GameMode;
}
```

No structural changes needed. The `gameMode` field already uses the `GameMode` type which now includes `'competitive'`. The seed is not stored in the game record since it's only needed at generation time and on the results screen (available from `GameState.seed`).

**Note on Total Time**: Total time is a **computed value**, not a stored field. It is derived at display time from the `rounds[]` array in `GameState`: `sum(round.elapsedMs) + (count of incorrect rounds × WRONG_ANSWER_PENALTY_MS)`. See `totalTime.ts` service contract in [contracts/components.md](contracts/components.md).

---

### 5. Session (unchanged)

**File**: `frontend/src/types/player.ts`

No changes to the Session interface. The pending seed from a URL parameter is stored as a **separate sessionStorage key** (`propo_pending_seed`) rather than modifying the Session type. See Section 7 (Storage Schema) for details.

---

### 6. SharedResult (new)

**File**: `frontend/src/services/shareUrl.ts`

```typescript
export interface SharedResult {
  seed: string;        // Game seed
  playerName: string;  // Sharer's display name
  score: number;       // 0–50
  totalTimeMs: number; // Total time in ms (including penalties)
}
```

**Purpose**: Decoded from the share URL parameters. Used by `SharedResultPage` for display.

**URL Encoding**:
```
/#/result?seed={seed}&player={playerName}&score={score}&time={totalTimeMs}
```

---

### 7. Scoring Constants (modified)

**File**: `frontend/src/constants/scoring.ts`

**New constant:**
```typescript
export const WRONG_ANSWER_PENALTY_MS = 60_000; // 1 minute penalty per wrong answer
```

---

## State Flow Diagrams

### Competition Mode Lifecycle

```
URL with ?seed=abc123
    │
    ▼
┌──────────────────────┐
│  Has active session?  │
│                      │
│  YES ───────────────────► MainPage (seed pre-filled)
│  NO  ───────────────────► WelcomePage (seed in sessionStorage)
│                      │       │
└──────────────────────┘       │ select/create profile
                               ▼
                          MainPage (seed from sessionStorage)
                               │
                               ▼
                     ┌─────────────────────┐
                     │  Competition Setup   │
                     │  - Seed visible      │
                     │  - Start game button │
                     └────────┬────────────┘
                              │ press Start
                              ▼
                     ┌─────────────────────┐
                     │  10 Primary Rounds   │
                     │  (no replay queue)   │
                     └────────┬────────────┘
                              │ round 10 complete
                              ▼
                     ┌─────────────────────┐
                     │  Results Screen      │
                     │  - Score (0–50)      │
                     │  - Total Time + pen. │
                     │  - Seed displayed    │
                     │  - Share button      │
                     └─────────────────────┘
```

### Scoring Aggregate Rules

| Mode | totalScore | gamesPlayed | recentHighScores | progressionGraph |
|------|-----------|-------------|------------------|------------------|
| play | ✅ included | ✅ included | ✅ included | ✅ included |
| improve | ❌ excluded | ❌ excluded | ❌ excluded | ❌ excluded |
| competitive | ✅ included | ✅ included | ✅ included | ✅ included |

Implementation: In `playerStorage.ts`, competitive games follow the same code path as play games for all aggregation functions.

---

## Storage Schema

### localStorage (unchanged key: `propo_players`)

No schema version bump needed. The `GameMode` type is expanded but `gameMode` was already an optional string field. Existing records without `gameMode` or with `'play'`/`'improve'` continue to work. New records may have `gameMode: 'competitive'`.

### sessionStorage (key: `propo_session`)

No changes. Session interface is unchanged.

### sessionStorage (key: `propo_pending_seed`)

Separate sessionStorage key for the pending seed from a URL parameter. Set when URL seed detected, read and deleted when Competition setup loads. Isolates the temporary seed from the session lifecycle. No Session type modification needed.

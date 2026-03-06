# API Contract: Challenge Analyzer

**Feature**: 017-practice-mode-update
**Date**: 2026-02-16
**Updated**: 2026-03-06
**Module**: `frontend/src/services/challengeAnalyzer.ts`

This is a client-side TypeScript module (no HTTP API). The contract defines the public function signatures that other modules depend on.

> **Note**: As of March 2026, the game was reworked from multiplication tables to proportional reasoning (percentages, ratios, fractions, rule-of-three). The challenge analyzer now groups by **question type** rather than factor pairs.

---

## Function: `getChallengingItemsForPlayer`

**Signature**:
```typescript
function getChallengingItemsForPlayer(playerName: string): ChallengingItem[]
```

**Behavior**:

| Aspect | Description |
|--------|-------------|
| Analysis window | Up to 10 most recent games with rounds containing the `type` field |
| Ranking signal | `mistakeCount` (total incorrect across games per category), tiebroken by `avgMs` |
| Fallback (no mistakes) | Returns all categories ranked by `avgMs` descending (slowest = most tricky) |
| Game mode filter | None (analyzes both `play` and `improve` records) |
| Legacy handling | Records without `type` field (old multiplication format) are skipped |

**Input**:
- `playerName: string` — case-insensitive lookup

**Output**:
- `ChallengingItem[]` sorted by:
  1. `mistakeCount` descending (most mistakes first)
  2. `avgMs` descending (slowest first, as tiebreaker)
  3. When ALL categories have `mistakeCount === 0`: sorted by `avgMs` descending only

**Preconditions**:
- Player must exist in localStorage
- Player must have at least one `GameRecord` with `rounds` data containing the `type` field

**Postconditions**:
- When mistakes exist: only categories with `mistakeCount > 0` are returned
- When no mistakes exist: all encountered categories are returned, ranked by response time

---

## Function: `identifyChallengingItems`

**Signature**:
```typescript
function identifyChallengingItems(allRounds: RoundResult[]): ChallengingItem[]
```

**Algorithm**:
1. Filter to rounds that have a `type` field (skip legacy multiplication records)
2. Group rounds by `type` (`percentage`, `ratio`, `fraction`, `ruleOfThree`)
3. For each type: count incorrect (`mistakeCount`), sum `elapsedMs` (`totalMs`), count total occurrences
4. Compute `avgMs = totalMs / occurrences`
5. If any category has `mistakeCount > 0`:
   - Filter to categories with `mistakeCount > 0`
   - Sort by `mistakeCount` desc, then `avgMs` desc
6. Else (all correct):
   - Sort all categories by `avgMs` desc
7. Return `ChallengingItem[]`

---

## Function: `extractTrickyCategories`

**Signature**:
```typescript
function extractTrickyCategories(items: ChallengingItem[]): QuestionType[]
```

**Behavior**: Returns up to 3 `QuestionType` values from the pre-sorted input, ordered by difficulty.

---

## Consumers

| Consumer | What it reads | Impact |
|----------|--------------|--------|
| `useGame.ts` → `startGame('improve', name)` | Calls `getChallengingItemsForPlayer` | Passes result to `generateImproveFormulas` |
| `MainPage.tsx` | Calls `getChallengingItemsForPlayer` + `extractTrickyCategories` | Uses result for button visibility + category label display |
| `formulaGenerator.ts` → `generateImproveFormulas` | Reads `type` from `ChallengingItem[]` | Biases question distribution toward challenging categories |
| Tests (`challengeAnalyzer.test.ts`) | Asserts on `difficultyRatio` field | **Must update** — replace `difficultyRatio` assertions with `mistakeCount`/`avgMs` |

---

## Component Contract: `GameStatus`

**File**: `frontend/src/components/GamePlay/GameStatus/GameStatus.tsx`

**Behavior change**:

| Aspect | Before | After |
|--------|--------|-------|
| Timer text (`<span ref={timerRef}>`) | Always rendered during input phase | Rendered only when `gameMode !== 'improve'` |
| `<CountdownBar>` component | Always rendered during input phase | Rendered only when `gameMode !== 'improve'` |
| All other rendering | — | Unchanged |

**Props** (unchanged):
```typescript
interface GameStatusProps {
  roundNumber: number;
  totalRounds: number;
  score: number;
  timerRef: RefObject<HTMLElement | null>;
  barRef: RefObject<HTMLDivElement | null>;
  isReplay: boolean;
  currentPhase: 'input' | 'feedback';
  isCorrect: boolean | null;
  correctAnswer: number | null;
  completedRound: number;
  gameMode?: GameMode;   // Already exists — drives conditional rendering
}
```

No new props needed. `gameMode` already controls the score/practice badge toggle; it now additionally controls timer/bar visibility.

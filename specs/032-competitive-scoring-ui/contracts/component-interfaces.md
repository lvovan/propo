# Contracts: Competitive Mode — Scoring & UI Update

**Feature**: 032-competitive-scoring-ui  
**Date**: 2026-03-07

## 1. Scoring Functions

### `calculateCompetitiveScore` (NEW)

**Location**: `frontend/src/constants/scoring.ts`

```typescript
/**
 * Calculate points for a single competitive round using point-decay model.
 * Point value decreases linearly from 10 to 1 over the round timer duration.
 * Correct answers earn the current value; incorrect answers lose it.
 *
 * @param isCorrect — Whether the answer was correct
 * @param elapsedMs — Response time in milliseconds
 * @param timerDurationMs — Total timer duration for this round type
 * @returns Positive value for correct, negative for incorrect (range: -10 to +10)
 */
export function calculateCompetitiveScore(
  isCorrect: boolean,
  elapsedMs: number,
  timerDurationMs: number,
): number;
```

**Behavior**:
- `pointValue = Math.max(1, Math.floor(10 - 9 * Math.min(elapsedMs, timerDurationMs) / timerDurationMs))`
- Returns `+pointValue` if correct, `-pointValue` if incorrect

---

## 2. Timer Hook Extension

### `useRoundTimer` (MODIFIED)

**Location**: `frontend/src/hooks/useRoundTimer.ts`

```typescript
// New parameter
export function useRoundTimer(
  reducedMotion?: boolean,
  competitiveMode?: boolean,   // NEW
): UseRoundTimerReturn;

// Extended return type
export interface UseRoundTimerReturn {
  displayRef: React.RefObject<HTMLElement | null>;
  barRef: React.RefObject<HTMLDivElement | null>;
  pointLabelRef: React.RefObject<HTMLElement | null>;  // NEW: point value text
  start: () => void;
  stop: () => number;
  reset: () => void;
  setDuration: (ms: number) => void;
}
```

**Behavioral changes when `competitiveMode === true`**:
- rAF tick writes `pointValue` to `pointLabelRef.current.textContent`
- rAF tick uses HSL hue interpolation (120→0) for bar color instead of discrete thresholds
- `displayRef` is NOT updated (timer text hidden by component)

---

## 3. CountdownBar Component (MODIFIED)

**Location**: `frontend/src/components/GamePlay/CountdownBar/CountdownBar.tsx`

```typescript
interface CountdownBarProps {
  barRef: RefObject<HTMLDivElement | null>;
  pointLabelRef?: RefObject<HTMLElement | null>;  // NEW: when provided, renders point label
  competitive?: boolean;                           // NEW: when true, uses thicker track
}
```

**CSS additions** (`CountdownBar.module.css`):
```css
.trackCompetitive {
  height: 16px;       /* 2x default 8px */
  position: relative; /* for point label positioning */
}

.pointLabel {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-weight: bold;
  font-size: 12px;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  pointer-events: none;
}
```

---

## 4. GameStatus Component (MODIFIED)

**Location**: `frontend/src/components/GamePlay/GameStatus/GameStatus.tsx`

```typescript
// Existing condition changes:
// WAS:  {gameMode !== 'improve' && ( ... timer + bar ... )}
// NOW:  {gameMode !== 'improve' && (
//          <>
//            {gameMode !== 'competitive' && (
//              <div className={styles.timer}>
//                <span ref={timerRef}>20.0s</span>
//              </div>
//            )}
//            <CountdownBar
//              barRef={barRef}
//              pointLabelRef={gameMode === 'competitive' ? pointLabelRef : undefined}
//              competitive={gameMode === 'competitive'}
//            />
//          </>
//        )}
```

**Behavioral changes**:
- Timer text display hidden for `competitive` mode (FR-013)
- CountdownBar receives competitive props when in competitive mode

---

## 5. CompetitionSetup Component (MODIFIED)

**Location**: `frontend/src/components/GamePlay/CompetitionSetup/CompetitionSetup.tsx`

```typescript
// Seed input handler change:
// WAS:  onChange={(e) => setSeed(e.target.value)}
// NOW:  onChange={(e) => setSeed(e.target.value.toLowerCase())}
```

Single-line change. Forces all typed and pasted input to lowercase (FR-011).

---

## 6. ScoreSummary Component (MODIFIED)

**Location**: `frontend/src/components/GamePlay/ScoreSummary/ScoreSummary.tsx`

```typescript
// Competition info section changes:
// WAS:  Shows totalTime + seed
// NOW:  Shows seed only (no totalTime)

// The score is already displayed by the existing non-improve block.
// Remove the totalTime section from the competitive info block.
```

---

## 7. Share URL Functions (MODIFIED)

**Location**: `frontend/src/services/shareUrl.ts`

```typescript
// BEFORE
export interface SharedResult {
  seed: string;
  playerName: string;
  score: number;
  totalTimeMs: number;
}

// AFTER
export interface SharedResult {
  seed: string;
  playerName: string;
  score: number;
}

// encodeShareUrl: remove time param
// decodeShareUrl: remove time param requirement
```

---

## 8. playerStorage Functions (MODIFIED)

**Location**: `frontend/src/services/playerStorage.ts`

```typescript
// All 4 functions change filter:
// WAS:  (r.gameMode ?? 'play') !== 'improve'
// NOW:  (r.gameMode ?? 'play') === 'play'

// saveGameRecord aggregate guard:
// WAS:  if (gameMode !== 'improve')
// NOW:  if (gameMode === 'play')
```

---

## 9. Game Engine (MODIFIED)

**Location**: `frontend/src/services/gameEngine.ts`

```typescript
// In handleSubmitAnswer(), after `if (state.status === 'playing')`:
// WAS:  points = calculateScore(isCorrect, elapsedMs, round.formula.timerDurationMs);
// NOW:
if (state.gameMode === 'competitive') {
  points = calculateCompetitiveScore(isCorrect, elapsedMs, round.formula.timerDurationMs);
} else {
  points = calculateScore(isCorrect, elapsedMs, round.formula.timerDurationMs);
}
```

---

## 10. SharedResultPage (MODIFIED)

**Location**: `frontend/src/pages/SharedResultPage.tsx`

```typescript
// Remove totalTime display
// Score display remains unchanged
// "Play this game" button unchanged
```

---

## 11. URL Seed Normalization (MODIFIED)

**Location**: `frontend/src/pages/MainPage.tsx`

```typescript
// Where seed is extracted from URL hash:
// WAS:  const seed = searchParams.get('seed');
// NOW:  const seed = searchParams.get('seed')?.toLowerCase() ?? null;
```

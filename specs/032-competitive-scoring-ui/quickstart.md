# Quickstart: Competitive Mode — Scoring & UI Update

**Feature**: 032-competitive-scoring-ui  
**Date**: 2026-03-07  
**Prerequisite**: 030-competitive-mode must be implemented first

## What This Feature Does

Replaces the time-penalty scoring model in Competition mode with a point-decay model:
- Each round starts at **10 points**, decreasing linearly to **1** over the timer duration
- Correct answers **earn** the current value; incorrect answers **lose** it
- Final score ranges from **−100 to +100** (sum of 10 rounds)
- Progress bar shows point value with green→orange→red color transition
- Results screen shows **only the final score** (no completion time)
- Seed input is forced to **lowercase**
- Competition scores are **excluded from Play/Improve aggregates**

## Implementation Order

### Step 1: Scoring Function
Add `calculateCompetitiveScore()` to `frontend/src/constants/scoring.ts`.  
Write tests first: verify formula at boundary times (0ms, half, near-expiry, expired, over-expired).

### Step 2: Game Engine Integration
In `frontend/src/services/gameEngine.ts` → `handleSubmitAnswer()`, branch on `state.gameMode === 'competitive'` to call the new scoring function.  
Test: competitive game produces correct per-round scores.

### Step 3: Aggregate Exclusion
In `frontend/src/services/playerStorage.ts`, change 4 filter conditions from `!== 'improve'` to `=== 'play'`.  
Test: competitive game records don't affect totalScore/gamesPlayed/averages/high scores.

### Step 4: Progress Bar Enhancement
Extend `useRoundTimer` with `competitiveMode` param and `pointLabelRef`.  
Add HSL color interpolation function.  
Update `CountdownBar` with competitive variant (16px height, point label overlay).  
Test: point value decreases correctly; color transitions smoothly.

### Step 5: Timer Display & Status Panel
In `GameStatus`, hide timer text when `gameMode === 'competitive'`.  
Pass competitive props to `CountdownBar`.  
Test: no timer text shown in competitive; timer text shown in play/improve.

### Step 6: Results Screen & Share URL
Remove total time display from `ScoreSummary` for competitive.  
Update `SharedResult` interface (remove `totalTimeMs`).  
Update `encodeShareUrl`/`decodeShareUrl` (remove `time` param).  
Update `SharedResultPage` (remove time display).  
Test: results show only score; share URL encodes score without time.

### Step 7: Seed Lowercase
Add `.toLowerCase()` to seed input handler in `CompetitionSetup`.  
Add `.toLowerCase()` to URL seed extraction in `MainPage`.  
Test: uppercase input becomes lowercase; URL seeds are normalized.

## Key Files

| File | Change |
|------|--------|
| `frontend/src/constants/scoring.ts` | New function + constants |
| `frontend/src/services/gameEngine.ts` | Scoring branch |
| `frontend/src/services/playerStorage.ts` | Filter change (4 locations) |
| `frontend/src/hooks/useRoundTimer.ts` | Competitive mode support |
| `frontend/src/components/GamePlay/CountdownBar/CountdownBar.tsx` | Competitive variant |
| `frontend/src/components/GamePlay/CountdownBar/CountdownBar.module.css` | Thicker track + label |
| `frontend/src/components/GamePlay/GameStatus/GameStatus.tsx` | Hide timer text |
| `frontend/src/components/GamePlay/ScoreSummary/ScoreSummary.tsx` | Remove time display |
| `frontend/src/components/GamePlay/CompetitionSetup/CompetitionSetup.tsx` | Lowercase seed |
| `frontend/src/services/shareUrl.ts` | Remove time from URL |
| `frontend/src/pages/SharedResultPage.tsx` | Remove time display |
| `frontend/src/pages/MainPage.tsx` | Lowercase URL seed |

## Testing Strategy

1. **Unit tests** for `calculateCompetitiveScore()` — pure function, easy to test exhaustively
2. **Unit tests** for aggregate exclusion — verify competitive records are filtered out
3. **Component tests** for CountdownBar competitive variant — thickness, point label rendering
4. **Component tests** for GameStatus — timer hidden in competitive, shown in play
5. **Component tests** for ScoreSummary — no time shown for competitive results
6. **Component tests** for CompetitionSetup — lowercase enforcement on type and paste
7. **Integration test** for share URL encode/decode without time parameter
8. **Accessibility tests (axe-core)** for CountdownBar competitive variant

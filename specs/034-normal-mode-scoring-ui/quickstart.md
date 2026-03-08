# Quickstart: Normal Mode Scoring Alignment & UI Updates

**Feature**: 034-normal-mode-scoring-ui
**Date**: 2026-03-08

## What changed

1. **Scoring unification**: Normal Mode (Play & Improve) now uses the same linear point-decay scoring as Competition Mode — 10 points at round start, decaying to 1 at timer expiry. Correct answers earn the current value; incorrect answers lose it.

2. **10-point bug fix**: The off-by-one error where the score jumped from 10 to 9 on the first frame is fixed. Each point value (10 through 1) gets exactly 1/10th of the timer duration.

3. **Progress bar update**: The bar is thicker in all modes (16px track). The text inside shows the current value with a localized label: "7 points", "1 point" (or equivalent in the active language).

4. **Home screen label**: A subtitle "excluding competition games" appears below "Recent High Scores" on the home screen, clarifying that competition results are not included.

## Files modified

| File | Change |
|------|--------|
| `frontend/src/constants/scoring.ts` | Fixed decay formula in `calculateCompetitiveScore()` |
| `frontend/src/hooks/useRoundTimer.ts` | Removed `competitiveMode` flag; all modes use point-decay display and HSL colors |
| `frontend/src/services/gameEngine.ts` | All modes now call `calculateCompetitiveScore()` |
| `frontend/src/components/GamePlay/CountdownBar/CountdownBar.tsx` | Removed `competitive` prop; always renders 16px bar with localized point label |
| `frontend/src/components/GamePlay/CountdownBar/CountdownBar.module.css` | Unified track height to 16px; increased label font size |
| `frontend/src/components/GamePlay/RecentHighScores/RecentHighScores.tsx` | Added "excluding competition games" subtitle |
| `frontend/src/components/GamePlay/RecentHighScores/RecentHighScores.module.css` | Added subtitle styling |
| `frontend/src/i18n/locales/{en,fr,es,de,pt,ja}.ts` | Added `game.pointSingular`, `game.pointPlural`, `scores.excludingCompetition` |

## Score range change

| Metric | Before | After |
|--------|--------|-------|
| Points per correct answer | 0–5 (thresholds) | 1–10 (linear decay) |
| Incorrect penalty | -2 (flat) | -1 to -10 (linear decay) |
| Game score range | -20 to +50 | -100 to +100 |
| Timer expired penalty | 0 points | -1 point |

## How to verify

1. **Start a Normal Mode game** → progress bar shows "10 points" at round start
2. **Wait ~2 seconds** → value changes to "9 points" (not instantly)
3. **Answer correctly at 7 points** → score increases by 7
4. **Answer incorrectly at 5 points** → score decreases by 5
5. **Switch language** → bar label translates (e.g., "7 pontos" in Portuguese)
6. **Go to home screen** → "excluding competition games" visible below scores heading
7. **Start a Competition Mode game** → identical bar appearance and scoring behavior

## Backward compatibility

- Historical scores are preserved unchanged in localStorage
- The old threshold-based scoring function `calculateScore()` remains in the codebase but is no longer called by the game engine
- No migration of stored data is needed

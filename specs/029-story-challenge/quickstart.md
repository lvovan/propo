# Quickstart: Story Challenge Expansion

**Feature**: 029-story-challenge  
**Date**: 2026-03-07

## What Changed

The game now presents **5 Pure Numeric** questions (percentage, ratio, fraction) and **5 Story Challenges** (multi-item ratio, percentage-of-whole, complex extrapolation) per game. The old `ruleOfThree` type is absorbed into `complexExtrapolation`. Scoring uses percentage-of-time-remaining tiers, normalized across a 20s timer (numeric) and 50s timer (stories). Dark mode gets high-contrast story text.

## Key Files

| File | Change |
|------|--------|
| `frontend/src/types/game.ts` | `QuestionType` expanded to 6 values; `ruleOfThree` removed; `timerDurationMs` added to `Formula`; `ScoringTier` removed |
| `frontend/src/constants/scoring.ts` | `SCORING_TIERS` → `SCORING_THRESHOLDS` (percentage-based); `COUNTDOWN_DURATION_MS` → `NUMERIC_TIMER_MS` + `STORY_TIMER_MS`; `calculateScore()` takes `timerDurationMs` |
| `frontend/src/services/formulaGenerator.ts` | New story pools; 5/5 split distribution; `ruleOfThree` pool → `complexExtrapolation` |
| `frontend/src/services/gameEngine.ts` | Passes `formula.timerDurationMs` to `calculateScore()` |
| `frontend/src/services/challengeAnalyzer.ts` | Maps legacy `ruleOfThree` → `complexExtrapolation`; groups 6 categories |
| `frontend/src/hooks/useRoundTimer.ts` | Accepts `durationMs` parameter; dynamic reset |
| `frontend/src/components/GamePlay/FormulaDisplay/` | New story type renderers; dark mode CSS |
| `frontend/src/components/GamePlay/ScoreSummary/` | Problem type column in table |
| `frontend/src/i18n/locales/*.ts` | 18+ new story template keys; 3 new sub-type labels |

## How to Verify

1. `cd frontend && npm run build` — should compile cleanly
2. `npx vitest run` — all tests pass
3. `npm run dev` → open browser → start a game:
   - Confirm 5 Pure Numeric + 5 Story Challenge rounds
   - Confirm timer shows 20s for numeric, 50s for story
   - Answer at ~50% remaining on both types → both get +3 points
4. Enable system dark mode → Story Challenge text is readable with high contrast
5. Check score summary → each round shows problem type indicator

# Quickstart: Competitive Mode

**Feature**: 030-competitive-mode  
**Date**: 2026-03-07  
**Prerequisites**: Read [spec.md](spec.md), [plan.md](plan.md), [research.md](research.md), [data-model.md](data-model.md)

## Implementation Order

Follow this order to maintain a green test suite throughout development:

### Layer 1: Core Services (no UI dependencies)

1. **`seededRandom.ts`** — Mulberry32 PRNG + string hash
   - Create `frontend/src/services/seededRandom.ts`
   - Implement `hashSeed(seed: string): number` — multiplicative hash (e.g., cyrb53 or DJB2)
   - Implement `createSeededRandom(intSeed: number): () => number` — Mulberry32, returns `[0, 1)`
   - Implement `createSeededRandomFromString(seed: string): () => number` — convenience wrapper
   - Test: `frontend/tests/services/seededRandom.test.ts`
     - Same string seed → same sequence of numbers
     - Different seeds → different sequences
     - Output in `[0, 1)` range
     - Cross-call determinism (call N produces same value for same seed)

2. **`hashUrlParams.ts`** — Hash URL parameter utility
   - Create `frontend/src/services/hashUrlParams.ts`
   - Implement `getHashSearchParams(): URLSearchParams`
   - Implement `getHashParam(key: string): string | null`
   - Test: `frontend/tests/services/hashUrlParams.test.ts`
     - Parse `#/play?seed=abc123` → `seed` = `"abc123"`
     - Handle missing params → `null`
     - Handle URL-encoded values → decoded correctly

3. **`totalTime.ts`** — Total time calculation + formatting
   - Create `frontend/src/services/totalTime.ts`
   - Implement `calculateTotalTime(rounds: Round[]): number`
     - Sum `elapsedMs` for all rounds + `WRONG_ANSWER_PENALTY_MS` per incorrect
   - Implement `formatTotalTime(ms: number): string`
     - `29600` → `"29.6s"`, `89600` → `"1m 29.6s"`, `120000` → `"2m 00.0s"`
   - Add `WRONG_ANSWER_PENALTY_MS = 60_000` to `frontend/src/constants/scoring.ts`
   - Test: `frontend/tests/services/totalTime.test.ts`

4. **`shareUrl.ts`** — Share URL encoding/decoding
   - Create `frontend/src/services/shareUrl.ts`
   - Implement `encodeShareUrl(result: SharedResult): string`
   - Implement `decodeShareUrl(hash: string): SharedResult | null`
   - Test: `frontend/tests/services/shareUrl.test.ts`
     - Round trip: encode → decode → same data
     - Missing params → `null`
     - Special characters in seed/name → properly encoded/decoded

### Layer 2: Type System & Game Engine

5. **Extend `GameMode`** type
   - Modify `frontend/src/types/player.ts`: `'play' | 'improve'` → `'play' | 'improve' | 'competitive'`

6. **Extend `GameState`** with `seed` field
   - Modify `frontend/src/types/game.ts`: add `seed?: string` to `GameState`

7. **Extend `GameAction`** to accept competitive mode and seed
   - Modify `frontend/src/services/gameEngine.ts`:
     - `START_GAME` action: `mode?: GameMode; seed?: string`
     - `START_GAME` handler: store seed in state
     - `handleNextRoundPlaying()`: if `gameMode === 'competitive'`, skip replay — go directly to `'completed'`

8. **Extend `useGame` hook**
   - Modify `frontend/src/hooks/useGame.ts`:
     - Add `startCompetitiveGame(seed: string)` function
     - Creates seeded PRNG via `createSeededRandomFromString(seed)`
     - Passes to `generateFormulas(seededRandom)`
     - Dispatches `START_GAME` with `mode: 'competitive'` and `seed`
     - Expose `seed` from gameState

9. **Extend `playerStorage.ts`** aggregate functions
   - Ensure `'competitive'` mode games are included alongside `'play'` in:
     - `updatePlayerScore()`
     - `getRecentHighScores()`
     - `getGameHistory()`
   - In practice: competitive games should NOT be excluded (only `'improve'` is excluded). Verify the filtering logic uses explicit `=== 'improve'` exclusion rather than `=== 'play'` inclusion.

### Layer 3: Seed Persistence (URL flow)

10. **Extend `sessionManager.ts`** with seed persistence
    - Add `setPendingSeed(seed: string): void` — writes to `sessionStorage` key `propo_pending_seed`
    - Add `consumePendingSeed(): string | null` — reads and deletes from `sessionStorage`

11. **Modify `WelcomePage.tsx`** for seed-aware redirect
    - On mount: check for `seed` in hash URL params via `getHashParam('seed')`
    - If seed found: call `setPendingSeed(seed)` before proceeding to profile selection
    - After profile selection: navigate to `/play` (seed will be consumed by MainPage)

12. **Modify `MainPage.tsx`** for seed consumption
    - On mount: check `getHashParam('seed')` first (direct URL access)
    - If no URL seed: check `consumePendingSeed()` (redirect from WelcomePage)
    - If seed found from either source: auto-select Competition mode, pre-fill seed

### Layer 4: UI Components

13. **Create `CompetitionSetup` component**
    - Create `frontend/src/components/GamePlay/CompetitionSetup/CompetitionSetup.tsx`
    - Create `frontend/src/components/GamePlay/CompetitionSetup/CompetitionSetup.module.css`
    - Props: `initialSeed?: string`, `onStart: (seed: string) => void`, `onBack: () => void`
    - Seed input (text, max 100 chars), "Generate seed" button, "Start game" button
    - Validation: Start disabled when seed is empty/whitespace
    - Generate: 6 random alphanumeric chars via `Math.random` (not seeded — this is UI randomness)
    - Test: `frontend/tests/components/CompetitionSetup.test.tsx`
    - a11y test: `frontend/tests/a11y/CompetitionSetup.a11y.test.tsx`

14. **Modify `ModeSelector`** to add Competition button
    - Add `onStartCompetition` prop
    - Add third button with `t('mode.competition')` label
    - Style consistently with existing Play/Improve buttons

15. **Modify `ScoreSummary`** for Competition results
    - Add `seed?: string` prop
    - When `gameMode === 'competitive'`:
      - Show total time (via `calculateTotalTime` + `formatTotalTime`)
      - Show seed value
      - Show "Share" button → calls `encodeShareUrl()` + copies to clipboard
      - Show "Play Again" (resets with same seed) and "Back to Menu"
    - Test: extend `frontend/tests/components/ScoreSummary.test.ts`

16. **Integrate Competition flow in `MainPage.tsx`**
    - When `status === 'not-started'` + Competition selected → show `CompetitionSetup`
    - `CompetitionSetup.onStart(seed)` → call `startCompetitiveGame(seed)`
    - Pass `seed` from `gameState` to `ScoreSummary`

### Layer 5: Shared Result Page

17. **Create `SharedResultPage`**
    - Create `frontend/src/pages/SharedResultPage.tsx`
    - Parse URL params via `decodeShareUrl(window.location.hash)`
    - Display card: player name, score, total time (formatted), seed
    - "Play this game" button → navigate to `/#/play?seed={seed}`
    - Error state for missing/invalid params
    - Test: `frontend/tests/pages/SharedResultPage.test.tsx`
    - a11y test: `frontend/tests/a11y/SharedResultPage.a11y.test.tsx`

18. **Add `/result` route to `App.tsx`**
    - Import `SharedResultPage`
    - Add `<Route path="/result" element={<SharedResultPage />} />`
    - Add `'/result': 'result'` to Clarity PAGE_NAMES

### Layer 6: i18n & Polish

19. **Add i18n strings** for all 6 languages
    - Keys to add to each locale file:
      - `mode.competition` — "Competition" button label
      - `mode.competitionDesc` — "Challenge a friend!" descriptor
      - `competition.seedInputLabel` — "Game seed"
      - `competition.seedPlaceholder` — "Enter a seed or generate one"
      - `competition.generateSeed` — "Generate seed"
      - `competition.startGame` — "Start game"
      - `competition.totalTime` — "Total time"
      - `competition.seed` — "Seed"
      - `competition.share` — "Share result"
      - `competition.shareCopied` — "Link copied!"
      - `sharedResult.title` — "Competition Result"
      - `sharedResult.playThisGame` — "Play this game"
      - `sharedResult.score` — "Score"
      - `sharedResult.time` — "Time"
      - `sharedResult.player` — "Player"
      - `sharedResult.error` — "Invalid result link"

20. **Integration test**
    - Create `frontend/tests/integration/competitiveMode.test.tsx`
    - Test full flow: select Competition → enter seed → play 10 rounds → see results with time + seed
    - Test URL seed flow: open with seed → profile selection → game starts with seed
    - Test determinism: same seed produces same questions
    - Test share: complete game → Share button → link decodes correctly

## Key Decision Points

| Decision | Choice | Reason |
|----------|--------|--------|
| PRNG algorithm | Mulberry32 | Small, well-tested, sufficient for 10-question generation |
| URL param parsing | Manual hash parsing | `useSearchParams` doesn't work with HashRouter |
| Seed persistence | Separate sessionStorage key | Isolates from Session lifecycle, simpler cleanup |
| Replay in competitive | Disabled (skip to completed) | Per spec FR-015: game ends after 10 rounds |
| Aggregates | Included with play | Per spec FR-014: competitive counts like play mode |
| Share URL format | Hash params on `/result` | Consistent with HashRouter, no server needed |
| Generate seed | `Math.random` (not seeded) | UI convenience feature, not game-critical randomness |

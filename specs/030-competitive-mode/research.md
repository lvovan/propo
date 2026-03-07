# Research: Competitive Mode

**Feature**: 030-competitive-mode  
**Date**: 2026-03-07

## Research Task 1: Seeded PRNG for Deterministic Question Generation

### Decision: Use Mulberry32 PRNG with string-to-seed hashing

### Rationale

The existing `generateFormulas(randomFn: () => number)` already accepts an injectable random function — all internal randomness (fisher-yates shuffle, pickRandom) flows through this parameter with **zero direct `Math.random` calls** in the function body. This means we only need to:

1. Convert a string seed into a 32-bit integer (hash function)
2. Create a deterministic PRNG from that integer
3. Pass the PRNG as `randomFn` to `generateFormulas()`

**Mulberry32** is chosen because:
- It produces high-quality randomness (passes PractRand, SmallCrush)
- Extremely small (~6 lines of code, no dependencies)
- 32-bit state is sufficient for 10-question generation (~30 random calls)
- Already used in production by many browser-based games
- No npm dependency required — implemented inline

**String-to-integer hashing** will use a simple multiplicative hash (e.g., cyrb53 or a DJB2 variant) to convert arbitrary seed strings to 32-bit integers. Using the same hash function ensures cross-device determinism since it runs identically in all JS engines.

### Alternatives Considered

| Alternative | Why Rejected |
|---|---|
| `seedrandom` npm package | Adds external dependency; overkill for our use case; constitution prefers minimal dependencies |
| LCG (existing test utility) | Poor distribution quality; the test's LCG is a minimal Park-Miller variant, not suitable for production game fairness |
| `crypto.getRandomValues` | Not seedable — produces true random values, cannot be replicated from a seed |
| Web Crypto API with HMAC | Overly complex for picking from question pools; async API adds unnecessary complexity |

### Verification

The existing test already proves the pattern works:
```typescript
// In formulaGenerator.test.ts
const f1 = generateFormulas(createSeededRandom(42));
const f2 = generateFormulas(createSeededRandom(42));
expect(f1).toEqual(f2); // ✅ passes
```

The production implementation will use the same pattern with a higher-quality PRNG.

---

## Research Task 2: URL Parameter Handling with HashRouter

### Decision: Parse query parameters manually from `window.location.hash`

### Rationale

React Router DOM v7's `useSearchParams()` hook does **not work** with `HashRouter`. In a hash-based URL like `/#/play?seed=abc123`, the entire `#/play?seed=abc123` is the hash fragment — the browser does not parse `?seed=abc123` as a query string.

The solution is to manually extract query parameters from the hash:

```typescript
// Example: window.location.hash = "#/play?seed=abc123"
const hash = window.location.hash; // "#/play?seed=abc123"
const queryIndex = hash.indexOf('?');
const searchParams = queryIndex >= 0
  ? new URLSearchParams(hash.slice(queryIndex))
  : new URLSearchParams();
const seed = searchParams.get('seed'); // "abc123"
```

This approach:
- Uses the native `URLSearchParams` API (no dependencies)
- Works with the existing HashRouter without requiring a migration to BrowserRouter
- Handles URL encoding automatically (special characters in seeds)
- Is a pure function, easily testable

The seed extracted from the URL will be stored in `sessionStorage` (alongside the existing session data) so it persists across the profile-selection redirect (WelcomePage → MainPage). After use, the seed is consumed and removed from sessionStorage.

### Alternatives Considered

| Alternative | Why Rejected |
|---|---|
| Switch to BrowserRouter | Would break all existing bookmarks/links, require server-side routing config for static hosting, and is a scope-creeping change |
| `useLocation().search` | Returns empty string with HashRouter — the "search" is inside the hash fragment |
| React Router state (`navigate('/play', { state: { seed } })`) | Works for manual navigation but does NOT work when a user opens a URL directly (state is null on fresh page load) |
| Encode seed in path (e.g., `/#/play/abc123`) | Requires route changes, doesn't cleanly separate concerns, seed string may contain URL-unfriendly characters |

### URL Formats

- **Seeded game URL**: `/#/play?seed=abc123` — pre-fills Competition mode with seed
- **Shared result URL**: `/#/result?seed=abc123&player=Alice&score=45&time=29600` — displays result page with "Play this game" button
- Both use URL encoding for special characters via `URLSearchParams`

---

## Research Task 3: Competitive Mode Game Engine Changes

### Decision: Add `'competitive'` to GameMode union; skip replay in game reducer

### Rationale

The game reducer in `gameEngine.ts` has a clear branch point where replay rounds are initiated (`handleNextRoundPlaying`). After the 10th primary round, it checks for failed indices and either enters `'replay'` status or `'completed'`. For competitive mode, we add a single conditional:

```
if gameMode === 'competitive' → always go to 'completed' after round 10
```

This is minimal, non-breaking, and keeps all existing play/improve paths unchanged.

**GameMode type extension**: `'play' | 'improve'` → `'play' | 'improve' | 'competitive'`

**GameAction extension**: The `START_GAME` action's `mode` field accepts the new value.

**Aggregate treatment**: Competition games are treated like Play mode for scoring aggregates (FR-014). The `saveGameRecord` and filter functions in `playerStorage.ts` already separate by mode — Competition games will be included wherever Play games are included.

### Alternatives Considered

| Alternative | Why Rejected |
|---|---|
| Separate game reducer for competitive | Unnecessary duplication; 95% of logic is identical to play mode |
| Runtime flag instead of GameMode value | Less type-safe; GameMode enum already exists for this purpose |
| Post-process replay queue (empty it before use) | Fragile; better to skip at the decision point |

---

## Research Task 4: Share URL Encoding

### Decision: Encode result data in URL hash parameters

### Rationale

Since the app uses HashRouter, the share URL encodes all result data as query parameters within the hash fragment: `/#/result?seed=abc123&player=Alice&score=45&time=29600`

Data encoded:
- `seed`: The game seed string
- `player`: The sharer's player name
- `score`: Integer score (0–50)
- `time`: Total time in milliseconds (integer)

This keeps everything client-side (no server), is easily shareable via copy-paste, and the `URLSearchParams` API handles encoding/decoding of special characters.

A new route (`/result`) and page component (`SharedResultPage`) will decode these parameters and render a card showing the sharer's name, score, and formatted time, plus a "Play this game" button that navigates to `/#/play?seed=abc123`.

### Security Note

Per spec edge case: "Since results are encoded in the URL client-side, there is no server-side verification. The share page displays whatever data is in the URL. Integrity is based on trust between players." Player names are limited to 10 characters (existing validation), and scores are bounded 0–50 in the display. The share page is read-only — it does not write to localStorage.

### Alternatives Considered

| Alternative | Why Rejected |
|---|---|
| Base64-encode a JSON payload in the URL | Obscures data unnecessarily; makes URLs longer and harder to debug; no security benefit since client can decode anyway |
| Use a URL shortener / server storage | Requires server infrastructure, violates Static SPA constitution principle |
| Clipboard-only (no shareable URL) | Reduces accessibility; users can't share via messaging apps with a clickable link |

---

## Research Task 5: Total Time Calculation with Penalties

### Decision: Sum `elapsedMs` across 10 primary rounds + 60,000ms per incorrect answer

### Rationale

The `Round` interface already captures `elapsedMs` and `isCorrect` per round. The total time calculation is:

```
totalTime = sum(round.elapsedMs for all 10 primary rounds)
           + (count of rounds where isCorrect === false) × 60_000
```

This is computed at display time from the existing round data — no new data model fields needed for storage. The penalty constant (60,000ms = 1 minute) will be defined in `scoring.ts` alongside existing constants.

Display formatting: `formatTotalTime(ms)` → "29.6s" for < 60s, "1m 29.6s" for >= 60s, "2m 00.0s" for exact minutes.

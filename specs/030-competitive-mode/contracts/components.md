# Component Contracts: Competitive Mode

**Feature**: 030-competitive-mode  
**Date**: 2026-03-07

## New Components

### 1. CompetitionSetup

**File**: `frontend/src/components/GamePlay/CompetitionSetup/CompetitionSetup.tsx`

```typescript
interface CompetitionSetupProps {
  /** Pre-filled seed from URL parameter (if any) */
  initialSeed?: string;
  /** Called when player presses "Start game" with a valid seed */
  onStart: (seed: string) => void;
  /** Called when player wants to go back to mode selection */
  onBack: () => void;
}
```

**Behavior**:
- Renders a text input for seed entry (max 100 chars, trimmed on submit)
- Renders a "Generate seed" button that fills the input with a random 6-char alphanumeric string
- Renders a "Start game" button (disabled when seed is empty/whitespace-only)
- If `initialSeed` is provided, pre-fills the input and focuses the "Start game" button
- Displays the current seed value prominently (FR-010)
- All elements meet WCAG 2.1 AA: labeled input, keyboard-accessible buttons, minimum 44×44px touch targets

**Accessibility**:
- Input: `<input type="text" aria-label={t('competition.seedInputLabel')} maxLength={100} />`
- Generate button: `<button aria-label={t('competition.generateSeed')}>`
- Start button: `<button aria-label={t('competition.startGame')} disabled={!isValidSeed}>`

---

### 2. SharedResultPage

**File**: `frontend/src/pages/SharedResultPage.tsx`

```typescript
// No props — reads data from URL hash parameters
// Route: /#/result?seed=...&player=...&score=...&time=...
```

**Behavior**:
- Parses URL hash parameters to extract `SharedResult` data
- Displays a card with:
  - Player name (sanitized for display — text content only, no HTML)
  - Score (clamped 0–50 for display)
  - Total time (formatted as "Xs" or "Xm Ys")
  - Game seed
- Renders a "Play this game" button that navigates to `/#/play?seed={seed}`
- If required parameters are missing, shows an error message
- Read-only page — does not write to localStorage or sessionStorage

**Accessibility**:
- Heading: `<h1>{t('sharedResult.title')}</h1>`
- Results in a landmark: `<main role="main">`
- "Play this game" button: `<button aria-label={t('sharedResult.playThisGame')}>`

---

## Modified Components

### 3. ModeSelector (modified)

**File**: `frontend/src/components/GamePlay/ModeSelector/ModeSelector.tsx`

```typescript
// Updated props interface
interface ModeSelectorProps {
  onStartPlay: () => void;
  onStartImprove: () => void;
  onStartCompetition: () => void;  // NEW
  trickyCategories: QuestionType[];
  showImprove: boolean;
  showEncouragement: boolean;
}
```

**Changes**:
- Add a third button for "Competition" mode
- Button text: `t('mode.competition')` with descriptor `t('mode.competitionDesc')`
- Clicking calls `onStartCompetition()` which transitions to `CompetitionSetup` view

---

### 4. ScoreSummary (modified)

**File**: `frontend/src/components/GamePlay/ScoreSummary/ScoreSummary.tsx`

```typescript
// Updated props interface
export interface ScoreSummaryProps {
  rounds: Round[];
  score: number;
  onPlayAgain: () => void;
  onBackToMenu: () => void;
  gameMode?: GameMode;
  history?: GameRecord[];
  seed?: string;  // NEW — displayed for competitive mode
}
```

**Changes (when `gameMode === 'competitive'`)**:
- Display total time: sum of `round.elapsedMs` across primary rounds + 60s penalty per incorrect
- Display seed value
- Display "Share" button that generates share URL and copies to clipboard
- Hide sparkline/progression graph (not meaningful for one-off competition)
- Keep round-by-round table (same as play mode)

---

## Service Contracts

### 5. seededRandom

**File**: `frontend/src/services/seededRandom.ts`

```typescript
/**
 * Hash a string into a 32-bit integer for use as PRNG seed.
 */
export function hashSeed(seed: string): number;

/**
 * Create a deterministic PRNG function from a 32-bit integer seed.
 * Returns a function that produces values in [0, 1) on each call.
 * Uses Mulberry32 algorithm.
 */
export function createSeededRandom(seed: number): () => number;

/**
 * Convenience: hash a string and return a seeded PRNG function.
 */
export function createSeededRandomFromString(seed: string): () => number;
```

---

### 6. shareUrl

**File**: `frontend/src/services/shareUrl.ts`

```typescript
export interface SharedResult {
  seed: string;
  playerName: string;
  score: number;
  totalTimeMs: number;
}

/**
 * Encode a SharedResult into a shareable URL hash string.
 * Returns the full URL (e.g., "https://host/#/result?seed=abc&player=Alice&score=45&time=29600")
 */
export function encodeShareUrl(result: SharedResult): string;

/**
 * Decode URL hash parameters into a SharedResult.
 * Returns null if required parameters are missing.
 */
export function decodeShareUrl(hash: string): SharedResult | null;
```

---

### 7. seedPersistence

**File**: `frontend/src/services/sessionManager.ts` (extended)

```typescript
const PENDING_SEED_KEY = 'propo_pending_seed';

/**
 * Store a seed temporarily for retrieval after profile selection.
 */
export function setPendingSeed(seed: string): void;

/**
 * Retrieve and consume (delete) the pending seed.
 * Returns null if no pending seed exists.
 */
export function consumePendingSeed(): string | null;
```

---

### 8. hashUrlParams

**File**: `frontend/src/services/hashUrlParams.ts` (new utility)

```typescript
/**
 * Parse query parameters from a HashRouter URL.
 * Extracts the query string from window.location.hash.
 */
export function getHashSearchParams(): URLSearchParams;

/**
 * Get a specific parameter from the hash URL.
 */
export function getHashParam(key: string): string | null;
```

---

### 9. totalTime

**File**: `frontend/src/services/totalTime.ts` (new utility)

```typescript
/**
 * Calculate competition total time from rounds.
 * Sum of elapsedMs for primary rounds + WRONG_ANSWER_PENALTY_MS per incorrect answer.
 */
export function calculateTotalTime(rounds: Round[]): number;

/**
 * Format milliseconds into human-readable time string.
 * < 60s: "29.6s"
 * >= 60s: "1m 29.6s"
 */
export function formatTotalTime(ms: number): string;
```

# Contract: Clarity Telemetry Service Module

**Feature**: 019-clarity-telemetry  
**Date**: 2026-02-17  
**Type**: Internal service contract (TypeScript module)

## Module: `clarityService.ts`

This module is the single point of contact between the application and the Microsoft Clarity SDK. All Clarity API calls are funneled through this module. No other module in the codebase should import `microsoft-clarity` directly.

### Exports

```ts
/**
 * Initialize Clarity tracking.
 * No-op when VITE_CLARITY_PROJECT_ID is absent/empty or in test environment.
 * Must be called once at application startup (main.tsx).
 * Wraps Clarity.init() in try/catch for graceful degradation.
 */
export function initClarity(): void;

/**
 * Track a game start event.
 * Fires: game_started_play | game_started_improve
 * Also sets session tag: game_mode = play | improve
 */
export function trackGameStarted(mode: 'play' | 'improve'): void;

/**
 * Track an answer submission event.
 * Fires: answer_{correct|wrong}_{fast|medium|slow|timeout}
 * @param isCorrect - Whether the answer was correct
 * @param elapsedMs - Time taken in milliseconds
 */
export function trackAnswerSubmitted(isCorrect: boolean, elapsedMs: number): void;

/**
 * Track game completion.
 * Fires: game_completed_play | game_completed_improve
 * Sets tags: final_score, correct_count
 */
export function trackGameCompleted(mode: 'play' | 'improve', score: number, correctCount: number): void;

/**
 * Track replay phase start.
 * Fires: replay_started
 * Sets tag: replay_count
 */
export function trackReplayStarted(incorrectCount: number): void;

/**
 * Track replay phase completion.
 * Fires: replay_completed
 */
export function trackReplayCompleted(): void;

/**
 * Set the current language session tag.
 * Called on app init and when user switches language.
 */
export function setLanguageTag(language: string): void;

/**
 * Set the player type session tag.
 * Called when a player selects a profile (returning) or creates one (new).
 */
export function setPlayerTypeTag(type: 'new' | 'returning'): void;
```

### Internal Functions (not exported)

```ts
/**
 * Determine response time tier from elapsed milliseconds.
 * Maps to scoring tiers: fast (≤2s), medium (≤3s), slow (≤4s), timeout (>4s)
 */
function getTimeTier(elapsedMs: number): 'fast' | 'medium' | 'slow' | 'timeout';

/**
 * Safe wrapper — fire a Clarity event only if initialized.
 */
function safeEvent(name: string): void;

/**
 * Safe wrapper — set a Clarity tag only if initialized.
 */
function safeSet(key: string, value: string): void;
```

### Module State

```ts
let isInitialized: boolean = false;
```

### Behavior Contract

| Condition | Behavior |
|---|---|
| `VITE_CLARITY_PROJECT_ID` is empty/undefined | `initClarity()` is a no-op, logs warning to console. All other functions are no-ops. |
| `VITE_CLARITY_PROJECT_ID` is set | `initClarity()` calls `Clarity.init(projectId)`. `isInitialized` becomes `true`. |
| `Clarity.init()` throws | Exception is caught, warning logged. `isInitialized` remains `false`. All functions remain no-ops. |
| Any function called before `initClarity()` | No-op (safe wrappers check `isInitialized`). |
| Any function called after successful init | Delegates to `Clarity.event()` / `Clarity.set()`. |
| Clarity CDN is blocked (ad blocker) | `Clarity.event()` / `Clarity.set()` are no-ops by design of the npm package. No errors thrown. |

### Integration Points

| Consumer | Function Called | Trigger |
|---|---|---|
| `main.tsx` | `initClarity()` | App startup, before `createRoot()` |
| `LanguageContext.tsx` | `setLanguageTag(lang)` | Language init + `setLanguage()` callback |
| `useSession.tsx` or `WelcomePage.tsx` | `setPlayerTypeTag('new' \| 'returning')` | Profile creation or selection |
| Game flow (MainPage / useGame consumer) | `trackGameStarted(mode)` | Game starts |
| Game flow (MainPage / useGame consumer) | `trackAnswerSubmitted(isCorrect, elapsedMs)` | Answer evaluated |
| Game flow (MainPage / useGame consumer) | `trackGameCompleted(mode, score, correctCount)` | Game status → completed |
| Game flow (MainPage / useGame consumer) | `trackReplayStarted(count)` | Game status → replay |
| Game flow (MainPage / useGame consumer) | `trackReplayCompleted()` | Replay phase ends |

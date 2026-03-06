# Research: Microsoft Clarity Telemetry

**Feature**: 019-clarity-telemetry  
**Date**: 2026-02-17

## 1. Microsoft Clarity NPM Package API

**Decision**: Use `microsoft-clarity` npm package (default export `Clarity`)  
**Rationale**: Official Microsoft package, TypeScript declarations included, ~1-2 KB bundle (tracking script loads async from CDN), graceful degradation when blocked  
**Alternatives considered**: Raw Clarity snippet in `index.html` — rejected because npm package provides type safety and cleaner integration in React/Vite builds

### Complete API Surface

```ts
import Clarity from 'microsoft-clarity';

Clarity.init(projectId: string): void;       // Initialize (once at startup)
Clarity.event(name: string): void;           // Fire custom event (name only, no metadata)
Clarity.set(key: string, value: string): void; // Set session tag (can overwrite)
Clarity.identify(userId, sessionId?, pageId?, friendlyName?): void; // NOT USED
Clarity.consent(): void;                     // NOT USED (cookie-less mode)
Clarity.upgrade(reason: string): void;       // NOT USED
```

## 2. Cookie-less Mode Configuration

**Decision**: Configure cookie-less mode in Clarity dashboard (Project Settings → Setup → Advanced), not via runtime API  
**Rationale**: The npm package's `init()` function accepts only a project ID string — there is no `cookies: false` runtime parameter. Cookie-less mode is a project-level dashboard setting.  
**Alternatives considered**: None — this is the only supported mechanism  
**Impact on spec**: FR-009 intent is preserved (no cookies set), but implementation is a dashboard configuration step, not a code change. The quickstart must document this setup step.

## 3. Text Masking Configuration

**Decision**: Configure "Strict" masking mode in Clarity dashboard (Project Settings → Setup → Masking), not via runtime API  
**Rationale**: The npm package does not accept masking parameters at init time. The dashboard provides three levels: Strict (masks all text), Balanced (masks sensitive inputs), Relaxed (no masking). "Strict" satisfies FR-002 (no PII in recordings).  
**Alternatives considered**: Per-element masking via `data-clarity-mask="true"` CSS attributes — rejected because Strict mode is simpler and masks everything by default, which is safer for a children's app  
**Impact on spec**: FR-002 intent is preserved. Implementation is a dashboard configuration step plus code documentation.

## 4. Custom Event Metadata Strategy

**Decision**: Encode metadata into event names using underscore-delimited segments  
**Rationale**: `Clarity.event(name)` accepts only a string — no metadata object parameter. To capture context (game mode, correctness, time tier), metadata must be encoded in the event name itself. Session-level tags set via `Clarity.set()` provide additional context but are not per-event.  
**Alternatives considered**:
1. Set tags immediately before each event — rejected because tags are session-scoped (overwrite previous value), so concurrent tags don't map 1:1 to events
2. Use only session tags without events — rejected because events provide temporal markers for session replay analysis

### Event Name Encoding Scheme

| Spec Event | Encoded Event Names |
|---|---|
| `game_started` (mode) | `game_started_play`, `game_started_improve` |
| `answer_submitted` (correctness, time tier) | `answer_correct_fast`, `answer_correct_medium`, `answer_correct_slow`, `answer_correct_timeout`, `answer_wrong_fast`, `answer_wrong_medium`, `answer_wrong_slow`, `answer_wrong_timeout` |
| `game_completed` (score, correct count, mode) | `game_completed_play`, `game_completed_improve` + set tags `final_score` and `correct_count` immediately before |
| `replay_started` (count) | `replay_started` + set tag `replay_count` immediately before |
| `replay_completed` | `replay_completed` |

**Time tier mapping** (aligned with existing scoring tiers in gameEngine):
- `fast` = ≤2s (5 points tier)
- `medium` = ≤3s (3 points tier)
- `slow` = ≤4s (2 points tier)
- `timeout` = >4s (1 or 0 points tier)

> Note: The spec's 5 tiers (≤2s, ≤3s, ≤4s, ≤5s, >5s) are consolidated to 4 tiers for cleaner event naming. The ≤5s and >5s tiers are merged into `timeout` since both represent sub-optimal performance.

## 5. Session Tags Strategy

**Decision**: Use `Clarity.set()` for session-level context. Tags are strings and can be updated mid-session.  
**Rationale**: Tags appear as filterable dimensions in the Clarity dashboard, enabling segmentation analysis (e.g., "show me all sessions where language=fr").

### Tag Schema

| Tag Key | Possible Values | Set When | Updates? |
|---|---|---|---|
| `language` | `en`, `fr`, `es`, `ja`, `de`, `pt` | App init + language switch | Yes (FR-008) |
| `player_type` | `new`, `returning` | Session start (profile selection/creation) | No |
| `game_mode` | `play`, `improve` | Game start | Yes (per game) |
| `final_score` | `"0"` – `"50"` (string) | Game completion | Yes (per game) |
| `correct_count` | `"0"` – `"10"` (string) | Game completion | Yes (per game) |
| `replay_count` | `"0"` – `"10"` (string) | Replay phase entry | Yes (per game) |

## 6. SPA Route Tracking

**Decision**: No manual page view tracking needed  
**Rationale**: Clarity automatically detects SPA route changes including `hashchange` events (used by the app's `HashRouter`). Each route change creates a new "page" within the session recording.  
**Alternatives considered**: Manual `Clarity.event("pageview_play")` calls — rejected because Clarity handles this natively

## 7. Error Handling & Graceful Degradation

**Decision**: Wrap `Clarity.init()` in try/catch; all other Clarity calls are no-ops when not initialized  
**Rationale**: The npm package degrades gracefully — `event()`, `set()`, etc. become no-ops when the tracking script fails to load (ad blocker, network error). However, wrapping init in try/catch provides defense-in-depth. The telemetry service module will expose safe wrapper functions that check initialization state.  
**Alternatives considered**: Global error boundary — rejected (overkill for a non-critical service)

## 8. Environment Variable & Test Guard

**Decision**: Guard initialization on `import.meta.env.VITE_CLARITY_PROJECT_ID` being truthy  
**Rationale**: In Vite, `import.meta.env.VITE_*` variables are replaced at build time. When absent (local dev, test), the value is `undefined`, and init is skipped. No separate `VITE_CLARITY_ENABLED` flag needed.  
**Alternatives considered**: `VITE_CLARITY_ENABLED` boolean flag — rejected (redundant; absence of project ID is sufficient guard)

## 9. Integration Point Summary

| What | Where | How |
|---|---|---|
| `Clarity.init()` | `frontend/src/main.tsx` | Call before `createRoot()`, guarded by env check |
| Game events | `useGame` consumers or `MainPage.tsx` | Call service functions after state transitions |
| Language tag | `LanguageContext.tsx` | `useEffect` on language change |
| Player type tag | `useSession.tsx` or `WelcomePage.tsx` | On profile selection/creation |
| Game mode + completion tags | `MainPage.tsx` or game flow components | On game start / completion |
| Env config | `frontend/.env.example` | Document `VITE_CLARITY_PROJECT_ID` |

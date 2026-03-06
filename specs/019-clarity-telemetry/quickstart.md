# Quickstart: Microsoft Clarity Telemetry

**Feature**: 019-clarity-telemetry  
**Date**: 2026-02-17

## Prerequisites

1. A Microsoft Clarity account with a project created at [clarity.microsoft.com](https://clarity.microsoft.com)
2. The Clarity project ID (found in Project Settings → Overview)
3. Node.js and npm installed

## Dashboard Configuration (One-time Setup)

Before writing any code, configure these settings in the Clarity dashboard:

1. **Cookie-less mode**: Project Settings → Setup → Advanced → Enable "Cookie-less tracking"
2. **Text masking**: Project Settings → Setup → Masking → Select "Strict" mode (masks all text content)

These settings are project-level and cannot be configured via code.

## Installation

```bash
cd frontend
npm install microsoft-clarity
```

## Environment Configuration

Create or update `frontend/.env.example`:

```env
# Microsoft Clarity project ID (leave empty to disable telemetry)
VITE_CLARITY_PROJECT_ID=
```

For production builds, set the actual project ID in the deployment environment or in a `.env.production` file:

```env
VITE_CLARITY_PROJECT_ID=your-project-id-here
```

> **Note**: The `.env.production` file containing real project IDs should be listed in `.gitignore` or provided via CI/CD environment variables.

## Implementation Order

### Step 1: Create the telemetry service module

Create `frontend/src/services/clarityService.ts` implementing the contract defined in [contracts/clarity-service.md](contracts/clarity-service.md).

Key behaviors:
- Guard `initClarity()` with `import.meta.env.VITE_CLARITY_PROJECT_ID` check
- All public functions are no-ops when not initialized
- Use try/catch around `Clarity.init()`
- Encode event metadata into event name strings (Clarity events don't support payloads)

### Step 2: Initialize at app startup

In `frontend/src/main.tsx`, call `initClarity()` before `createRoot()`:

```ts
import { initClarity } from './services/clarityService';
initClarity();
```

### Step 3: Wire language tag

In `frontend/src/i18n/LanguageContext.tsx`, call `setLanguageTag()`:
- On initial language load
- Inside the `setLanguage` function when language changes

### Step 4: Wire player type tag

In the welcome flow (profile selection/creation), call `setPlayerTypeTag()`:
- `'new'` when a player creates a new profile
- `'returning'` when a player selects an existing profile

### Step 5: Wire game events

In the game flow components, call telemetry functions at state transitions:
- `trackGameStarted(mode)` — when game starts
- `trackAnswerSubmitted(isCorrect, elapsedMs)` — when answer is evaluated
- `trackGameCompleted(mode, score, correctCount)` — when game status becomes `completed`
- `trackReplayStarted(count)` — when game status becomes `replay`
- `trackReplayCompleted()` — when replay phase finishes

### Step 6: Write tests

1. **Unit tests** for `clarityService.ts`:
   - Verify `initClarity()` is a no-op when env var is missing
   - Verify event functions call `Clarity.event()` with correct encoded names
   - Verify tag functions call `Clarity.set()` with correct key/value pairs
   - Verify time tier mapping (elapsedMs → fast/medium/slow/timeout)

2. **Integration test**:
   - Verify app renders without errors when Clarity is unavailable
   - Verify no Clarity calls are made in test environment

## Verification

After deployment with a valid project ID:

1. Open the app in a browser
2. Play through a complete game
3. Check the Clarity dashboard within 5–30 minutes:
   - Session recording should appear (with all text masked)
   - Custom events (`game_started_play`, `answer_correct_fast`, etc.) should appear under Smart Events
   - Custom tags (`language`, `player_type`, `game_mode`) should appear as filterable dimensions

## Troubleshooting

| Issue | Cause | Fix |
|---|---|---|
| No sessions in dashboard | Missing or empty `VITE_CLARITY_PROJECT_ID` | Check env variable is set in production build |
| Text visible in recordings | Masking not set to Strict | Change dashboard setting to Strict mode |
| Cookies being set | Cookie-less mode not enabled | Enable in dashboard Project Settings → Advanced |
| Events not appearing | Events show up with delay | Wait 15–30 minutes; Clarity processes events in batches |
| Console warning about Clarity | Expected in local dev | Normal behavior when project ID is not set |

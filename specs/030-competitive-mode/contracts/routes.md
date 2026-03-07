# Route Contracts: Competitive Mode

**Feature**: 030-competitive-mode  
**Date**: 2026-03-07

## Routes

### Existing Routes (unchanged)

| Path | Component | Description |
|------|-----------|-------------|
| `/` | WelcomePage | Player selection / creation |
| `/play` | MainPage | Game play (all modes) |

### New Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/result` | SharedResultPage | Display shared competition result |

### URL Parameter Contracts

#### Seed Parameter (on `/play`)

```
/#/play?seed={seedString}
```

| Parameter | Type | Required | Validation | Description |
|-----------|------|----------|------------|-------------|
| `seed` | string | No | 1–100 chars after trim, URL-decoded | Pre-fills Competition mode with this seed |

**Behavior**:
- If `seed` is present and session exists → navigate directly to Competition setup with seed pre-filled
- If `seed` is present and no session → store seed in sessionStorage (`propo_pending_seed`), show WelcomePage; after profile selection, redirect to `/play` and consume seed
- If `seed` is absent → normal MainPage behavior (mode selector shows all 3 modes)

#### Shared Result Parameters (on `/result`)

```
/#/result?seed={seed}&player={playerName}&score={score}&time={totalTimeMs}
```

| Parameter | Type | Required | Validation | Description |
|-----------|------|----------|------------|-------------|
| `seed` | string | Yes | 1–100 chars | Game seed for replay |
| `player` | string | Yes | 1–10 chars | Sharer's player name |
| `score` | number | Yes | Integer 0–50 | Sharer's score |
| `time` | number | Yes | Integer ≥ 0 | Total time in ms (including penalties) |

**Behavior**:
- All 4 parameters required; if any missing → display error message
- Score clamped to 0–50 for display
- Player name displayed as text only (no HTML interpretation)
- "Play this game" button navigates to `/#/play?seed={seed}`

## App.tsx Route Configuration

```typescript
<HashRouter>
  <ClarityPageTracker />
  <SessionProvider>
    <Routes>
      <Route path="/" element={<WelcomePage />} />
      <Route path="/play" element={<MainPage />} />
      <Route path="/result" element={<SharedResultPage />} />  {/* NEW */}
    </Routes>
  </SessionProvider>
</HashRouter>
```

## Clarity Page Tracking

```typescript
const PAGE_NAMES: Record<string, string> = {
  '/': 'welcome',
  '/play': 'play',
  '/result': 'result',  // NEW
};
```

# Data Model: Rename Game to Propo

**Feature**: 018-rename-to-propo  
**Date**: 2026-02-17

## Overview

This feature changes **no data structures**. All entities (Player, Session, PlayerStore, GameRecord, RoundResult) retain their exact schemas. The only change is to the **storage key names** used to persist and retrieve these entities in the browser.

## Storage Key Changes

| Domain | Old Key | New Key | Storage Type |
|--------|---------|---------|-------------|
| Player profiles | `turbotiply_players` | `propo_players` | localStorage |
| Language preference | `turbotiply_lang` | `propo_lang` | localStorage |
| Active session | `turbotiply_session` | `propo_session` | sessionStorage |
| Storage availability test | `__turbotiply_test__` | `__propo_test__` | localStorage (transient) |

## Entity Reference (unchanged)

### PlayerStore

Top-level object persisted in localStorage under key `propo_players` (previously `turbotiply_players`).

| Field | Type | Description |
|-------|------|-------------|
| version | number | Schema version for migration support (currently 5) |
| players | Player[] | Array of player profiles, max 50, sorted by lastActive desc |

### Player

| Field | Type | Description |
|-------|------|-------------|
| name | string | Display name (1–20 chars, trimmed) |
| avatarId | string | Predefined avatar identifier |
| lastActive | number | Epoch ms of most recent activity |
| createdAt | number | Epoch ms of profile creation (immutable) |
| totalScore | number | Sum of all completed game scores |
| gamesPlayed | number | Count of completed games |
| gameHistory | GameRecord[] (optional) | Game results, oldest first, max 100 |

### GameRecord

| Field | Type | Description |
|-------|------|-------------|
| score | number | Points earned (0–50 range) |
| completedAt | number | Epoch ms of game completion |
| rounds | RoundResult[] (optional) | Per-round results from primary phase |
| gameMode | GameMode (optional) | 'play' or 'improve' |

### Session

Stored in sessionStorage under key `propo_session` (previously `turbotiply_session`). Tab-scoped.

| Field | Type | Description |
|-------|------|-------------|
| playerName | string | Name of the active player |
| avatarId | string | Avatar copied from Player at session start |
| startedAt | number | Epoch ms of session start |

### Language Preference

Stored in localStorage under key `propo_lang` (previously `turbotiply_lang`). Plain string value — one of: `en`, `fr`, `es`, `ja`, `de`, `pt`.

## Migration Model

### Migration Record (conceptual)

The migration is stateless — it does not track whether it has run. Instead, it uses key-existence checks:

```
For each (oldKey, newKey) pair:
  if newKey exists in storage → skip (already migrated)
  if oldKey exists in storage → copy value to newKey, remove oldKey
  if neither exists → skip (fresh install)
```

### State Transitions

```
State A: Old keys only (pre-update user)
  → Migration runs → State C

State B: New keys only (fresh install OR already migrated)
  → Migration skips → State B (no change)

State C: New keys only (post-migration)
  → Migration skips → State C (idempotent)

State D: Both old and new keys (interrupted migration)
  → New keys take precedence → Old keys removed → State C
```

## Validation Rules

No changes. All existing validation rules in `playerStorage.ts` (name length 1–20, max 50 players, avatar ID validation, score capping, game history limit of 100) remain unchanged.

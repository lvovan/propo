# Data Model: Microsoft Clarity Telemetry

**Feature**: 019-clarity-telemetry  
**Date**: 2026-02-17

## Overview

This feature introduces no persistent data entities. All telemetry data is fire-and-forget to the external Microsoft Clarity service. The "data model" here describes the shape of events and tags sent to Clarity, plus the service module's internal state.

## Entities

### TelemetryEvent (transient)

Represents a named event fired to the Clarity service. Events are encoded as string names (Clarity does not support metadata payloads).

| Attribute | Type | Description |
|---|---|---|
| `name` | `string` | Encoded event name (e.g., `game_started_play`, `answer_correct_fast`) |

**Constraints**:
- Event names use underscore-delimited segments to encode metadata
- No PII may appear in event names
- Events are fire-and-forget — no persistence, no retry

### SessionTag (transient)

Represents a key-value tag applied to the current Clarity session for filtering.

| Attribute | Type | Description |
|---|---|---|
| `key` | `string` | Tag key (e.g., `language`, `player_type`, `game_mode`) |
| `value` | `string` | Tag value (e.g., `en`, `new`, `play`) |

**Constraints**:
- Tags are session-scoped (overwrite previous value on same key)
- Tags can be updated mid-session
- No PII may appear in tag values

### ClarityServiceState (internal)

Internal module state for the telemetry service.

| Attribute | Type | Description |
|---|---|---|
| `initialized` | `boolean` | Whether `Clarity.init()` was called successfully |
| `projectId` | `string \| undefined` | Clarity project ID from env var |

## Event Name Encoding

Events encode metadata into underscore-delimited names since the Clarity `event()` API only accepts a string.

### Game Events

| Event Pattern | Segments | Example Values |
|---|---|---|
| `game_started_{mode}` | mode: `play` \| `improve` | `game_started_play` |
| `answer_{result}_{tier}` | result: `correct` \| `wrong`; tier: `fast` \| `medium` \| `slow` \| `timeout` | `answer_correct_fast` |
| `game_completed_{mode}` | mode: `play` \| `improve` | `game_completed_improve` |
| `replay_started` | (none) | `replay_started` |
| `replay_completed` | (none) | `replay_completed` |

### Time Tier Mapping

| Tier Name | Elapsed Time | Scoring Points |
|---|---|---|
| `fast` | ≤ 2000ms | 5 |
| `medium` | ≤ 3000ms | 3 |
| `slow` | ≤ 4000ms | 2 |
| `timeout` | > 4000ms | 1 or 0 |

### Session Tag Definitions

| Key | Possible Values | Lifecycle |
|---|---|---|
| `language` | `en`, `fr`, `es`, `ja`, `de`, `pt` | Set on init, updated on switch |
| `player_type` | `new`, `returning` | Set once per session start |
| `game_mode` | `play`, `improve` | Set on game start, updated per game |
| `final_score` | `"0"` – `"50"` | Set on game completion |
| `correct_count` | `"0"` – `"10"` | Set on game completion |
| `replay_count` | `"0"` – `"10"` | Set on replay phase entry |

## Relationships

```
ClarityService (singleton module)
  ├── fires → TelemetryEvent (0..n per session)
  └── sets  → SessionTag (0..n per session, keyed, overwritable)
```

No relationships to persistent storage. No database entities. No schema migrations.

## Validation Rules

- Project ID must be a non-empty string to enable initialization
- Event names must match the encoding patterns above (enforced by typed helper functions)
- Tag values must be non-empty strings
- No player names, profile data, or other PII may appear in any event name or tag value

## State Transitions

The telemetry service has no complex state machine. It is either:
1. **Not initialized** (env var missing, test environment, init failed) → all calls are no-ops
2. **Initialized** → calls delegate to `Clarity.*` API functions

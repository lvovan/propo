# Feature Specification: Microsoft Clarity Telemetry

**Feature Branch**: `019-clarity-telemetry`  
**Created**: 2026-02-17  
**Status**: Draft  
**Input**: User description: "Implement telemetry in the application by using the Microsoft Clarity (which has a npm package). Do not use cookie consent (as tracking should be anonymous and just used to determine how the application is used). Suggest custom events and tags as relevant for this app (multiplication tables quiz game)."

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.
  
  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - Anonymous Usage Tracking Initialization (Priority: P1)

As a product owner, I want the application to automatically initialize anonymous usage tracking when any user loads the app, so that I can understand how the application is being used without collecting any personally identifiable information or requiring cookie consent.

**Why this priority**: This is the foundational capability — without basic tracking initialization, no telemetry data is collected at all. Every other story depends on this.

**Independent Test**: Can be fully tested by loading the application and verifying that session recordings and heatmap data appear in the Clarity dashboard within minutes. Delivers immediate insight into how users navigate the app.

**Acceptance Scenarios**:

1. **Given** a user opens the application for the first time, **When** the page finishes loading, **Then** anonymous tracking begins automatically without any user prompt or consent dialog.
2. **Given** a user navigates between pages (Welcome → Play), **When** the page transitions occur, **Then** the tracking session continues seamlessly across navigation.
3. **Given** the tracking service is unavailable (e.g., blocked by browser extension), **When** the application loads, **Then** the app functions normally without errors or degraded user experience.
4. **Given** a user opens the application, **When** tracking initializes, **Then** no personally identifiable information (name, profile data) is transmitted to the telemetry service.

---

### User Story 2 - Game Session Event Tracking (Priority: P2)

As a product owner, I want key game events (game start, answer submission, game completion) to be tracked as custom events, so that I can analyze gameplay patterns, understand which game modes are popular, and identify where players struggle or disengage.

**Why this priority**: Custom game events provide the actionable insights that make telemetry valuable beyond basic page views and heatmaps. This is the primary reason for integrating telemetry.

**Independent Test**: Can be tested by playing a complete game and verifying that custom events (game started, answer submitted, game completed) appear in the Clarity dashboard with correct metadata.

**Acceptance Scenarios**:

1. **Given** a player starts a new game, **When** they select a game mode and begin playing, **Then** a "game_started" event is recorded with the selected game mode (Play or Improve).
2. **Given** a player submits an answer during a round, **When** the answer is evaluated, **Then** an "answer_submitted" event is recorded with correctness (right/wrong) and response time tier (fast/medium/slow/timeout).
3. **Given** a player completes all 10 rounds, **When** the score summary is displayed, **Then** a "game_completed" event is recorded with the final score, number of correct answers, and game mode.
4. **Given** a player abandons a game mid-round (navigates away), **When** the session ends, **Then** the partial game data captured up to that point is still available in the telemetry dashboard.

---

### User Story 3 - Player Context Tagging (Priority: P3)

As a product owner, I want session-level tags to capture contextual information (such as the selected language, device type, and whether the player is new or returning), so that I can segment and filter telemetry data to compare behavior across different user groups.

**Why this priority**: Tags enable segmented analysis, which transforms raw data into targeted insights. However, the base tracking and events must be in place first for tags to be useful.

**Independent Test**: Can be tested by starting a session with a specific language and verifying that session tags appear correctly in the Clarity dashboard filters.

**Acceptance Scenarios**:

1. **Given** a player opens the app with a specific language selected, **When** the session begins, **Then** a "language" tag is set with the current language code (e.g., "en", "fr", "es").
2. **Given** a returning player selects their profile, **When** they enter the main page, **Then** a "player_type" tag is set to "returning".
3. **Given** a new player creates a profile, **When** their profile is saved and they proceed, **Then** a "player_type" tag is set to "new".
4. **Given** a player switches language during a session, **When** the language changes, **Then** the "language" tag is updated to reflect the new language.

---

### User Story 4 - Replay and Difficulty Event Tracking (Priority: P4)

As a product owner, I want to track replay phase entries and improvement mode selections, so that I can understand how often players get answers wrong (triggering replays) and how many players use the improvement mode to work on their weak areas.

**Why this priority**: This provides deeper gameplay insight but is incremental on top of basic game events. Useful for understanding difficulty and engagement, but not essential for initial telemetry value.

**Independent Test**: Can be tested by intentionally answering incorrectly to trigger a replay phase, then verifying a "replay_started" event appears in the dashboard.

**Acceptance Scenarios**:

1. **Given** a player answers one or more rounds incorrectly, **When** the game transitions to the replay phase, **Then** a "replay_started" event is recorded with the count of incorrect answers being replayed.
2. **Given** a player selects "Improve" mode before starting a game, **When** the game begins, **Then** the "game_started" event includes a tag indicating Improve mode was selected.
3. **Given** a player completes the replay phase, **When** all replayed answers are answered correctly, **Then** a "replay_completed" event is recorded.

---

### Edge Cases

- What happens when the tracking script fails to load (e.g., ad blocker, network issue)? The application must function identically — no error messages, no broken layouts, no degraded performance. Telemetry is strictly non-blocking.
- What happens when a player uses the app offline? Tracking silently does nothing; the app works normally. No queued events or retry logic is needed.
- What happens in automated test environments? Tracking must not initialize during unit/integration tests to avoid polluting analytics data and slowing test execution.
- What happens if the Clarity project ID is misconfigured or missing? The app must still load and function normally, with a warning logged to the developer console only.
- What happens with multiple browser tabs open? Each tab operates as an independent tracking session, which is default behavior.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST initialize anonymous usage tracking automatically on application load without displaying any consent dialog or banner.
- **FR-002**: System MUST NOT transmit any personally identifiable information (player names, profile data) to the telemetry service. Only anonymous behavioral data (clicks, scrolls, navigation, custom events) may be collected. Session recordings MUST use Clarity's `mask-text-content` mode to redact all rendered text by default, ensuring names and other typed content are never visible in replays.
- **FR-003**: System MUST track the following custom events with associated metadata:
  - `game_started` — game mode (Play/Improve)
  - `answer_submitted` — correctness (correct/incorrect), response time tier (≤2s / ≤3s / ≤4s / ≤5s / >5s)
  - `game_completed` — final score, correct answer count, game mode
  - `replay_started` — count of incorrect answers entering replay
  - `replay_completed` — (no additional metadata needed)
- **FR-004**: System MUST set session-level tags for:
  - `language` — current UI language code (en, fr, es, ja, de, pt)
  - `player_type` — "new" or "returning"
  - `game_mode` — "play" or "improve" (set when a game starts)
- **FR-005**: System MUST NOT interfere with application functionality if the telemetry service is unavailable, blocked, or misconfigured. All telemetry operations must be non-blocking and fail silently.
- **FR-006**: System MUST NOT initialize tracking during automated test execution (unit tests, integration tests) or in local development environments. Tracking MUST only initialize when the `VITE_CLARITY_PROJECT_ID` environment variable is present and non-empty.
- **FR-007**: System MUST continue tracking seamlessly across client-side page navigations (single-page app route changes).
- **FR-008**: System MUST update the "language" tag dynamically when the user switches language mid-session.
- **FR-009**: System MUST initialize tracking in cookie-less mode (no cookies set) to ensure compliance with children's privacy regulations and to avoid any need for cookie consent.

### Key Entities

- **Telemetry Event**: A named occurrence with optional metadata, representing a discrete user action in the game (e.g., starting a game, submitting an answer, completing a game). Key attributes: event name, timestamp (automatic), metadata key-value pairs.
- **Session Tag**: A key-value label applied to the entire tracking session for filtering and segmentation. Key attributes: tag name, tag value. Tags can be updated during a session.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Within 24 hours of deployment, session recordings and heatmap data are visible in the Clarity dashboard for real user sessions.
- **SC-002**: Custom game events (`game_started`, `game_completed`, `answer_submitted`) appear in the Clarity dashboard with correct metadata for 100% of completed game sessions.
- **SC-003**: Application load time is not degraded by more than 100ms due to telemetry initialization (telemetry loading must be non-blocking).
- **SC-004**: Zero user-facing errors or UI disruptions occur when the telemetry service is blocked or unavailable, verified across major browsers.
- **SC-005**: Session tags (language, player type, game mode) are filterable in the Clarity dashboard, enabling segmented analysis of user behavior.
- **SC-006**: No personally identifiable information appears in any Clarity session recording or event data.

## Clarifications

### Session 2026-02-17

- Q: Should player name elements be masked in Clarity session recordings to satisfy FR-002 (no PII transmission)? → A: Mask all text content by default using Clarity's `mask-text-content` mode.
- Q: How should the Clarity project ID be supplied for a static site deployment? → A: Use Vite build-time env variable (`VITE_CLARITY_PROJECT_ID` in `.env` files).
- Q: Should `answer_submitted` be tracked per individual answer or aggregated into `game_completed`? → A: Track each answer individually (per-round event with correctness + time tier).
- Q: Should Clarity be initialized in cookie-less mode to avoid any cookie-based tracking (children's app)? → A: Yes, enable cookie-less mode (`cookies: false`) — no cookies set at all.
- Q: Should telemetry be disabled in local development environments? → A: Only initialize when `VITE_CLARITY_PROJECT_ID` is present and non-empty — local dev naturally excluded.

## Assumptions

- The Clarity project ID will be provided as a Vite build-time environment variable (`VITE_CLARITY_PROJECT_ID`) via `.env` files, injected at build time. When the variable is absent or empty, telemetry silently does not initialize, which naturally excludes local development.
- Microsoft Clarity MUST be initialized in cookie-less mode (`cookies: false`), which avoids setting any cookies and relies on in-memory session tracking only. Combined with text masking, this eliminates the need for any GDPR/COPPA consent banner.
- The telemetry service is Microsoft Clarity specifically (using the official npm package), not a generic analytics abstraction.
- Response time tiers in events align with the existing scoring tiers (≤2s, ≤3s, ≤4s, ≤5s, >5s) already defined in the game engine.
- The Clarity dashboard (external to this application) is used for viewing analytics — no in-app analytics dashboard is needed.

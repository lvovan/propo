# Feature Specification: Competitive Mode

**Feature Branch**: `030-competitive-mode`  
**Created**: 2026-03-07  
**Status**: Draft  
**Input**: User description: "A new Competitive Mode allowing two players on different devices to play the exact same sequence of questions using a shared seed, with seed-via-URL support and total time as a competitive result metric."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Seed-Based Competition Game (Priority: P1)

Two players want to compete head-to-head by playing the exact same set of questions on their own devices. One player creates a game seed and shares it with the other (verbally, via text, etc.). Both players enter the same seed, and the system generates an identical sequence of questions for each. After completing the game, each player sees their score and total time, allowing them to compare results.

**Why this priority**: This is the core competitive experience — without deterministic question generation from a shared seed, no competitive comparison is possible. Everything else builds on this foundation.

**Independent Test**: Can be fully tested by two users each entering the same seed string, playing through the game independently, and verifying that both received the identical question sequence in the same order with the same values.

**Acceptance Scenarios**:

1. **Given** two players each open a new Competition game and enter the seed "abc123", **When** both start and play through all 10 rounds, **Then** both players see the exact same questions in the exact same order with the same values and hidden positions.
2. **Given** a player selects Competition mode and enters a seed, **When** they press "Start game", **Then** the game begins with 10 questions generated deterministically from that seed.
3. **Given** a player enters the seed "abc123" and plays a game, **When** they later start a new Competition game with the same seed "abc123", **Then** the question sequence is identical to the first game.
4. **Given** a player enters the seed "abc123" and another enters "xyz789", **When** both play their games, **Then** each player sees a different sequence of questions.
5. **Given** a player answers 2 questions incorrectly in a Competition game, **When** the results screen is displayed, **Then** the total time includes a 2-minute penalty (1 minute per wrong answer) added to the cumulative round time.

---

### User Story 2 - Seed via URL (Priority: P2)

A player wants to invite a friend to compete by sharing a link. The player copies a URL that includes the game seed as a parameter. The friend opens the link, selects (or creates) their player profile, and is then taken directly to the Competition game screen pre-loaded with the shared seed. The friend still needs to press "Start game" to begin, so both players can coordinate their start.

**Why this priority**: URL-based seed sharing removes friction from the competitive setup. Players can share a link instead of manually dictating a seed string. However, manual seed entry (P1) must work first since URL sharing depends on the same underlying seed mechanics.

**Independent Test**: Can be tested by opening a URL with a seed parameter, verifying the profile selection screen appears first, then confirming the game loads with the correct seed pre-filled and the player must still press "Start game".

**Acceptance Scenarios**:

1. **Given** a user opens the app with a seed in the URL (e.g., `/#/play?seed=abc123`), **When** the page loads, **Then** the user is first prompted to select or create a player profile.
2. **Given** a user has opened the app via a seeded URL and selects their profile, **When** they arrive at the game screen, **Then** the Competition mode is automatically selected and the seed "abc123" is pre-filled and visible.
3. **Given** a user has arrived at the Competition game screen via a seeded URL, **When** they view the screen, **Then** a "Start game" button is displayed and the game has not yet started.
4. **Given** a user has arrived at the Competition game screen via a seeded URL, **When** they press "Start game", **Then** the game begins with the question sequence determined by the pre-filled seed.
5. **Given** a user opens the app via a seeded URL, **When** they select their profile and reach the game screen, **Then** the seed value from the URL is visible on screen so the player can confirm or share it verbally.

---

### User Story 3 - Total Time and Sharing on Results Screen (Priority: P3)

After completing a Competition game, the player sees their total time and the seed alongside their score on the results screen. A Share button lets the player generate a shareable link. When someone opens that link, they see the sharer's player name, score, and total time — plus a "Play this game" button that loads the same seed so they can compete.

**Why this priority**: The total time metric and sharing are what make the competition meaningful beyond just score — two players may both score 50/50 but compete on speed. The share page makes it easy to challenge friends. It depends on the game being playable (P1) but adds the key competitive dimensions.

**Independent Test**: Can be tested by completing a Competition game, verifying total time and seed are displayed, pressing Share, and confirming the generated link opens a page with the correct player name, score, time, and a working replay button.

**Acceptance Scenarios**:

1. **Given** a player has just completed a Competition game, **When** the results screen is displayed, **Then** the total time (cumulative round time plus any wrong-answer penalties) is shown prominently alongside the score.
2. **Given** a player completes a Competition game with all correct answers and round times of 2.1s, 3.5s, 1.8s, 4.2s, 2.0s, 5.1s, 3.3s, 2.7s, 1.9s, and 3.0s, **When** the results screen appears, **Then** the total time displayed is 29.6 seconds (no penalties).
3. **Given** a player completes a Competition game with the same round times as above but 2 wrong answers, **When** the results screen appears, **Then** the total time displayed is 2m 29.6s (29.6s + 2×60s penalty).
4. **Given** a player completes a standard Play mode game (not Competition), **When** the results screen is displayed, **Then** the total time metric is NOT shown (it only appears for Competition games).
5. **Given** a player has completed a Competition game with seed "abc123", **When** the results screen is displayed, **Then** the seed "abc123" is visible on screen.
6. **Given** a player is on the Competition results screen, **When** they press the "Share" button, **Then** a shareable URL is generated (or copied to clipboard) that encodes the player's profile name, score, total time, and the game seed.
7. **Given** a recipient opens a shared Competition result URL, **When** the page loads, **Then** it displays the sharer's player name, score, and total time.
8. **Given** a recipient is viewing a shared Competition result page, **When** they press the "Play this game" button, **Then** they are taken to the seeded URL flow (profile selection if needed, then Competition game screen with the seed pre-filled).

---

### User Story 4 - Competition Mode Selection (Priority: P1)

A player on the home screen wants to start a competitive game. They see a "Competition" option alongside the existing Play and Improve modes. When they select it, they are prompted to enter a seed string before starting the game.

**Why this priority**: The mode entry point is essential to P1 — players need a way to select Competition and enter a seed.

**Independent Test**: Can be tested by navigating to the home screen, selecting Competition mode, and verifying a seed input field appears.

**Acceptance Scenarios**:

1. **Given** a player is on the home screen with an active session, **When** they view the mode selection area, **Then** a "Competition" option is displayed alongside Play and Improve.
2. **Given** a player selects Competition mode, **When** the Competition setup appears, **Then** a text input field for the seed is displayed along with a "Start game" button.
3. **Given** a player has entered a seed value in the input field, **When** they press "Start game", **Then** the game begins with questions generated from that seed.
4. **Given** a player selects Competition mode but leaves the seed field empty, **When** they attempt to start the game, **Then** the system prevents starting and indicates a seed is required.
5. **Given** a player selects Competition mode, **When** they press a "Generate seed" button, **Then** a random short alphanumeric string is generated and filled into the seed input field.

---

### Edge Cases

- What happens when the seed contains special characters (emoji, spaces, unicode)? The system accepts any non-empty string as a seed and trims leading/trailing whitespace.
- What happens when the seed is extremely long? The system accepts seeds up to 100 characters; any input beyond that is truncated.
- What happens if a player opens a seeded URL but already has an active session? The existing session is used; the player goes directly to the Competition game screen with the seed pre-filled.
- What happens if a Competition game has replay rounds (incorrect answers)? There are no replay rounds in Competition mode. The game ends after the 10 primary rounds regardless of whether answers were correct.
- What happens when a player navigates away mid-game and returns to a seeded URL? A new game instance is started; there is no mid-game resumption.
- How are Competition game scores treated in aggregates? Competition games are included in scoring aggregates alongside Play mode games (they count toward total score, games played, high scores, and progression graph).
- What happens if a shared result URL contains tampered data (e.g., altered score)? Since results are encoded in the URL client-side, there is no server-side verification. The share page displays whatever data is in the URL. Integrity is based on trust between players.
- How are time penalties displayed? The total time shown on the results screen includes penalties baked in (not displayed separately). The breakdown of raw time vs. penalty time is not shown — only the final total.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a "Competition" game mode selectable from the home screen alongside existing Play and Improve modes.
- **FR-002**: Competition mode MUST require the player to enter a seed string before starting the game.
- **FR-003**: System MUST use the seed to deterministically generate an identical sequence of 10 questions — same question types, same values, same hidden positions, and same order — for any player who enters the same seed.
- **FR-004**: The seed input field MUST accept any non-empty string (after trimming whitespace) up to 100 characters.
- **FR-005**: System MUST prevent starting a Competition game if the seed field is empty or contains only whitespace.
- **FR-006**: System MUST support a URL parameter (`seed`) that pre-fills the game seed for Competition mode (e.g., `/#/play?seed=abc123`).
- **FR-007**: When a seeded URL is opened without an active session, the system MUST first prompt the user to select or create a player profile before proceeding to the game screen.
- **FR-008**: When a seeded URL is opened with an active session, the system MUST navigate directly to the Competition game screen with the seed pre-filled.
- **FR-009**: Regardless of how the seed is provided (manual entry or URL), the player MUST press a "Start game" button to begin — the game does not auto-start.
- **FR-010**: The seed value MUST be visible on the Competition game setup screen so players can confirm or share it.
- **FR-011**: The results screen for Competition games MUST display the total time (sum of all round elapsed times plus any wrong-answer penalties) alongside the score.
- **FR-012**: Total time MUST only be displayed on the results screen for Competition games, not for Play or Improve mode games.
- **FR-013**: Competition game results MUST be saved to the player's game history with the game mode recorded.
- **FR-014**: Competition games MUST be included in scoring aggregates (total score, games played, recent high scores, progression graph) alongside Play mode games.
- **FR-015**: Competition mode MUST NOT include replay rounds. The game ends after the 10 primary rounds regardless of correctness.
- **FR-016**: The Competition mode setup screen MUST provide a "Generate seed" button that creates a random short alphanumeric string (e.g., 6 characters) and fills it into the seed input field.
- **FR-017**: When a seeded URL is opened without an active session, the system MUST persist the seed value temporarily (e.g., in session storage) across the profile-selection flow and automatically apply it to the Competition game screen once the player selects or creates a profile.
- **FR-018**: The Competition results screen MUST display the game seed so players can confirm or share it.
- **FR-019**: The Competition results screen MUST provide a "Share" button that generates a shareable URL encoding the player's profile name, score, total time, and the game seed.
- **FR-020**: When a shared Competition result URL is opened, the system MUST display a page showing the sharer's player name, score, and total time.
- **FR-021**: The shared Competition result page MUST include a "Play this game" button that navigates to the seeded URL flow (triggering profile selection if needed, then loading the Competition game screen with the seed pre-filled).
- **FR-022**: The total time displayed on the Competition results screen MUST be calculated as the sum of elapsed time across the 10 primary rounds plus a 1-minute (60-second) penalty for each incorrect answer.
- **FR-023**: In Competition mode, each incorrect answer MUST add a 1-minute (60-second) time penalty to the player's total time. The penalty is cumulative (e.g., 3 wrong answers = 3-minute penalty).

### Key Entities

- **Seed**: A user-provided string (1–100 characters) that deterministically defines the question sequence for a Competition game. Two players entering the same seed on different devices will receive the identical game.
- **Competition Game**: A game instance in Competition mode, identified by its seed. Produces the standard 10 rounds with the same scoring rules as Play mode, plus tracks total cumulative time.
- **Total Time**: The sum of elapsed time (in milliseconds) across the 10 primary rounds, plus a 1-minute (60,000ms) penalty per incorrect answer, in a Competition game. Displayed in human-readable format (e.g., "29.6s" or "2m 29.6s").

## Clarifications

### Session 2026-03-07

- Q: How should replay rounds work in Competition mode — consistent across players or per-player? → A: No replay rounds in Competition mode; the game ends after the 10 primary rounds.
- Q: Should the system offer a way to generate a random seed? → A: Yes, provide a "Generate seed" button that creates a random short string and fills the seed field.
- Q: Should Competition game scores be included in Play mode aggregates or kept separate? → A: Included in Play aggregates (merged — counts toward total score, high scores, progression graph).
- Q: How should the seed from a URL be preserved when the user has no active session and must select a profile first? → A: The seed is stored temporarily across the profile-selection redirect, then automatically applied once the player selects a profile and navigates to the game screen.
- Q: Should the seed be displayed on the results screen? → A: Yes, display the seed on the Competition results screen. Also include a Share button that links to a page displaying the player's profile name, score, total time, and a replay link button allowing anyone to play the same seed.

## Assumptions

- No server or real-time communication is needed. Competition is "asynchronous" — players independently play the same seed and compare results manually (e.g., by reading scores to each other or taking screenshots).
- The seed-to-question mapping is a pure function: same seed always produces same questions regardless of device, browser, or time of play.
- Competition games use the same 10-round format, same question category distribution (3 percentage + 2 ratio + 2 fraction + 3 story), same scoring rules (0–5 points per question, max 50), and same timer durations (20s numeric, 50s story) as Play mode.
- The URL seed parameter uses standard URL encoding for special characters.
- There is no "lobby" or matchmaking system — players coordinate externally (verbally, via messaging, etc.).
- Story challenge word-problem templates must also be deterministically selected from the seed to ensure identical questions.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Two players entering the same seed on different devices receive the exact same 10-question sequence with identical values, types, hidden positions, and order — 100% match rate.
- **SC-002**: Players can set up and start a Competition game within 30 seconds of selecting the mode (entering seed and pressing start).
- **SC-003**: Players opening a seeded URL reach the Competition game screen (post-profile selection) within 2 interactions (select profile → view game screen).
- **SC-004**: The total time displayed on the Competition results screen is accurate to within 100 milliseconds of the actual cumulative round time.
- **SC-005**: 100% of Competition games produce a results screen showing both the score (0–50) and the total time.
- **SC-006**: Existing Play and Improve mode functionality remains completely unaffected — no regressions in scoring, question generation, or results display.

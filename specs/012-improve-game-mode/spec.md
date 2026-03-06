# Feature Specification: Improve Game Mode

**Feature Branch**: `012-improve-game-mode`  
**Created**: 2025-07-22  
**Updated**: 2026-03-06  
**Status**: Draft  
**Input**: User description: "Add a new game mode, accessible from the main menu, called 'Improve' (the original mode is now called 'Play'). The 'Improve' game mode looks at the up to 10 last games, identifies which question categories the player has found the most challenging (mistakes/replayed, longer response times) and creates a game composed of rounds biased toward these challenging categories. The 'Improve' games *do not* count towards the player's high scores and the profile average. The 'Improve' button has a small descriptor text underneath saying 'Level up your tricky areas: {categories to practice}'. The 'Play' button has a small descriptor text underneath saying 'Go for a high score!'."

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Per-Round History Recording (Priority: P1)

Every time a player completes a game, the system records detailed per-round data — which question type was asked, the values involved, whether the answer was correct, and how long the player took to respond. This data is stored as part of the player's game history so that future analysis can identify challenging categories.

**Why this priority**: Without per-round data, the Improve mode cannot determine which numbers are challenging. This is the foundational data layer that all other stories depend on.

**Independent Test**: Play a game to completion, then verify the per-round data (factors, correctness, response time) is persisted alongside the existing game record.

**Acceptance Scenarios**:

1. **Given** a player completes a game, **When** the game results are saved, **Then** each round's question type, values, correctness, and response time in milliseconds are persisted alongside the game score.
2. **Given** a player has game history from before this feature, **When** the system loads that history, **Then** old records without per-round data are treated as having no round detail (graceful degradation — they are simply excluded from Improve analysis).
3. **Given** a player has played more than 100 games, **When** a new game completes, **Then** the oldest game record (including its round data) is removed to stay within the 100-game history cap.

---

### User Story 2 — Challenging Category Identification (Priority: P1)

The system analyzes a player's most recent completed games to identify which question categories (percentage, ratio, fraction, rule-of-three) the player finds most challenging. A category is considered challenging if the player has a higher mistake rate or slower response time in that category. The result is a ranked list of difficult categories used to populate Improve mode rounds and to display the "tricky areas" preview.

**Why this priority**: This analysis algorithm is the core logic of the Improve feature. Without it, there is nothing to base the Improve game on.

**Independent Test**: Given a player with completed games containing a mix of fast-correct, slow-correct, and incorrect rounds across different question categories, the system produces a ranked list of challenging categories ordered by difficulty.

**Acceptance Scenarios**:

1. **Given** a player with at least one completed game containing per-round data, **When** the system analyzes their history, **Then** it considers up to 10 most recent completed games and produces a list of challenging question categories.
2. **Given** a player answered percentage questions incorrectly more often than other categories, **When** the system ranks challenging categories, **Then** percentages appears as the top tricky category.
3. **Given** a player answered all questions correctly and quickly across recent games, **When** the system analyzes their history, **Then** the challenging categories list is empty (no areas to practice).
4. **Given** a player has no mistakes but is consistently slowest on ratio questions, **When** the system analyzes their history, **Then** ratios appears as a tricky category (slowest = trickiest when all correct).

---

### User Story 3 — Main Menu with Play and Improve Modes (Priority: P1)

After selecting their profile, the player sees the game screen with two distinct action choices: "Play" and "Improve". The "Play" button has a descriptor saying "Go for a high score!" and starts a standard game. The "Improve" button has a descriptor showing "Level up your tricky areas: Percentages, Ratios" (listing the specific categories the player should practice) and starts a targeted practice game.

**Why this priority**: The dual-mode menu is the primary user-facing entry point for the feature. Without it, players cannot access Improve mode.

**Independent Test**: Select a player who has game history, verify both buttons appear with correct descriptors, and confirm each button starts the correct game mode.

**Acceptance Scenarios**:

1. **Given** a player with game history containing challenging categories, **When** they reach the game screen, **Then** they see a "Play" button with descriptor "Go for a high score!" and an "Improve" button with descriptor "Level up your tricky areas: Percentages, Ratios" (showing the actual tricky categories from their history).
2. **Given** a player with no game history (new player), **When** they reach the game screen, **Then** the "Improve" button is not shown because there is no data to analyze, and only the "Play" button is visible.
3. **Given** a player whose recent games show no challenging categories (everything answered correctly and quickly), **When** they reach the game screen, **Then** the "Improve" button is not shown and an encouraging message is displayed, e.g., "No tricky areas right now — keep playing to unlock Improve mode!"
4. **Given** a player has game history but none of the records contain per-round data (all pre-feature games), **When** they reach the game screen, **Then** the "Improve" button is not shown because there is insufficient data for analysis.

---

### User Story 4 — Improve Game with Targeted Rounds (Priority: P2)

When a player starts an Improve game, the system generates 10 rounds biased toward the player's challenging question categories. The game plays identically to a standard game (same round flow, timing, scoring display, feedback, and replay mechanics) but uses a question distribution heavily weighted toward weak categories rather than the default balanced distribution.

**Why this priority**: This is the core gameplay experience for Improve mode but depends on the analysis algorithm (Story 2) and menu integration (Story 3).

**Independent Test**: Start an Improve game for a player whose analysis shows percentages and ratios as challenging. Verify most rounds feature those categories, and the game flow (input, feedback, replay) works identically to a standard game.

**Acceptance Scenarios**:

1. **Given** a player's analysis identifies 2 challenging categories, **When** an Improve game is started, **Then** the 10 rounds are biased toward those categories while still including at least 1 round from each of the 4 categories.
2. **Given** a player's analysis identifies all 4 categories as challenging, **When** an Improve game is started, **Then** the extra slots are distributed proportionally among them.
3. **Given** a player's analysis identifies only 1 challenging category, **When** an Improve game is started, **Then** that category gets the majority of slots while the other categories still appear.
4. **Given** an Improve game is in progress, **When** the player answers a round incorrectly, **Then** the round enters the replay queue just as in a standard game.
5. **Given** an Improve game is in progress, **When** the player views the game status, **Then** the score display is replaced with a "Practice" indicator and no score number is shown, making it clear they are in practice mode.

---

### User Story 5 — Improve Games Excluded from Scores (Priority: P2)

Improve games do not affect the player's high scores, profile average, total score, games played count, or progression graph. The game completion screen for Improve mode does not display scoring metrics in the same way as a standard game — instead it focuses on practice feedback.

**Why this priority**: Ensuring score isolation is essential for data integrity but is lower priority than the core gameplay loop.

**Independent Test**: Complete an Improve game, verify the player's total score, games played count, high scores, and profile average remain unchanged.

**Acceptance Scenarios**:

1. **Given** a player has a total score of 200 and 10 games played, **When** they complete an Improve game scoring 35 points, **Then** their total score remains 200 and games played remains 10.
2. **Given** a player completes an Improve game, **When** they view their recent high scores on the game screen, **Then** the Improve game does not appear in the list.
3. **Given** a player completes an Improve game, **When** they view their progression graph, **Then** the Improve game does not appear as a data point.
4. **Given** a player completes an Improve game, **When** the game completion screen is shown, **Then** it displays "You got X/10 right!" and lists the specific questions that were still answered incorrectly.

---

### User Story 6 — Tricky Categories Preview (Priority: P3)

The descriptor text beneath the "Improve" button shows the specific question categories that the player's challenging analysis identified. These categories are displayed as human-readable labels (e.g., "Percentages", "Ratios", "Fractions", "Word problems").

**Why this priority**: The preview descriptor is a polish feature that helps players understand what Improve mode will focus on. It depends on the analysis algorithm already working.

**Independent Test**: A player whose challenging categories are percentages and ratios should see the descriptor "Level up your tricky areas: Percentages, Ratios".

**Acceptance Scenarios**:

1. **Given** a player's challenging categories are percentages and ratios, **When** the Improve button descriptor is rendered, **Then** it shows "Level up your tricky areas: Percentages, Ratios".
2. **Given** the screen is narrow (mobile), **When** the descriptor is rendered, **Then** the text wraps gracefully without overflowing or being cut off.

---

### Edge Cases

- **First game ever**: A brand-new player with zero game history sees only the "Play" button. The Improve button appears only after they have completed at least one game with per-round data recorded.
- **All games pre-feature**: A returning player whose entire history predates the per-round data extension has no analyzable data. They see only "Play" until they complete a new game.
- **Perfect player**: A player who answers every question correctly and quickly in all recent games has no challenging categories. The Improve button is hidden and an encouraging message is shown.
- **Only one challenging category**: If analysis finds just one weak category, Improve mode still generates 10 rounds — with heavy bias toward that category plus at least 1 round from each other category.
- **Improve game data for future analysis**: Per-round data from Improve games IS recorded. Since the analysis uses up to 10 recent games, Improve game data feeds into subsequent challenge analysis. Improve game records are clearly marked so they are excluded from score computations.
- **Player switches between modes**: A player can alternate freely between Play and Improve games. Each mode starts fresh and does not interfere with the other.
- **Legacy multiplication records**: Old game records that use the pre-proportional-reasoning `factorA`/`factorB` format are gracefully skipped during challenge analysis (they lack the `type` field).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST record per-round data for each completed game: the question type, the values array, the player's answer correctness, and the response time in milliseconds.
- **FR-002**: The system MUST gracefully handle game history records that lack per-round data (pre-feature records) or that use the legacy multiplication format (no `type` field), excluding them from Improve analysis without errors.
- **FR-003**: The system MUST analyze the player's up to 10 most recent completed games (that contain per-round data with the `type` field) to produce a ranked list of challenging question categories.
- **FR-004**: A question category MUST be flagged as challenging when it has a higher mistake rate or notably slower average response time compared to other categories.
- **FR-005**: When ranking challenging categories, categories with more mistakes MUST be ranked higher; ties broken by slower average response time.
- **FR-006**: The game screen MUST present two game mode options when the player has analyzable challenging categories: "Play" (standard game) and "Improve" (targeted practice).
- **FR-007**: The "Play" button MUST display a descriptor text: "Go for a high score!"
- **FR-008**: The "Improve" button MUST display a descriptor text: "Level up your tricky areas: {categories}" where {categories} is a comma-separated list of human-readable category labels (e.g., "Percentages, Ratios").
- **FR-009**: The "Improve" button MUST NOT be shown when the player has no game history, no per-round data, or no challenging categories identified.
- **FR-010**: When Improve is unavailable due to no challenging categories (player is performing well), the system MUST display an encouraging message in place of the Improve button.
- **FR-011**: An Improve game MUST generate 10 rounds biased toward the player's challenging categories, while still including at least 1 round from each of the 4 question types.
- **FR-012**: An Improve game MUST use the same round flow, timing, feedback, and replay mechanics as a standard game.
- **FR-013**: During an Improve game, the score display area MUST be replaced with a "Practice" indicator. No score number is shown during Improve gameplay.
- **FR-014**: Improve game results MUST NOT be added to the player's total score, games played count, high score list, profile average, or progression graph.
- **FR-015**: Improve game per-round data MUST still be recorded, and the game record MUST be marked as an Improve game so it can be excluded from scoring aggregations.
- **FR-016**: The Improve game completion screen MUST show "You got X/10 right!" (where X is the count of correctly answered primary rounds) and list the specific questions that were still answered incorrectly, so the player knows what to keep practising.
- **FR-017**: The tricky categories preview MUST display up to 3 category labels.
- **FR-018**: The entire feature MUST be accessible via keyboard and screen reader, following the application's accessibility-first constitution.
- **FR-019**: All new UI elements MUST be responsive and function correctly on both mobile and desktop screen sizes.

### Key Entities

- **Round Result**: A record of a single round within a game — captures the question type, the values array, whether the answer was correct, and the response time. Stored as part of a game record.
- **Game Record (extended)**: An existing entity that stores a player's completed game. Extended to include an array of round results and a flag indicating whether the game was an Improve game or a standard Play game.
- **Challenging Item**: A derived concept (not persisted) representing a question category that the player finds difficult, along with mistake count and average response time used for ranking. Produced by analysis of recent game records.
- **Tricky Categories List**: A derived concept (not persisted) — the human-readable labels of the top challenging question categories, used for the Improve button's descriptor text.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Players with game history can start an Improve game within 2 taps/clicks from the game screen (select Improve → game begins).
- **SC-002**: The Improve game correctly prioritizes challenging question categories — at least 50% of the 10 rounds feature categories identified as challenging by the analysis.
- **SC-003**: Improve game results do not alter any player score metrics — total score, games played, high scores, and profile average remain unchanged after an Improve game.
- **SC-004**: The tricky categories descriptor accurately reflects the player's weak areas as determined by their most recent games, updating after each new game is completed.
- **SC-005**: Players who repeatedly use Improve mode see their challenging categories evolve over time as they master previously difficult areas, demonstrating the feature's value in skill building.
- **SC-006**: All new UI elements meet accessibility standards (keyboard navigable, screen-reader compatible, sufficient color contrast).
- **SC-007**: The feature functions correctly for players with varying amounts of game history: 0 games (Improve hidden), 1+ games with per-round data (analysis based on most recent game).

## Clarifications

### Session 2026-02-16

- Q: How should challenging categories be identified? → A: Group all rounds from recent games by question type, aggregate mistake counts and average response times. Categories with mistakes are ranked by mistake count desc, then avgMs desc. If all correct, categories ranked by avgMs desc (slowest = trickiest).
- Q: Should Improve game rounds be included in the challenging-category analysis that determines future Improve game content? → A: Yes. The analysis uses up to 10 most recent games (both Play and Improve).
- Q: How should an Improve game be visually distinguished from a standard Play game during gameplay? → A: Replace the score display with a "Practice" indicator — no score is shown during Improve games.
- Q: What should the Improve game completion screen show? → A: "You got X/10 right!" plus a list of questions still answered incorrectly.

## Assumptions

- The analysis window of up to 10 most recent completed games keeps the challenging-category list responsive to the player's recent performance. The tricky categories update after every game, reflecting immediate progress or newly discovered weaknesses.
- The challenge analysis groups rounds by question type (percentage, ratio, fraction, ruleOfThree) and ranks types by mistake count (descending), then by average response time (descending) as a tiebreaker.
- Legacy game records that use the old multiplication format (with `factorA`/`factorB` instead of `type`/`values`) are gracefully skipped during analysis.
- The maximum of 3 tricky categories in the descriptor provides a good balance between informativeness and visual cleanliness.
- The game completion screen for Improve mode shows "You got X/10 right!" and a list of questions still answered incorrectly (e.g., "Keep practising: 25% of 80 = ?, 2 : ? = 6 : 9"). No score number or high-score framing is shown.

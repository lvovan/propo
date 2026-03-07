# Feature Specification: Competitive Mode — Scoring & UI Update

**Feature Branch**: `032-competitive-scoring-ui`  
**Created**: 2026-03-07  
**Status**: Draft  
**Input**: User description: "Competitive Mode — Scoring & UI Specification Update. In Competition mode, replace the time-penalty scoring model with a per-round point-decay model (10 → 1 over time), show only the final score on the result screen (no completion time), force seed input to lowercase, hide remaining time from the top status panel, and add a color-transitioning progress bar displaying the current point value."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Point-Decay Scoring During a Round (Priority: P1)

A player is in the middle of a Competition mode round. The round starts with 10 points available. As seconds tick by, the available points decrease linearly toward 1. The player sees the current point value on the progress bar, which transitions from green to orange to red as the value drops. If the player answers correctly while points remain, they earn those points. If they answer incorrectly, they lose the same amount. This creates a risk-reward dynamic: answering fast earns more points, but guessing incorrectly is costly.

**Why this priority**: The point-decay scoring model is the core differentiator of this feature update. Without it, Competition mode still uses the old time-penalty system and none of the other UI changes are meaningful.

**Independent Test**: Can be fully tested by starting a Competition game, observing the point value decrease during a round, answering at different times, and verifying the score awarded matches the displayed point value at the moment of answering.

**Acceptance Scenarios**:

1. **Given** a player starts a Competition round, **When** the round begins, **Then** the available point value starts at 10.
2. **Given** a round is in progress and the round timer has not expired, **When** time elapses, **Then** the available point value decreases linearly from 10 toward 1.
3. **Given** a round is in progress with 7 points currently available, **When** the player answers correctly, **Then** 7 points are added to the player's total score.
4. **Given** a round is in progress with 7 points currently available, **When** the player answers incorrectly, **Then** 7 points are subtracted from the player's total score.
5. **Given** a round is in progress and the timer has fully expired, **When** the player answers correctly, **Then** 1 point is added to the player's total score.
6. **Given** a round is in progress and the timer has fully expired, **When** the player answers incorrectly, **Then** 1 point is subtracted from the player's total score.
7. **Given** any game mode other than Competition, **When** the scoring rules are applied, **Then** the existing scoring model is used (no point-decay behavior).

---

### User Story 2 - Final Score on Results Screen (Priority: P1)

After completing all 10 rounds of a Competition game, the player sees the results screen. It displays only the final score — the sum of all points earned (and lost) across the 10 rounds. Completion time is not shown for Competition games.

**Why this priority**: The results screen must reflect the new scoring model. Showing completion time would conflict with the point-decay model where time is already factored into the score.

**Independent Test**: Can be fully tested by completing a Competition game with a mix of correct and incorrect answers at varying times, then verifying the results screen shows the correct cumulative score and does not display any completion time.

**Acceptance Scenarios**:

1. **Given** a player completes a 10-round Competition game, **When** the results screen is displayed, **Then** the final score (sum of all per-round point values earned or lost) is shown.
2. **Given** a player completes a Competition game, **When** the results screen is displayed, **Then** completion time is NOT shown.
3. **Given** a player answers all 10 rounds correctly at maximum speed (10 points each), **When** the results screen appears, **Then** the final score displayed is 100.
4. **Given** a player answers 5 rounds correctly (earning 10 points each) and 5 rounds incorrectly (losing 10 points each), **When** the results screen appears, **Then** the final score displayed is 0.
5. **Given** a player answers all 10 rounds incorrectly immediately (losing 10 points each), **When** the results screen appears, **Then** the final score displayed is -100.

---

### User Story 3 - Visual Progress Bar with Point Value (Priority: P2)

During each round of a Competition game, the player sees a progress bar that visually communicates the current point value. The bar starts full and green, transitions through orange, and becomes red as points decrease. The current point value is displayed on the bar. The bar is slightly thicker than in other game modes to accommodate the point label and draw attention.

**Why this priority**: The progress bar is the primary feedback mechanism for the point-decay model. Without it, players cannot gauge their remaining points and make informed timing decisions. It depends on the scoring model (P1) being in place.

**Independent Test**: Can be tested by starting a Competition game, observing the progress bar during a round, and verifying it transitions colors smoothly, displays the current point value, and is visibly thicker than the progress bar in Play or Improve mode.

**Acceptance Scenarios**:

1. **Given** a Competition round begins, **When** the progress bar is displayed, **Then** it starts at full width with a green color.
2. **Given** a Competition round is in progress, **When** approximately half the round time has elapsed, **Then** the progress bar is at approximately mid-width with an orange color.
3. **Given** a Competition round is in progress, **When** the round timer is nearly expired, **Then** the progress bar is nearly empty with a red color.
4. **Given** a Competition round is in progress, **When** the player views the progress bar, **Then** the current point value (integer) is displayed on or near the bar and updates continuously.
5. **Given** a player is in a non-Competition game mode, **When** the progress bar is displayed, **Then** it uses the standard thickness and does not show a point value.
6. **Given** a Competition round is in progress, **When** the player compares the progress bar to a non-Competition game, **Then** the Competition bar is noticeably thicker.

---

### User Story 4 - Seed Input Forced to Lowercase (Priority: P3)

When a player manually enters a seed for a Competition game, any uppercase letters are automatically converted to lowercase. This ensures that seeds like "ABC123" and "abc123" always produce the same game, preventing confusion when players share seeds verbally.

**Why this priority**: This is a quality-of-life improvement that prevents seed mismatch issues. It is low-risk and simple but less critical than the core scoring and UI changes.

**Independent Test**: Can be tested by typing uppercase characters into the seed input field and verifying they appear as lowercase.

**Acceptance Scenarios**:

1. **Given** a player is on the Competition setup screen, **When** they type "ABC123" into the seed input field, **Then** the field displays "abc123".
2. **Given** a player types "MyGameSeed" into the seed input field, **When** they view the field contents, **Then** it shows "mygameseed".
3. **Given** a player pastes "MIXED_Case_Seed" into the seed input field, **When** the paste completes, **Then** the field displays "mixed_case_seed".

---

### User Story 5 - Hidden Remaining Time in Status Panel (Priority: P2)

During a Competition game, the top status panel does not display the remaining time counter. Since score is entirely driven by the point-decay model (visible on the progress bar), showing a separate time counter would be redundant and distracting.

**Why this priority**: This UI change directly supports the point-decay scoring model by focusing the player's attention on the progress bar as the single source of time-pressure feedback.

**Independent Test**: Can be tested by starting a Competition game and verifying the top status panel does not show any remaining time value, while non-Competition modes still show it.

**Acceptance Scenarios**:

1. **Given** a player is playing a Competition mode round, **When** they look at the top status panel, **Then** no remaining-time display is visible.
2. **Given** a player is playing a Play or Improve mode round, **When** they look at the top status panel, **Then** the remaining-time display is shown as usual.

---

### Edge Cases

- What happens if the player's total score goes negative? The final score can be negative and is displayed as-is (e.g., "-15"). There is no floor at zero.
- What is the theoretical score range? The maximum possible score is 100 (all 10 rounds answered correctly at exactly 10 points each). The minimum possible score is -100 (all 10 rounds answered incorrectly at exactly 10 points each).
- What point value is shown when the timer has expired? The progress bar shows 1, and any answer (correct or incorrect) after the timer expires uses the value of 1.
- Does the point value decrease in discrete steps or continuously? The point value decreases continuously (smoothly). The displayed integer is the floor of the current value at the moment of answering.
- How does the scoring change apply to saved game records? Competition games using the new scoring model store the per-round point values earned. The final score replaces total time as the competitive metric.
- How are Competition scores treated in aggregates? Competition scores (ranging -100 to +100) are excluded from Play/Improve aggregates (which use a 0–50 scale). Competition scores are tracked separately.
- What happens to the Share URL format? The shared result URL for Competition games replaces the `time` parameter with a `score` parameter encoding the final score (which can be negative). Completion time is not included in the URL.
- Does the 1-minute time penalty from the original Competition spec still apply? No. The time-penalty model is replaced entirely by the point-decay scoring model in Competition mode.
- What happens when a seeded URL is opened — does the seed get lowercased? Yes. Seeds from URL parameters are also normalized to lowercase, ensuring consistent behavior with manual entry.
- What characters does the "Generate seed" button use? Only lowercase letters (a–z) and digits (0–9). No uppercase characters are ever generated.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: In Competition mode, each round MUST start with a point value of 10.
- **FR-002**: In Competition mode, the point value MUST decrease linearly from 10 to 1 over the duration of the round timer.
- **FR-003**: In Competition mode, a correct answer before the timer expires MUST award the player the current point value (positive).
- **FR-004**: In Competition mode, an incorrect answer before the timer expires MUST deduct the current point value from the player's score (negative).
- **FR-005**: In Competition mode, a correct answer after the timer has fully expired MUST award +1 point.
- **FR-006**: In Competition mode, an incorrect answer after the timer has fully expired MUST deduct 1 point.
- **FR-007**: The 1-minute time penalty used in other modes MUST NOT apply in Competition mode.
- **FR-008**: The final Competition score MUST be the sum of all points earned or lost across the 10 rounds.
- **FR-009**: The Competition results screen MUST display only the final score.
- **FR-010**: The Competition results screen MUST NOT display completion time.
- **FR-011**: The seed input field on the Competition setup screen MUST force all entered characters to lowercase.
- **FR-012**: Seeds received via URL parameters MUST be normalized to lowercase before use.
- **FR-013**: The in-game top status panel MUST NOT display the remaining time during Competition mode rounds.
- **FR-014**: During Competition mode rounds, the progress bar MUST display the current point value, updated continuously as it decreases.
- **FR-015**: During Competition mode rounds, the progress bar MUST transition color smoothly from green (high points) through orange (mid points) to red (low points) as the point value decreases.
- **FR-016**: During Competition mode rounds, the progress bar MUST be visibly thicker than the progress bar used in other game modes.
- **FR-017**: The point value awarded or deducted MUST be determined by the displayed value at the exact moment the player submits their answer.
- **FR-018**: Non-Competition game modes (Play, Improve) MUST remain completely unaffected by these changes — their scoring, timer display, and progress bar behavior MUST be unchanged.
- **FR-019**: Competition scores under the point-decay model MUST be excluded from Play/Improve scoring aggregates (total score, high scores, progression graph). Competition scores MUST be tracked separately.
- **FR-020**: The "Generate seed" button MUST produce a random string using only lowercase alphanumeric characters.
- **FR-021**: The Competition share URL MUST encode the final score (replacing the `time` parameter from 030-competitive-mode) alongside the player name and seed. Completion time MUST NOT be included in the share URL.

### Key Entities

- **Round Point Value**: A continuously decreasing value (10 → 1) representing the points available during a Competition round. Determined by elapsed time relative to the round timer duration. Used for both awarding (correct answer) and deducting (incorrect answer) points.
- **Final Score**: The cumulative sum of all per-round point values earned or lost across 10 rounds in a Competition game. Can range from -100 to +100. Replaces total time as the competitive metric.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Players can see the current point value on the progress bar at all times during a Competition round, with updates at least 10 times per second.
- **SC-002**: The score awarded for a correct answer matches the point value displayed at the moment of submission, accurate to the nearest integer.
- **SC-003**: 100% of Competition results screens show only the final score and do not show completion time.
- **SC-004**: The progress bar color transitions visually from green to orange to red during every Competition round, covering the full spectrum as points decrease from 10 to 1.
- **SC-005**: All uppercase characters typed or pasted into the seed input field are converted to lowercase within one interaction cycle (before the next render).
- **SC-006**: The top status panel in Competition mode does not display remaining time, while Play and Improve modes continue to display it.
- **SC-007**: Existing Play and Improve mode scoring, progress bars, and timer displays remain completely unchanged.

## Clarifications

### Session 2026-03-07

- Q: How should Competition scores (new -100 to +100 scale) be treated in Play/Improve aggregates (0–50 scale)? → A: Exclude Competition scores from Play/Improve aggregates entirely; track them separately.
- Q: Should the "Generate seed" button produce lowercase-only characters, or mixed-case relying on the input field to normalize? → A: Generate lowercase-only characters from the start.
- Q: Should the Competition share URL replace the `time` parameter with `score`, or keep both? → A: Replace `time` with `score`; completion time is not encoded in the share URL.

## Assumptions

- This feature modifies the scoring and UI behavior defined in the 030-competitive-mode spec. All other aspects of Competition mode (seed-based question generation, URL sharing, mode selection, no replay rounds) remain unchanged.
- The round timer durations (20s for numeric questions, 50s for story questions) remain the same as in other game modes. Only their effect on scoring changes.
- The point value decreases linearly: `pointValue = 10 - (9 × elapsedTime / timerDuration)`, clamped to a minimum of 1 while the timer is running.
- The displayed point value is the floor (truncated integer) of the continuous value at the moment of submission.
- Negative final scores are valid and will be stored and displayed.
- The Share feature from 030-competitive-mode will encode the final score (which can be negative) in a `score` parameter, replacing the `time` parameter. The share URL format becomes `/#/result?seed=abc123&player=Alice&score=45`.
- This feature overrides 030-competitive-mode FR-014 (which included Competition in Play aggregates). Under the new scoring model, the incompatible score scales require separate aggregate tracking.

# Feature Specification: Normal Mode Scoring Alignment & UI Updates

**Feature Branch**: `034-normal-mode-scoring-ui`
**Created**: 2026-03-08
**Status**: Draft
**Input**: User description: "Normal Mode must use the same scoring system as Competition Mode (linear decay 10→1). Fix the initial point value bug where 10 is skipped. Update the progress bar to be thicker with larger text showing 'X points/point' (localized). Add 'excluding competition games' label under Best recent score on the home screen."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Unified Scoring in Normal Mode (Priority: P1)

A player starts a Normal Mode game. As each round begins, the progress bar shows a score starting at 10 points that decays linearly down to 1 over the round timer duration. If the player answers correctly while the bar shows "7 points", they earn 7 points for that round. If the player answers incorrectly, they lose the current point value. The scoring behavior is identical to Competition Mode, providing a consistent experience across modes.

**Why this priority**: The core change. Without this, the scoring systems remain divergent and Normal Mode uses a different, less intuitive tier-based system. All other changes in this feature build on this foundation.

**Independent Test**: Start a Normal Mode game and verify that the score decays linearly from 10 to 1 over the round timer. Answer at different time points and confirm points awarded match the displayed value. Compare with a Competition Mode game to verify identical scoring behavior.

**Acceptance Scenarios**:

1. **Given** a player starts a Normal Mode round, **When** the round timer begins, **Then** the score value starts at 10 and decays linearly to 1 over the full timer duration.
2. **Given** a player answers correctly while the displayed value is N, **When** the answer is submitted, **Then** the player earns exactly N points for that round.
3. **Given** a player answers incorrectly while the displayed value is N, **When** the wrong answer is submitted, **Then** the player loses N points for that round (negative scoring).
4. **Given** the timer expires without an answer, **When** the round ends, **Then** the player receives -1 point for that round.
5. **Given** the timer has expired and the player submits an incorrect answer, **When** the answer is evaluated, **Then** the player receives exactly -1 point (not more).
6. **Given** the same question type and timer position in both Normal and Competition modes, **When** the player answers, **Then** the points awarded or deducted are identical.

---

### User Story 2 - Initial 10-Point Value Visibility Fix (Priority: P1)

When a round starts, the player sees the score value begin at exactly 10. The value 10 remains visible for the same proportional duration as any other value (i.e., each integer from 10 to 1 gets an equal share of the total timer). The progress bar does not skip directly to 9 on the first frame.

**Why this priority**: This is a bug fix directly tied to Story 1. If 10 is skipped, the scoring range is effectively 9→1 instead of 10→1, which undermines the unified scoring system.

**Independent Test**: Start a round and observe the displayed value at the very first frame. Confirm it reads "10 points". Wait briefly and confirm 10 remains displayed for approximately 1/10th of the total timer duration before transitioning to 9.

**Acceptance Scenarios**:

1. **Given** a round begins in Normal or Competition mode, **When** the countdown bar first renders, **Then** the displayed value is 10.
2. **Given** a round is in progress, **When** 1/10th of the timer has elapsed, **Then** the value transitions from 10 to 9 (not before).
3. **Given** the scoring system runs at high frequency, **When** the bar updates on the first frame, **Then** the value is 10 (not 9 due to an off-by-one error).

---

### User Story 3 - Enhanced Progress Bar Display (Priority: P2)

During gameplay in both Normal and Competition modes, the player sees a thicker progress bar with larger, more readable text inside it. The text displays the current point value followed by the localized word for "points" (plural) or "point" (singular), with a space between the number and the word.

**Why this priority**: Visual improvement that enhances readability and clarity. Lower priority than the functional scoring changes but important for user experience.

**Independent Test**: Start a game in any mode and verify the progress bar is visibly thicker than the previous version. Read the text inside the bar and confirm it shows "10 points", "1 point", etc. Switch the app language and confirm the label is properly translated and uses correct singular/plural forms.

**Acceptance Scenarios**:

1. **Given** a round is in progress, **When** the player views the progress bar, **Then** the bar is visibly thicker than the previous design.
2. **Given** the current score value is greater than 1 (e.g., 7), **When** the bar renders, **Then** the text inside reads "7 points" (with a space, using the correct plural form in the current language).
3. **Given** the current score value is exactly 1, **When** the bar renders, **Then** the text inside reads "1 point" (singular form in the current language).
4. **Given** the app language is set to a non-English language (e.g., Portuguese), **When** the bar renders, **Then** the label uses the correctly translated and pluralized form (e.g., "7 pontos", "1 ponto").
5. **Given** the progress bar text is displayed, **When** the player reads it, **Then** the font size is noticeably larger and more legible than the previous design.

---

### User Story 4 - Home Screen Score Clarification (Priority: P3)

On the home screen, beneath the "Best recent score" heading, the player sees a small note reading "excluding competition games". This clarifies that the displayed best score only reflects Normal (Play) mode results.

**Why this priority**: Informational label that prevents player confusion. Least critical since it does not affect gameplay, but improves clarity now that Normal and Competition modes share the same scoring system.

**Independent Test**: Navigate to the home screen and verify the label "excluding competition games" appears in small font directly below the "Best recent score" heading. Switch languages and confirm the label is translated.

**Acceptance Scenarios**:

1. **Given** the player is on the home screen, **When** they view the "Best recent score" section, **Then** a line reading "excluding competition games" appears in small font below the heading.
2. **Given** the app language changes, **When** the home screen renders, **Then** the "excluding competition games" label is displayed in the active language.
3. **Given** no games have been played, **When** the home screen renders, **Then** the "excluding competition games" label still appears beneath the heading (it is always visible regardless of score state).

---

### Edge Cases

- What happens when the timer duration is very short (e.g., custom durations)? The linear decay must still produce all integer values from 10 to 1 proportionally.
- What happens if the player answers within the first few milliseconds? The score must be 10, never higher or invalid.
- How does the scoring behave with story challenge questions that have a longer timer (50 seconds)? The same 10→1 linear decay must apply over the full 50-second duration.
- What if the player's language does not have distinct singular/plural forms? The localization must handle grammatical rules per language (the i18n system's pluralization must be used).
- What happens to historical Normal Mode scores after this change? Existing scores remain as recorded; only new games use the updated scoring system.
- What happens if the player submits an incorrect answer after the timer expires? The penalty must be exactly -1 (the minimum point value, negated), not a larger penalty.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Normal Mode MUST use the same linear point-decay scoring system as Competition Mode (10→1 over the round timer duration).
- **FR-002**: Both Normal and Competition modes MUST share a single scoring calculation to prevent future divergence.
- **FR-003**: The score value MUST start at exactly 10 when a round begins, and 10 MUST remain the active value for the first 1/10th of the timer duration.
- **FR-004**: A correct answer MUST award the current displayed point value (positive scoring).
- **FR-005**: An incorrect answer MUST deduct the current displayed point value (negative scoring).
- **FR-006**: If the timer expires without an answer, or if the player submits an incorrect answer after the timer has expired, the player MUST receive exactly -1 point for that round. The score summary table MUST display this value (not "—").
- **FR-007**: The progress bar MUST be visually thicker than the current design in both Normal and Competition modes.
- **FR-008**: The text inside the progress bar MUST be larger than the current design.
- **FR-009**: The progress bar text MUST display the current integer point value followed by a space and the localized word for "points" (plural) or "point" (singular), depending on the value.
- **FR-010**: The singular/plural form MUST be determined by the active application language's grammar rules.
- **FR-011**: The home screen MUST display "excluding competition games" in small font below the "Best recent score" heading.
- **FR-012**: The "excluding competition games" label MUST be translated to the active application language.
- **FR-013**: The Normal Mode final score range MUST be -100 to +100 (10 rounds × ±10 points maximum per round), consistent with Competition Mode.
- **FR-014**: The score summary table MUST always display the points earned or lost during primary play for each round. Replay attempts MUST NOT overwrite the original points value.

### Key Entities

- **Round Score**: The points earned or lost in a single round. Determined by the linear decay value at the moment of answer submission. Range: -10 to +10.
- **Game Score**: The cumulative total of all round scores in a game. Range: -100 to +100 for a 10-round game.
- **Point Decay**: The linear function that maps elapsed time to an integer score value (10 at start, 1 at timer expiry).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of Normal Mode rounds start with a displayed value of 10, and the value remains at 10 for the first 10% of the timer duration.
- **SC-002**: Scoring outcomes for identical answer timing are identical across Normal and Competition modes.
- **SC-003**: The progress bar text is readable at all supported screen sizes and displays the correct singular/plural form in every supported language.
- **SC-004**: The home screen "excluding competition games" label is visible and correctly translated in all supported languages.
- **SC-005**: Existing historical game scores are preserved unchanged after the update.

## Assumptions

- The number of rounds per game remains 10 in both modes.
- Timer durations (20 seconds for numeric, 50 seconds for story challenge) remain unchanged.
- The improve/practice mode continues to be excluded from best-score aggregation (unchanged behavior).
- The progress bar color transition behavior (green→red) is retained from the current design.
- The existing i18n infrastructure supports singular/plural forms (or will be extended minimally to do so).

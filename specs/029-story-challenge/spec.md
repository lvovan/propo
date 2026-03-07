# Feature Specification: Story Challenge Expansion

**Feature Branch**: `029-story-challenge`  
**Created**: 2026-03-07  
**Status**: Draft  
**Input**: User description: "Story Challenge expansion: 50/50 round split with advanced word problems (multi-item ratio, percentage-of-whole, complex extrapolation), normalized scoring per problem type, and dark mode readability fix for story text."

## User Scenarios & Testing *(mandatory)*

### User Story 1 — 50/50 Round Split with Story Challenges (Priority: P1)

A child plays a game of 10 rounds. Exactly 5 rounds are "Pure Numeric" questions (percentage, ratio, and fraction formats) and exactly 5 rounds are "Story Challenges" — multi-sentence word problems that require the player to extract relevant information, set up a proportion, and solve for the unknown. The existing ruleOfThree type is absorbed into Story Challenges as the "Complex Extrapolation" sub-type. The two categories are shuffled randomly so the player cannot predict what's next.

**Why this priority**: The 50/50 split is the core of this feature. Without it, the new problem types have no vehicle to appear and the entire expansion has no value. This is the structural foundation that all other stories depend on.

**Independent Test**: Start a game, play all 10 rounds, and verify that exactly 5 rounds presented Pure Numeric questions and exactly 5 presented Story Challenges. Repeat for 10 games to confirm consistency.

**Acceptance Scenarios**:

1. **Given** a player starts a new game, **When** the 10 rounds are generated, **Then** exactly 5 are Pure Numeric (percentage, ratio, or fraction) and exactly 5 are Story Challenges, with at least 1 of each Story Challenge sub-type represented.
2. **Given** a game is generated, **When** the rounds are presented, **Then** the order is randomized — Pure Numeric and Story Challenge rounds are interleaved unpredictably.
3. **Given** a player is on a Story Challenge round, **When** the question is displayed, **Then** it shows a multi-sentence word problem with a clear question asking for a single numeric answer.
4. **Given** a player is on a Pure Numeric round, **When** the question is displayed, **Then** it shows the existing inline formula format (e.g., "25% of 80 = ?", "2 : 3 = 6 : ?", or "2/5 = 4/?"). The old ruleOfThree type no longer appears as Pure Numeric.

---

### User Story 2 — Advanced Story Challenge Problem Types (Priority: P1)

Story Challenges come in three sub-categories that test different aspects of proportional reasoning. Each story uses age-appropriate, engaging scenarios (space scouts, pet shops, backpacks, etc.) with multiple pieces of information where only some are relevant to the answer.

**Why this priority**: The problem types define the educational value of Story Challenges. Without varied, well-designed problems, the 50/50 split would just be a different skin on the same content.

**Independent Test**: Play 20 games and verify that all three Story Challenge sub-types appear. Verify that each problem has exactly one correct whole-number answer and that "noise" information (irrelevant values) is present in the problem text.

**Acceptance Scenarios**:

1. **Given** a Story Challenge round uses the "Multi-Item Ratio" sub-type, **When** it is displayed, **Then** it presents a scenario with multiple item types at different values and asks for the total/value of a specific subset (e.g., "A backpack has 3 Blue Folders (5g each) and 2 Red Notebooks (10g each). What is the total weight of just the Blue Folders?"). Per-item values are restricted to friendly round numbers: {2, 3, 4, 5, 10, 15, 20, 25, 50}.
2. **Given** a Story Challenge round uses the "Percentage of the Whole" sub-type, **When** it is displayed, **Then** it presents a group of different items and asks what percentage one type represents (e.g., "A pet shop has 8 kittens, 7 puppies, and 5 hamsters. What percentage of the 20 total animals are the hamsters?"). The answer is always one of the friendly percentages: 10%, 20%, 25%, 50%, or 75%.
3. **Given** a Story Challenge round uses the "Complex Extrapolation" sub-type, **When** it is displayed, **Then** it presents a ratio for one set and asks the player to predict the outcome for a larger set (e.g., "If 2 Space Scouts need 10 oxygen tanks, how many tanks do 12 Space Scouts need?").
4. **Given** any Story Challenge round, **When** the player reads the problem, **Then** the problem contains at least one piece of "noise" information that is not needed to solve the answer but adds to the reasoning challenge.
5. **Given** any Story Challenge round, **When** the correct answer is computed, **Then** it is always a positive whole number.
6. **Given** any Story Challenge round, **When** the answer input area is displayed, **Then** the appropriate unit label (e.g., "g", "cal", "$", "eggs", "%") is shown next to the input box so the player knows what unit the answer is in.

---

### User Story 3 — Normalized Timer and Scoring Per Problem Type (Priority: P2)

Pure Numeric rounds use a 20-second timer, while Story Challenge rounds use a 50-second timer — reflecting the extra reading and reasoning time needed. Scoring is normalized so that answering at the same percentage of remaining time awards the same points regardless of problem type. For example, solving with 50% time remaining always earns the same score whether it's a 20s or 50s timer.

**Why this priority**: Fair scoring is essential for the game to feel balanced once two problem types with different difficulty levels coexist. It depends on the 50/50 split (Story 1) being in place.

**Independent Test**: Start a game, answer a Pure Numeric question at the 10-second mark (50% of 20s remaining) and a Story Challenge at the 25-second mark (50% of 50s remaining). Verify both rounds award the same number of points.

**Acceptance Scenarios**:

1. **Given** a Pure Numeric round is displayed, **When** the timer starts, **Then** it counts down from 20 seconds.
2. **Given** a Story Challenge round is displayed, **When** the timer starts, **Then** it counts down from 50 seconds.
3. **Given** a player answers a Pure Numeric question with 50% time remaining (at the 10s mark), **When** points are calculated, **Then** they receive +3 points (50% ≥ 40% tier). A player answering a Story Challenge at the 25s mark (also 50% remaining) also receives +3 points.
4. **Given** a player answers correctly with ≥ 60% time remaining on either problem type, **When** points are calculated, **Then** they receive the maximum score (+5 points).
5. **Given** a player answers correctly with 0% time remaining on either problem type, **When** points are calculated, **Then** they receive the minimum correct score (0 points).
6. **Given** a player answers incorrectly on any round type, **When** points are calculated, **Then** –2 points are applied regardless of problem type.
7. **Given** the score summary is displayed, **When** the player reviews round details, **Then** each round shows the timer duration appropriate to its problem type.

---

### User Story 4 — Dark Mode Readability for Story Text (Priority: P3)

When the user's system is in dark mode, Story Challenge text is displayed with high-contrast colors to ensure fast, comfortable reading. The story container uses a distinct visual treatment so that the longer narrative text does not blend into the dark background.

**Why this priority**: This is a UX polish item. The game is fully playable without it, but Story Challenges involve significantly more reading than Pure Numeric questions, making contrast critical for the timed experience.

**Independent Test**: Enable system dark mode, start a game, and navigate to a Story Challenge round. Verify the story text is clearly readable with sufficient contrast against the background.

**Acceptance Scenarios**:

1. **Given** the user's system theme is dark, **When** a Story Challenge round is displayed, **Then** the story text uses a high-contrast color (light text on dark background) that meets WCAG 2.1 AA contrast requirements.
2. **Given** the user's system theme is light, **When** a Story Challenge round is displayed, **Then** the story text uses the standard dark-on-light styling.
3. **Given** the user switches between light and dark system themes mid-game, **When** a Story Challenge round is displayed, **Then** the text contrast updates to match the current theme.

---

### Edge Cases

- **What happens in Improve mode?** The 50/50 split still applies. Improve mode biases toward challenging *sub-types* within each half. For the 5 Pure Numeric slots, it biases among (percentage, ratio, fraction). For the 5 Story Challenge slots, it biases among (multiItemRatio, percentageOfWhole, complexExtrapolation). The tricky areas display shows individual sub-type names.
- **What happens if the timer expires on a Story Challenge?** Same as current behavior — the round is scored as 0 points for a correct answer submitted after the timer, or the player can submit at any time. The timer is visual motivation, not a hard cutoff.
- **What happens if all 5 Story Challenges are answered incorrectly?** They enter the replay queue like any other round. The same story text and timer duration (50s) are used during replay.
- **What happens with very young players who can't read the stories?** The game is designed for ages 6–12. Story Challenges are written at a reading level appropriate for 8+ year olds. Players aged 6–7 will still benefit from the Pure Numeric rounds.
- **Are Story Challenge answers ever non-integer?** No. All problems are designed so the correct answer is always a positive whole number. Problem pools are pre-validated for this constraint.
- **Are arbitrary percentages possible for Percentage of the Whole?** No. To keep the mental math achievable for children, the answer must be one of the friendly percentages: 10%, 20%, 25%, 50%, or 75%. The generator discards any combination that would produce a different percentage.
- **What about i18n?** Story Challenge text templates are i18n keys, translated into all 6 supported languages. The scenarios (backpacks, pet shops, space scouts) are culturally neutral.
- **How many story templates are there?** Each sub-type has 60 distinct templates (180 total across all 3 types), using varied real-world scenarios (kitchens, camps, farms, arcades, music rooms, etc.) at a reading level suitable for ages 10–14. This ensures high replay variety.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST generate exactly 5 Pure Numeric rounds and 5 Story Challenge rounds per game (10 total).
- **FR-002**: The order of Pure Numeric and Story Challenge rounds MUST be randomized within each game.
- **FR-003**: Story Challenges MUST come in three sub-types: Multi-Item Ratio, Percentage of the Whole, and Complex Extrapolation. Each game MUST include at least 1 of each sub-type; the remaining 2 Story Challenge slots are filled randomly from any sub-type.
- **FR-004**: Each Story Challenge MUST present a multi-sentence word problem with at least one piece of information not needed to solve the problem ("noise").
- **FR-005**: All Story Challenge answers MUST be positive whole numbers.
- **FR-005a**: Percentage of the Whole answers MUST be restricted to the set {10, 20, 25, 50, 75}. The generator MUST discard any combination that produces a percentage outside this set.
- **FR-005b**: Multi-Item Ratio per-item values (weight, calories, cost, length, etc.) MUST be restricted to the set {2, 3, 4, 5, 10, 15, 20, 25, 50} to ensure the mental math is feasible for children.
- **FR-005c**: The answer input area MUST display the appropriate unit label next to the input box for all story types (e.g., "g", "kg", "cal", "$", "cm", "pages", "ml", "%", "eggs", "tanks"). The unit is carried on the `Formula` via `answerUnitKey`.
- **FR-006**: Story Challenge word problems MUST be translatable via i18n template keys in all 6 supported languages.
- **FR-007**: Pure Numeric rounds MUST use a 20-second countdown timer.
- **FR-008**: Story Challenge rounds MUST use a 50-second countdown timer.
- **FR-009**: Scoring MUST be based on percentage of time remaining using discrete tiers: ≥60% remaining → +5, ≥40% → +3, ≥20% → +2, >0% → +1, 0% → 0. These thresholds apply identically to both 20s and 50s timers.
- **FR-010**: The maximum score for a correct answer MUST be +5 points (answered instantly, 100% time remaining).
- **FR-011**: The minimum score for a correct answer MUST be 0 points (0% time remaining).
- **FR-012**: Incorrect answers MUST deduct 2 points regardless of problem type or time remaining.
- **FR-013**: During replay, Story Challenge rounds MUST use the same 50-second timer and display the same story text as the original attempt.
- **FR-014**: When the system theme is dark, Story Challenge text MUST use high-contrast colors meeting WCAG 2.1 AA contrast ratio (minimum 4.5:1 for normal text).
- **FR-015**: The dark mode high-contrast treatment MUST apply automatically based on the system theme preference (`prefers-color-scheme: dark`).
- **FR-016**: The countdown bar color progression MUST adapt to the per-round timer duration (green → lightGreen → orange → red at proportional thresholds).
- **FR-017**: The score summary table MUST display each round's problem type alongside the formula/question text.
- **FR-018**: Improve mode MUST maintain the 5/5 split while biasing categories within each half toward the player's challenging areas. Challenge analysis operates at the sub-type level (6 categories: percentage, ratio, fraction, multiItemRatio, percentageOfWhole, complexExtrapolation).

### Key Entities

- **Formula (extended)**: The existing formula entity is extended with a new question type value `'storyChallenge'` (or sub-types). Story Challenges carry longer `wordProblemKey` templates, a `values` array for computations, a `correctAnswer`, and an `answerUnitKey` (i18n key for the unit label displayed next to the answer input, e.g., `'unit.g'`, `'unit.eggs'`, `'unit.percent'`). They also carry metadata indicating the timer duration applicable to this round.
- **Round (extended)**: Each round now tracks which timer duration was used (20s or 50s) so the score summary can display the correct context.
- **Story Challenge Pool**: A pre-built collection of word-problem templates for each sub-type (Multi-Item Ratio, Percentage of the Whole, Complex Extrapolation), parameterized with variable values that produce whole-number answers. Each sub-type has 60 templates (180 total) using `StoryTemplate { key: string; unitKey: string }` pairs, covering 12+ unit types and diverse real-world scenarios.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Every generated game contains exactly 5 Pure Numeric and 5 Story Challenge rounds (verified across 1,000 generated games).
- **SC-002**: All three Story Challenge sub-types appear across 20 consecutive games.
- **SC-003**: Scoring normalization is exact — answering at X% remaining time always awards the same points for both problem types (verified by automated test).
- **SC-004**: Story Challenge text achieves ≥4.5:1 contrast ratio against the background in dark mode (verifiable via automated accessibility tooling).
- **SC-005**: Children aged 8–12 can read and answer a Story Challenge within the 50-second window in at least 80% of attempts.
- **SC-006**: The game remains fully playable and all existing tests continue to pass after the expansion.

## Assumptions

- The game currently has 4 question types (percentage, ratio, fraction, ruleOfThree). The existing `ruleOfThree` type is absorbed into Story Challenges as the "Complex Extrapolation" sub-type. After this feature, Pure Numeric consists of 3 types (percentage, ratio, fraction) and Story Challenges consist of 3 sub-types (Multi-Item Ratio, Percentage of the Whole, Complex Extrapolation — which subsumes the old ruleOfThree).
- The scoring formula shifts from fixed tier thresholds to a continuous or tiered function based on percentage of time remaining, normalized across both problem-type timer durations.
- Dark mode detection uses the CSS `prefers-color-scheme: dark` media query — no custom dark mode toggle is needed.
- Story Challenge templates are designed with cultural neutrality in mind (no region-specific currency, units, or cultural references that wouldn't translate well).
- The existing 3-digit numeric input constraint is sufficient for all Story Challenge answers (max answer ≤ 999).

## Clarifications

### Session 2026-03-07

- Q: What happens to the existing `ruleOfThree` question type when Story Challenges are added? → A: The existing `ruleOfThree` is absorbed into Story Challenges as the "Complex Extrapolation" sub-type. Only 3 Pure Numeric types remain (percentage, ratio, fraction).
- Q: How exactly is scoring normalized across different timer durations? → A: Discrete percentage-based tiers: ≥60% remaining → +5, ≥40% → +3, ≥20% → +2, >0% → +1, 0% → 0. Same thresholds for both 20s and 50s timers.
- Q: How are the 5 Story Challenge slots distributed across the 3 sub-types? → A: At least 1 of each sub-type is guaranteed per game (3 fixed). The remaining 2 slots are filled randomly from any sub-type.
- Q: How should Improve mode analyze Story Challenge performance? → A: At the sub-type level. 6 total categories for challenge analysis: percentage, ratio, fraction, multiItemRatio, percentageOfWhole, complexExtrapolation.

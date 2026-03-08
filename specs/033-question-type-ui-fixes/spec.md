# Feature Specification: Question Types & UI Fixes

**Feature Branch**: `033-question-type-ui-fixes`  
**Created**: 2026-03-08  
**Status**: Draft  
**Input**: User description: "Question Types & UI Fixes — Remove Ratio question type, enhance percentageOfWhole with multi-target support, fix shared-link dark mode contrast, remove home page header for mobile readability."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Remove Ratio Question Type (Priority: P1)

A player starts a game (Play, Improve, or Competition mode). The 10-round question set no longer includes any `ratio` questions. The question slots previously occupied by `ratio` questions are filled by the remaining pure numeric types (`percentage` and `fraction`). All game modes, scoring, and progression features continue to work as before — the player simply never encounters a ratio question. Existing game records that contain `ratio` rounds remain stored and displayed correctly.

**Why this priority**: Removing a redundant question type simplifies the game. Ratio questions (A : B = C : D) are functionally identical to fraction questions (A/B = C/D) — both test the same proportional reasoning skill with the same numeric pools. Eliminating the duplicate type reduces player confusion and question generation complexity. This is P1 because it impacts the type system, formula generator, display logic, localization, challenge analysis, and Improve mode — a cross-cutting change that other stories do not depend on but must be resolved first.

**Independent Test**: Start a game in any mode, complete all 10 rounds, and verify no round displays the A : B = C : D ratio format. Verify that Improve mode challenge analysis correctly categorizes historical `ratio` records as `fraction` for backward compatibility.

**Acceptance Scenarios**:

1. **Given** a player starts a Play mode game, **When** all 10 rounds are generated, **Then** none of the rounds have type `ratio`.
2. **Given** a player starts an Improve mode game with historical `ratio` mistakes in their records, **When** the challenge analyzer runs, **Then** those records are treated as `fraction` for tricky-category detection.
3. **Given** a player starts a Competition mode game with a specific seed, **When** all 10 rounds are generated, **Then** none of the rounds have type `ratio`.
4. **Given** a player views a past game summary that included `ratio` rounds, **When** the round details are displayed, **Then** historical `ratio` rounds are rendered using the fraction display format (A/B = C/D).
5. **Given** the formula generator builds the numeric question pool, **When** selecting 5 numeric rounds, **Then** only `percentage` and `fraction` types are chosen.

---

### User Story 2 - Enhanced percentageOfWhole with Multi-Target Support (Priority: P1)

A player encounters a `percentageOfWhole` story challenge during a round. Instead of always asking about the first or second item listed, the question randomly targets one of three options: the first item, the second item, or the sum of the first and second items. The question text and correct answer adjust accordingly. The answer is always a whole integer percentage from the allowed set (10%, 20%, 25%, 50%, 75%).

**Why this priority**: This directly increases question variety and cognitive challenge without adding new question types or UI changes. The `percentageOfWhole` type currently only swaps between the first and second items. Adding a third option (sum of both) meaningfully increases the difficulty spectrum and makes repeat play more engaging.

**Independent Test**: Start multiple games and observe `percentageOfWhole` rounds. Verify that across several games, questions target the first item, the second item, and the combined sum of first and second items. Verify the answer is always a whole integer percentage.

**Acceptance Scenarios**:

1. **Given** a `percentageOfWhole` round is generated, **When** the random function selects "first item," **Then** the question asks for the percentage of the first item relative to the total, and the correct answer is an integer from {10, 20, 25, 50, 75}.
2. **Given** a `percentageOfWhole` round is generated, **When** the random function selects "second item," **Then** the question asks for the percentage of the second item relative to the total, and the correct answer is an integer from {10, 20, 25, 50, 75}.
3. **Given** a `percentageOfWhole` round is generated, **When** the random function selects "sum of first and second items," **Then** the question asks for the percentage of both items combined relative to the total, and the correct answer is an integer from {10, 20, 25, 50, 75}.
4. **Given** a Competition mode game with a specific seed, **When** `percentageOfWhole` rounds are generated, **Then** the target selection is deterministic — the same seed always produces the same target choice.
5. **Given** the numeric values chosen for a round, **When** the selected target option does not produce a valid integer percentage from the allowed set, **Then** the generator selects a different target option or regenerates values until a valid combination is found.
6. **Given** a `percentageOfWhole` round targeting "kittens or puppies" (combined), **When** the question text is displayed, **Then** the template clearly asks about the combined items (e.g., "What percentage of all the animals are the kittens or puppies?").

---

### User Story 3 - Shared-Link Landing Page Dark Mode Fix (Priority: P2)

A player opens a shared Competition result link while their device is set to dark mode. The shared result card — including player name, score, seed, and the "Play this game" button — is fully readable with appropriate contrast. Text is light on a dark background in dark mode and dark on a light background in light mode.

**Why this priority**: This is a bug fix. The shared-link page currently uses hardcoded inline styles (`background: '#f9f9f9'`, `color: '#666'`) that ignore the system's dark mode preference, resulting in white text on a near-white background. The page is effectively unusable in dark mode. It is P2 because it affects only shared-link visitors, a smaller subset of users than the core gameplay changes.

**Independent Test**: Open a valid shared result URL with the system set to dark mode. Verify all text is readable with WCAG AA contrast ratios. Switch to light mode and verify readability is maintained.

**Acceptance Scenarios**:

1. **Given** a user opens a shared result URL in dark mode, **When** the page renders, **Then** all text (player name, score, seed) is displayed with a contrast ratio of at least 4.5:1 against the background.
2. **Given** a user opens a shared result URL in light mode, **When** the page renders, **Then** all text is displayed with a contrast ratio of at least 4.5:1 against the background.
3. **Given** a user opens a shared result URL in dark mode, **When** the result card renders, **Then** the card background is dark-toned (not the current `#f9f9f9`).
4. **Given** a user opens an invalid shared result URL in dark mode, **When** the error message renders, **Then** the error text is readable with proper contrast.
5. **Given** a user opens a shared result URL in dark mode, **When** the "Play this game" button renders, **Then** the button text and background have sufficient contrast.

---

### User Story 4 - Home Page Header Removal for Mobile Readability (Priority: P3)

When a player opens the home page (mode-selection screen), the heading "Ready to play?" and the subtitle "Answer 10 proportion questions as fast as you can!" are no longer displayed. This frees vertical space on mobile devices, pushing the mode-selection buttons and high scores closer to the top of the viewport where they are immediately visible and tappable.

**Why this priority**: This is a UX improvement for mobile. The header text consumes screen real estate without adding information the player needs on return visits. Mode-selection buttons and scores are more actionable. It is P3 because it does not affect functionality — only layout density.

**Independent Test**: Open the home page on a mobile viewport (320px–480px width). Verify neither the "Ready to play?" heading nor the "Answer 10 proportion questions…" subtitle appears. Verify the mode-selection buttons and high scores are visible without scrolling.

**Acceptance Scenarios**:

1. **Given** a player opens the home page on any device, **When** the page renders, **Then** the "Ready to play?" heading is not displayed.
2. **Given** a player opens the home page on any device, **When** the page renders, **Then** the "Answer 10 proportion questions as fast as you can!" subtitle is not displayed.
3. **Given** a player opens the home page on a 320px-wide mobile viewport, **When** the page renders, **Then** the mode-selection buttons are visible without scrolling.

---

### Edge Cases

- What happens to saved game records that contain `ratio` rounds? They remain in storage and are displayed using the `fraction` visual format. The challenge analyzer maps legacy `ratio` entries to `fraction`.
- What if no valid triple exists where the sum of the first and second items produces a friendly percentage? The generator falls back to targeting either the first or second item individually. The pool pre-filters for valid combinations, so at least one target option always produces a valid percentage.
- What happens if the third item count (remainder = total − first − second) is zero or negative? The pool builder enforces `z ≥ 1`, so the third item category always has at least 1 item, ensuring the word problem is logically coherent.
- Does removing `ratio` affect the question count per game? No. The 5 numeric + 5 story split is preserved. Numeric rounds draw from `percentage` and `fraction` only.
- What if a `percentageOfWhole` template's wording doesn't make sense for the "combined" target? Templates must support a "first or second" phrasing variant. Templates that cannot grammatically accommodate this are excluded from combined-target rounds.
- Does the home page header removal affect accessibility (e.g., screen reader landmarks)? The `<h1>` element is removed. The page must still have a programmatically discoverable heading or landmark for screen reader users — the app title in the `<header>` serves this purpose.

## Requirements *(mandatory)*

### Functional Requirements

**Ratio Removal**

- **FR-001**: The `ratio` question type MUST be removed from the set of available question types. No new game rounds may be generated with type `ratio`.
- **FR-002**: The pure numeric question type list MUST contain only `percentage` and `fraction`.
- **FR-003**: The formula generator MUST distribute 5 numeric rounds across `percentage` and `fraction` only (no `ratio`).
- **FR-004**: Historical game records containing `ratio` rounds MUST remain readable. The display layer MUST render legacy `ratio` rounds using the fraction format (A/B = C/D).
- **FR-005**: The challenge analyzer MUST treat legacy `ratio` records as `fraction` when computing tricky categories for Improve mode.
- **FR-006**: The `ratio` label MUST be removed from all locale files and UI label maps.

**percentageOfWhole Enhancement**

- **FR-007**: The `percentageOfWhole` question generator MUST randomly select the question target from three options: (a) the first item count, (b) the second item count, or (c) the sum of the first and second item counts.
- **FR-008**: The selected target MUST always produce an integer percentage from the allowed set {10, 20, 25, 50, 75}.
- **FR-009**: If the randomly selected target option does not produce a valid integer percentage, the generator MUST try the remaining target options before regenerating values.
- **FR-010**: Question templates MUST support a phrasing variant for the combined target (e.g., "{first} or {second}"). Templates that cannot support this variant MUST be excluded from combined-target rounds.
- **FR-011**: Target selection MUST be deterministic when using a seeded random function (Competition mode).
- **FR-012**: The `percentageOfWhole` pool builder MUST include triples where the sum of the first and second items also yields a valid friendly percentage, in addition to the existing single-item pools.

**Shared-Link Dark Mode Fix**

- **FR-013**: The shared-result page MUST use theme-aware styles that respond to `@media (prefers-color-scheme: dark)`, consistent with the rest of the application.
- **FR-014**: All text on the shared-result page MUST meet WCAG 2.1 AA contrast requirements (4.5:1 for normal text, 3:1 for large text) in both light and dark modes.
- **FR-015**: The result card background, text colors, and button styles MUST adapt to the user's system color scheme preference.

**Home Page Header Removal**

- **FR-016**: The home page MUST NOT display the "Ready to play?" heading.
- **FR-017**: The home page MUST NOT display the "Answer 10 proportion questions as fast as you can!" subtitle.
- **FR-018**: The home page MUST still contain a programmatically identifiable heading or landmark accessible to screen readers.

### Key Entities

- **QuestionType**: The union type defining possible question categories. Changes from 6 members (`percentage | ratio | fraction | multiItemRatio | percentageOfWhole | complexExtrapolation`) to 5 members (removes `ratio`).
- **Triple**: Pool entry for `percentageOfWhole` questions — `{ a: targetCount, b: otherCount, c: total }`. Must now support three target interpretations: `a`, `b`, or `a + b`.
- **SharedResult**: The decoded data from a shared Competition URL. Already exists; no structural change — only its display styles are affected.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of games across all modes generate 0 `ratio` rounds.
- **SC-002**: Across a statistically significant sample of generated `percentageOfWhole` rounds (≥ 100), all three target options (first item, second item, combined) appear at least 15% of the time each.
- **SC-003**: The shared-result page meets WCAG 2.1 AA contrast in both light and dark modes, verified by automated axe-core testing.
- **SC-004**: The home page on a 320px mobile viewport does not render the "Ready to play?" or instructional text.
- **SC-005**: All existing game records containing `ratio` rounds display correctly using the fraction format.
- **SC-006**: Improve mode correctly identifies `fraction` as a tricky category when historical records include `ratio` mistakes.

## Assumptions

- The existing question distribution (5 numeric + 5 story per game) is preserved. Removing `ratio` means the 5 numeric slots are filled by `percentage` and `fraction` only.
- The `percentageOfWhole` pool builder already ensures all triples produce at least one valid target with a friendly percentage. The enhancement adds more target options per triple but does not change the pool filtering logic fundamentally.
- The word problem templates for `percentageOfWhole` use placeholder syntax `{a}`, `{b}`, `{c}` for the three displayed quantities. A new variant mechanism is needed for the "combined" target to adjust the question text accordingly.
- The challenge analyzer already has a mapping from legacy `ruleOfThree` → `complexExtrapolation`. The same pattern will be used for `ratio` → `fraction`.
- The shared-result page currently uses inline styles. The fix will replace them with CSS module classes that include dark mode media queries, consistent with how other components (e.g., `ScoreSummary`) handle dark mode.
- Removing the home page heading and subtitle also allows removing the associated i18n keys (`game.readyToPlay`, `game.instructions`) from all locale files, reducing translation burden.

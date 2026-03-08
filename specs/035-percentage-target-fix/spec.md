# Feature Specification: percentageOfWhole — Target Selection Fix

**Feature Branch**: `035-percentage-target-fix`  
**Created**: 2026-03-08  
**Status**: Draft  
**Input**: User description: "Fix percentageOfWhole question type so the generator randomly selects the target among the first item, second item, or the sum of both items — instead of always selecting the first item."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Random Target Selection in Percentage Questions (Priority: P1)

A player starts a game containing `percentageOfWhole` questions. When the word problem is generated (e.g., "A school has 6 science teachers, 4 math teachers, and other staff — 30 staff total"), the question randomly asks about any one of the three valid targets: the first item ("science teachers"), the second item ("math teachers"), or the combined total of both items ("either science or math teachers"). Over multiple rounds, the player sees a mix of all three target types rather than always being asked about the first listed item.

**Why this priority**: This is the core bug — the generator always picks the first item, making percentage questions repetitive and predictable. Fixing this delivers the full intended variety.

**Independent Test**: Generate 30+ `percentageOfWhole` questions and verify that all three target types appear with reasonable frequency (each appearing at least once in 30 questions).

**Acceptance Scenarios**:

1. **Given** a `percentageOfWhole` question is generated with two named items and a total, **When** the generator selects a target, **Then** it randomly chooses one of: the first item, the second item, or the sum of both items.
2. **Given** 30 `percentageOfWhole` questions are generated across multiple games with different seeds, **When** the target selections are tallied, **Then** all three target types (first item, second item, sum) appear at least once.
3. **Given** a word problem where item 1 is 5, item 2 is 3, and total is 20, **When** the "first item" target is selected, **Then** the question asks about the first item and the correct answer is 25%.
4. **Given** the same word problem, **When** the "second item" target is selected, **Then** the question asks about the second item — but 3/20 = 15%, which is not in {10, 20, 25, 50, 75}, so the generator rejects this target and tries another.
5. **Given** a word problem where item 1 is 2, item 2 is 8, and total is 20, **When** the "sum" target is selected, **Then** the question asks about both items combined and the correct answer is 50% (10/20).

---

### User Story 2 - Integer Percentage Constraint Enforcement (Priority: P1)

When the generator picks a target, the resulting percentage must be one of the friendly percentages {10%, 20%, 25%, 50%, 75%} (as required by the game's rules). If a chosen target yields a percentage outside this set, the generator falls back to another valid target or regenerates the counts entirely so the player always sees a friendly-percentage answer.

**Why this priority**: Without this constraint, the fix could produce answers outside the allowed set (e.g., 13%, 37%) that break the game's answer validation. This is tightly coupled with the core fix and must ship together.

**Independent Test**: Generate 100+ questions and verify every answer is one of {10, 20, 25, 50, 75}.

**Acceptance Scenarios**:

1. **Given** a word problem where the first item yields a percentage not in {10, 20, 25, 50, 75}, **When** the generator selects the first item as target, **Then** it discards this choice and tries another valid target or regenerates counts.
2. **Given** all three target options yield percentages outside {10, 20, 25, 50, 75} for a particular set of counts, **When** the generator cannot find a valid target, **Then** it regenerates the counts (following normal generation rules) until a valid combination is found.
3. **Given** any generated `percentageOfWhole` question, **When** the correct answer is calculated, **Then** it is always one of {10, 20, 25, 50, 75}.

---

### User Story 3 - Deterministic Selection in Seeded Games (Priority: P2)

When a game uses a seed for deterministic question generation, the target selection for `percentageOfWhole` questions is also deterministic. Two games with the same seed produce identical target selections every time.

**Why this priority**: Seeded games are used for competitive/shared play. Determinism is essential for fairness but is a secondary concern after the core logic fix.

**Independent Test**: Run the same seeded game twice and verify every `percentageOfWhole` question has the same target and answer both times.

**Acceptance Scenarios**:

1. **Given** a game is started with a specific seed, **When** `percentageOfWhole` questions are generated, **Then** the target selection (first item, second item, or sum) is fully determined by the seed.
2. **Given** two separate game sessions using the same seed, **When** the same question index is reached, **Then** both sessions produce identical questions with the same target, wording, and correct answer.

---

### Edge Cases

- What happens when both individual items yield percentages outside {10, 20, 25, 50, 75} but the sum yields a friendly percentage? The generator must select the sum target.
- What happens when only one of the three targets yields a friendly percentage? The generator must always select that one valid target.
- What happens when none of the three targets yield a friendly percentage? The generator must regenerate counts until at least one valid target exists.
- What happens when either item count is 0? A target with a 0% answer is outside the friendly set and is automatically excluded.
- What happens when the sum of both items equals the total? The sum target would yield 100%, which is outside {10, 20, 25, 50, 75} and is automatically excluded.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The generator MUST randomly select one of three targets for each `percentageOfWhole` question: (a) the first named item, (b) the second named item, or (c) the sum of both named items.
- **FR-002**: The selection MUST NOT always default to the first item; all three options must have an equal chance of being selected (uniform random distribution), subject to the integer-percentage constraint.
- **FR-003**: The resulting percentage (target count ÷ total × 100) MUST be one of the friendly percentages {10, 20, 25, 50, 75} for the selected target.
- **FR-004**: If the initially selected target yields a percentage outside {10, 20, 25, 50, 75}, the generator MUST try the remaining valid targets before falling back to count regeneration.
- **FR-005**: If no target option yields a friendly percentage for the current counts, the generator MUST regenerate counts and retry until a valid combination is found.
- **FR-006**: In seeded games, the target selection MUST be deterministic — the same seed and question index must always produce the same target choice.
- **FR-007**: The question text MUST accurately reflect the selected target: asking about the first item, the second item, or the combination of both items (e.g., "either X or Y").
- **FR-008**: Only targets yielding a percentage in {10, 20, 25, 50, 75} are eligible for selection; all others (including 0% and 100%) MUST be excluded.

### Key Entities

- **Question Target**: The subject of the percentage question — one of "first item", "second item", or "sum of both items". Determines both the question text and the correct answer.
- **Friendly Percentage Constraint**: The rule that the correct answer must be one of {10, 20, 25, 50, 75}, keeping mental math achievable for children.

## Assumptions

- The word problem structure always contains exactly two explicitly named items plus a remainder, with a known total. This three-part structure is assumed to be already established.
- "Friendly percentage" means the result of (count ÷ total × 100) is one of {10, 20, 25, 50, 75}.
- The existing generation pipeline already supports count regeneration when constraints are not met; this fix extends the constraint checking to include target selection.
- The seeded random number generator is already used for other question generation decisions; target selection will use the same seeded generator.
- The "sum" target's question text uses a phrasing like "either X or Y" to clearly communicate that both items are included.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Over a sample of 90+ generated `percentageOfWhole` questions with varying seeds, each of the three target types (first item, second item, sum) appears at least 20% of the time.
- **SC-002**: 100% of generated `percentageOfWhole` questions have a correct answer in {10, 20, 25, 50, 75}.
- **SC-003**: Two game sessions with the same seed produce identical `percentageOfWhole` questions (same target, same wording, same correct answer) 100% of the time.
- **SC-004**: No generated question produces an answer outside the friendly set {10, 20, 25, 50, 75}.

## Clarifications

### Session 2026-03-08

- Q: Should 100% be a valid answer (contradiction between Key Entities and Edge Case 5)? → A: No. The only valid answers are the friendly percentages {10, 20, 25, 50, 75}. Both 0% and 100% are excluded.

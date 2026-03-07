# Feature Specification: Word Problem Variations

**Feature Branch**: `031-word-problem-variations`  
**Created**: 2026-03-07  
**Status**: Draft  
**Input**: User description: "Shuffle elements in multi-item word problems and increase difficulty for cost-based word problems by varying the target item and supporting multi-item combinations."

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Shuffled Element Order in Percentage-of-Whole Problems (Priority: P1)

A player encounters a "percentage of whole" problem such as *"A pet shop has 8 kittens, 5 puppies, and some hamsters — 20 animals in total. What percentage are the kittens?"*. Currently the target item (the one the player must find the percentage for) is always mentioned first in the sentence. With this change, the order of the named elements is randomly shuffled — the target may appear first, second, or implicitly third — forcing the player to read the full problem to identify which element the question asks about.

**Why this priority**: This is the simplest, highest-impact change. Without shuffling, players learn to always multiply the first number and skip reading the rest. Shuffling directly forces comprehension.

**Independent Test**: Generate 100 games and verify that the target element appears in non-first position in at least 30% of percentage-of-whole problems.

**Acceptance Scenarios**:

1. **Given** a percentage-of-whole problem is generated, **When** the player reads it, **Then** the question still asks "What percentage are the [target]?" but the target item may appear in either explicit position (first or second named element). The implicit third group ("some [items]") is never the target.
2. **Given** two percentage-of-whole problems using the same template but different seeds, **When** both are generated, **Then** the element order may differ between them.
3. **Given** a percentage-of-whole problem is generated with a specific seed, **When** the same seed is used again, **Then** the element order is identical (deterministic).
4. **Given** any percentage-of-whole problem, **When** the player calculates the answer, **Then** the correct answer is always one of the allowed friendly percentages (10%, 20%, 25%, 50%, 75%).

---

### User Story 2 — Variable Target Item in Multi-Item Ratio Problems (Priority: P1)

A player encounters a multi-item ratio problem such as *"A toy box has 3 cars ($5 each) and 4 dolls ($10 each). What is the total cost of just the cars?"*. Currently the target is always the first item mentioned. With this change, the target item may be either the first or the second item type, selected randomly per question.

**Why this priority**: Equal priority with US1 — without this, players learn to always compute the first item's total. Varying the target forces careful reading of which item the question asks about.

**Independent Test**: Generate 100 games and verify that the target item is the second-listed item in at least 30% of multi-item ratio problems.

**Acceptance Scenarios**:

1. **Given** a multi-item ratio problem is generated, **When** the player reads it, **Then** the question asks about "just the [target items]" where the target may be either the first or second listed item type.
2. **Given** the target is the second item type, **When** the player calculates the answer, **Then** the correct answer is the count × unit value of the second item (not the first).
3. **Given** a multi-item ratio problem is generated with a specific seed, **When** the same seed is used again, **Then** the same target item is selected (deterministic).

---

### User Story 3 — Combined-Item Questions in Multi-Item Ratio Problems (Priority: P2)

A player encounters a multi-item ratio problem where the question asks for the total cost (or weight, etc.) of **both item types combined**. For example: *"A toy box has 3 cars ($5 each) and 4 dolls ($10 each). What is the total cost of all the toys?"*. This new question variant requires the player to compute both subtotals and add them — a harder operation than computing just one.

**Why this priority**: This increases difficulty and variety but requires new i18n template variants. US1 and US2 should work first since they improve existing problems; this one adds a new problem variant.

**Independent Test**: Generate 100 games and verify that at least some multi-item ratio problems ask for a combined total.

**Acceptance Scenarios**:

1. **Given** a multi-item ratio problem is generated, **When** the variant is "combined", **Then** the question asks for the total of all items (both types), and the correct answer is `(countA × valueA) + (countB × valueB)`.
2. **Given** a combined-item problem, **When** the combined answer exceeds 999, **Then** that combination is not used (answers must stay within the valid range of 1–999).
3. **Given** a combined-item problem is generated with a specific seed, **When** the same seed is used again, **Then** the same variant (single vs. combined) and values are produced (deterministic).
4. **Given** any multi-item ratio problem (single or combined), **When** the problem is displayed, **Then** the wording clearly indicates whether the question asks about one item type or all items together.

---

### Edge Cases

- What happens when a percentage-of-whole template references three explicit elements but the shuffle places the target as the implicit third group? The template structure always has two explicit elements (`{a}` and `{b}`) and one implicit group ("some [items]"). The target is always explicit (`{a}` in the template), which becomes whichever element is placed in the `{a}` slot after shuffling. The implicit group never becomes the target.
- What happens when both items in a multi-item ratio have the same unit value? The pool already excludes same-value pairs (`v1 === v2` check), so this cannot occur.
- What happens when the combined total of both item types exceeds 999? That combination is filtered out during generation — only valid combinations where the answer is 1–999 are used.
- What if `b/total` is not a friendly percentage in a percentage-of-whole problem? The swap only occurs when the alternative percentage is also friendly. If it's not, the target stays in the original position. Over many problems, both positions will still appear.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: For percentage-of-whole word problems, the system MUST randomly assign which of the two explicit element counts (`{a}` or `{b}`) is the target for the percentage question, not always the first.
- **FR-002**: The swap of target position in percentage-of-whole problems MUST only occur when the resulting answer is a valid friendly percentage (10%, 20%, 25%, 50%, or 75%).
- **FR-003**: For multi-item ratio word problems, the system MUST randomly select which item type (first or second listed) is the target, not always the first.
- **FR-004**: When the target item is swapped (either problem type), the correct answer MUST be recalculated to match the new target.
- **FR-005**: The system MUST support a "combined" variant for multi-item ratio problems where the question asks for the total of both item types. The correct answer is the sum of both subtotals: `(countA × valueA) + (countB × valueB)`.
- **FR-006**: Combined-item answers MUST be within the valid answer range (1–999).
- **FR-007**: Combined-item questions MUST use distinct template text that clearly asks about "all items" or "everything", not "just the [item]". Every existing multi-item ratio template MUST have a corresponding combined counterpart with matching narrative context.
- **FR-008**: All randomized choices (element order, target selection, variant selection) MUST be deterministic when using the injectable random function, ensuring competitive mode seed reproducibility.
- **FR-009**: The distribution of problem variants MUST provide meaningful variety — single-first, single-second, and combined variants should all appear across games (no variant should dominate > 60% of occurrences over 50+ games).
- **FR-010**: Combined-item template variants MUST be provided for all 6 supported languages (en, fr, es, ja, de, pt), one for each existing multi-item ratio template.

### Key Entities

- **Problem Variant**: For multi-item ratio problems, one of three types: "single-first" (ask about first item), "single-second" (ask about second item), or "combined" (ask about both items together).
- **Friendly Percentage**: One of the allowed percentage answers: 10, 20, 25, 50, or 75. Used as a constraint for percentage-of-whole problems to ensure answers are always integers from this set.

## Clarifications

### Session 2026-03-07

- Q: Should every existing multi-item ratio template have a combined counterpart, or use a smaller generic set? → A: Every existing template gets a combined counterpart (60+ per language, 360+ total), ensuring the same narrative variety for combined questions as for single-item questions.
- Q: Can the target in a percentage-of-whole problem be the implicit third group ("some [items]")? → A: No. The target is always one of the two explicit elements (`{a}` or `{b}`), never the implicit group.

## Assumptions

- Existing i18n templates for single-item questions remain unchanged. No modifications to template text — the variation is achieved by swapping which values are assigned to `{a}`, `{b}`, `{c}`, `{d}` placeholders.
- New "combined" templates are created as 1:1 counterparts of existing multi-item ratio templates, using a convention like `.combined` suffix. Each combined template reuses the same narrative context (items, setting) but asks about "all" or "everything" instead of "just the [item]".
- The combined variant applies only to multi-item ratio problems, not to percentage-of-whole problems (where the answer is always a percentage, not a sum).
- Scoring, timer durations, and all other game mechanics remain unchanged.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Over 100 generated games, percentage-of-whole problems have the target in non-first position at least 30% of the time.
- **SC-002**: Over 100 generated games, multi-item ratio problems target the second item type at least 30% of the time.
- **SC-003**: Over 100 generated games, the "combined" variant appears in at least 15% of multi-item ratio problems.
- **SC-004**: 100% of generated problems produce a correct answer that is a positive integer within the valid range (friendly percentage for percentage-of-whole; 1–999 for multi-item ratio).
- **SC-005**: Two players using the same seed receive identical problem variants, element orders, and answers — 100% deterministic match.
- **SC-006**: No regressions in existing game modes — Play, Improve, and Competitive all produce valid questions with correct answers.

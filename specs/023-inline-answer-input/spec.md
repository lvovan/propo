# Feature Specification: Inline Answer Input

**Feature Branch**: `023-inline-answer-input`  
**Created**: 2026-02-17  
**Status**: Draft  
**Input**: User description: "When playing a round the current answer textfield is redundant. Typing will now write directly where the missing value is. The ? is still used as a placeholder if no value is entered (either at the beginning of the round, or if the player removes all the digits he previously entered). On the input pad, replace Go with a checkmark (✔️)."

## Clarifications

### Session 2026-02-17

- Q: Should the hidden position display a visual cue (e.g., blinking cursor, pulsing border) to indicate it's the active input target, or is the existing accent-colored background highlight sufficient? → A: Add a slight, slow-pulsing orange border around the hidden slot during input phase. Orange contrasts with the purple accent background.

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

### User Story 1 - Inline Answer Typing in Formula (Priority: P1)

A player starts a new round and sees a multiplication formula such as "3 × 7 = ?" displayed on screen. Instead of a separate answer text field, the "?" placeholder sits directly inside the formula where the hidden value belongs. The player types digits (via physical or on-screen keypad) and the digits replace the "?" in-place within the formula. The player sees their answer form character by character right where the missing value is, keeping their eyes on the formula at all times.

**Why this priority**: This is the core change — removing the separate input field and making the formula itself the answer surface. Without this, the rest of the feature is irrelevant.

**Independent Test**: Can be fully tested by starting a round, typing digits, and verifying they appear inline in the formula where the "?" was. Delivers immediate value by reducing visual clutter and keeping focus on the formula.

**Acceptance Scenarios**:

1. **Given** a round begins with formula "3 × ? = 21", **When** the player has not typed anything, **Then** the hidden position displays "?".
2. **Given** a round begins with formula "? × 7 = 56", **When** the player types "8", **Then** the hidden position displays "8" instead of "?".
3. **Given** a round begins with formula "4 × 5 = ?", **When** the player types "20", **Then** the hidden position displays "20".
4. **Given** the player has typed "1" in the hidden position, **When** the player types "2", **Then** the hidden position displays "12".
5. **Given** the formula is displayed during input phase, **Then** no separate answer text field or answer display area is visible.

---

### User Story 2 - Placeholder Restoration on Clear (Priority: P2)

A player who has partially entered an answer decides to clear it. When all digits are removed (via backspace), the hidden position reverts to showing "?" so the player always has a clear visual indicator that no answer has been entered yet.

**Why this priority**: Without proper placeholder restoration, an empty answer slot would appear blank, leaving the player confused about whether the system is accepting input.

**Independent Test**: Can be tested by typing digits, then pressing backspace until all are removed, and verifying the "?" placeholder reappears.

**Acceptance Scenarios**:

1. **Given** the player has typed "12" in the hidden position, **When** the player presses backspace twice, **Then** the hidden position displays "?" again.
2. **Given** the player has typed "5" in the hidden position, **When** the player presses backspace once, **Then** the hidden position displays "?".
3. **Given** a new round starts, **When** the previous round's feedback phase ends, **Then** the hidden position for the new formula displays "?".

---

### User Story 3 - Checkmark Submit Button on Touch Keypad (Priority: P2)

A player using the touch-screen keypad sees a checkmark symbol (✔️) instead of the word "Go" on the submit button. Tapping the checkmark submits the current answer exactly as the old "Go" button did.

**Why this priority**: This is a straightforward cosmetic improvement that complements the inline input change and makes the keypad more universally understandable (no localization needed for an icon).

**Independent Test**: Can be tested on a touch device by verifying the submit button displays a checkmark and that tapping it submits the answer.

**Acceptance Scenarios**:

1. **Given** the touch keypad is visible during input phase, **Then** the submit button displays a checkmark (✔️) instead of "Go".
2. **Given** the player has typed an answer and taps the checkmark button, **Then** the answer is submitted and the feedback phase begins.
3. **Given** the player has not typed any digits, **When** they tap the checkmark button, **Then** no answer is submitted (button is inert or disabled).

---

### User Story 4 - Desktop Keyboard Answer Submission (Priority: P1)

A player using a physical keyboard types digits and they appear inline in the formula. Pressing Enter submits the answer. There is no visible text input field — the formula itself is the only place where the answer is displayed.

**Why this priority**: Desktop is a primary input mode. Without this, desktop users would have no way to enter answers after the separate text field is removed.

**Independent Test**: Can be tested by starting a round on desktop, typing digits on the keyboard, verifying they appear in the formula, and pressing Enter to submit.

**Acceptance Scenarios**:

1. **Given** a round is in input phase on desktop, **When** the player types digit keys, **Then** the digits appear inline in the formula's hidden position.
2. **Given** the player has typed an answer on desktop, **When** they press Enter, **Then** the answer is submitted.
3. **Given** a round is in input phase on desktop, **When** the player presses Backspace, **Then** the last digit is removed from the inline answer.
4. **Given** a round is in input phase on desktop, **When** the player types non-digit keys (letters, symbols), **Then** those keys are ignored and the inline answer is unchanged.

---

### Edge Cases

- What happens when the player types more than 3 digits? The system should enforce a maximum of 3 digits (consistent with the current maximum product of 144 for 12 × 12).
- What happens when the player types "0" as the first digit? Leading zeros should not be allowed (a single "0" is valid, but "07" is not).
- What happens during the feedback phase? The inline answer becomes read-only and shows the player's submitted answer; no further digit input is accepted until the next round.
- What happens if the player submits with no digits entered (answer is still "?")? The submission is blocked — no answer is registered.
- What happens with the separate answer text field on desktop after this change? It is completely removed; digits entered via physical keyboard appear directly in the formula display.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST display the player's typed digits directly in the formula at the hidden value position, replacing the "?" placeholder.
- **FR-002**: The system MUST display "?" as the placeholder at the hidden position when no digits have been entered (start of round or after all digits are deleted).
- **FR-003**: The system MUST NOT display a separate answer text field or answer display area during gameplay.
- **FR-004**: The system MUST accept digit input from the physical keyboard and display it inline in the formula (desktop mode).
- **FR-005**: The system MUST accept digit input from the on-screen touch keypad and display it inline in the formula (touch mode).
- **FR-006**: The system MUST allow the player to delete the last entered digit using backspace (physical keyboard or on-screen backspace button).
- **FR-007**: The system MUST restore the "?" placeholder when all entered digits are removed via backspace.
- **FR-008**: The system MUST enforce a maximum of 3 digits for the answer.
- **FR-009**: The system MUST NOT allow leading zeros (e.g., "07" is invalid; a lone "0" is acceptable).
- **FR-010**: The system MUST submit the answer when the player presses Enter (desktop) or taps the checkmark button (touch).
- **FR-011**: The system MUST NOT allow submission when no digits have been entered.
- **FR-012**: The system MUST display a checkmark symbol (✔️) on the touch keypad submit button instead of the localized "Go" text.
- **FR-013**: The system MUST ignore non-digit key presses during the input phase (letters, symbols, etc.).
- **FR-014**: The system MUST stop accepting input during the feedback phase and display the submitted answer in the formula.
- **FR-015**: The system MUST reset the inline answer to "?" when a new round begins.
- **FR-016**: The system MUST display a slow-pulsing orange border around the hidden position during the input phase to indicate it is the active input target.
- **FR-017**: The pulsing border MUST stop when the feedback phase begins or when input is no longer accepted.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Players can complete a full 10-round game using inline answer input with no separate text field visible at any point during gameplay.
- **SC-002**: The time from keypress to digit appearing in the formula is imperceptible to the player (under 100ms perceived latency).
- **SC-003**: 100% of digit inputs (keyboard and touch) appear at the correct position within the formula display.
- **SC-004**: The "?" placeholder is visible at round start and after clearing all digits in 100% of rounds.
- **SC-005**: The checkmark button on the touch keypad is universally recognizable without localization.
- **SC-006**: Players familiar with the previous interface can complete a round without instructions or confusion.

## Assumptions

- The hidden position retains its existing purple accent background. A slow-pulsing orange border is added during the input phase as a visual cue; the border stops pulsing (and is hidden) during the feedback phase.
- The formula layout (e.g., "A × B = C") is unaffected; only the content of the hidden slot changes.
- The feedback phase behavior (showing correct/incorrect indication) remains unchanged.
- The touch keypad layout (4×3 grid) remains unchanged except for the "Go" → "✔️" label swap.
- The 3-digit maximum and leading-zero restriction already exist in the current touch keypad logic and will be preserved for both input modes.
- The submit button on the desktop answer input is removed along with the text field; Enter key is the sole desktop submission method.

# Feature Specification: Round Result in Status Panel

**Feature Branch**: `010-round-result-panel`  
**Created**: 2026-02-16  
**Status**: Draft  
**Input**: User description: "UI optimization: Use the panel where the round number/score/time is displayed to also display the round result ('Correct!', 'Not quite!'). This works because when the result is displayed the round number/score/time information is not needed or useful, and also lessens eye strain (quick UI popups are not comfortable). The messages 'Correct!', 'Not quite!' should also display the number of rounds completed, including the round that just ended."

## User Scenarios & Testing

### User Story 1 – Feedback Displayed in Status Panel (Priority: P1)

After a player submits an answer during a game round, the status panel (which normally shows round number, score, and countdown timer) transforms to display the round result. For a correct answer, the panel shows "Correct!" with a success visual treatment. For an incorrect answer, the panel shows "Not quite!" with an error visual treatment. In both cases, the panel also displays the number of rounds completed so far (including the round that just ended), e.g., "Round 3 of 10 completed". The round/score/timer content is hidden during this feedback period because it is stale and not useful. After the feedback duration ends, the panel reverts to showing the standard round/score/timer content for the next round.

**Why this priority**: This is the core of the feature — moving feedback into the status panel reduces eye movement and eliminates the need for a separate inline banner, directly addressing the eye strain concern. It delivers the full user value independently.

**Independent Test**: Start a game and submit an answer. Verify that the status panel content changes from round/score/timer to the feedback message with round completion count. After the feedback period (~1.2 seconds), verify the panel returns to showing round/score/timer for the next round.

**Acceptance Scenarios**:

1. **Given** a round is in progress and the status panel shows round number, score, and countdown timer, **When** the player submits a correct answer, **Then** the status panel content is replaced with "Correct!" and the round completion count (e.g., "Round 3 of 10 completed").
2. **Given** a round is in progress and the status panel shows round number, score, and countdown timer, **When** the player submits an incorrect answer, **Then** the status panel content is replaced with "Not quite!" and the round completion count (e.g., "Round 3 of 10 completed").
3. **Given** the status panel is showing feedback, **When** the feedback duration elapses (~1.2 seconds), **Then** the status panel reverts to showing the standard round number, score, and countdown timer for the next round.
4. **Given** the player just answered the last primary round (round 10 of 10), **When** feedback is displayed, **Then** the panel shows "Round 10 of 10 completed" alongside the correct/incorrect message.

---

### User Story 2 – Feedback in Status Panel During Replay Rounds (Priority: P2)

During replay rounds (when previously incorrect formulas are re-presented), the same feedback-in-panel behavior applies. After the player submits an answer in a replay round, the status panel transforms to show the result. Since replay rounds do not have a fixed total, the completion count reflects how many replay rounds have been completed out of the total replay queue.

**Why this priority**: Replay rounds are a secondary flow. The same panel transformation behavior is reused; this story ensures consistent behavior across all game phases.

**Independent Test**: Deliberately answer some questions incorrectly to trigger replay rounds. During replay, submit an answer and verify the status panel shows the feedback message with the replay round completion count.

**Acceptance Scenarios**:

1. **Given** a replay round is in progress, **When** the player submits an answer, **Then** the status panel shows "Correct!" or "Not quite!" along with the replay round completion count.
2. **Given** the player is in replay mode, **When** feedback is displayed in the status panel, **Then** the feedback visual treatment (colors, icons) is identical to the primary round feedback.

---

### User Story 3 – Reduced Eye Movement and Comfortable Reading (Priority: P2)

The player's gaze stays fixed in one consistent area of the screen — the status panel at the top of the gameplay area — for both game progress information and round feedback. The player no longer needs to shift focus between the status panel and a separate feedback element elsewhere on the screen. This reduces eye strain, especially during rapid multi-round sessions where quick popup-style feedback can be uncomfortable.

**Why this priority**: This is the ergonomic benefit that motivates the entire feature. While the behavior is delivered by Story 1, this story captures the explicit UX goal and its verification.

**Independent Test**: Play a full 10-round game and observe that feedback always appears in the same screen location as the round/score/timer information. Confirm there are no additional popup-style feedback elements appearing in other areas during the feedback phase.

**Acceptance Scenarios**:

1. **Given** the player is playing a game, **When** round results are shown, **Then** the feedback message appears exclusively within the status panel area — no separate banners, popups, or overlays appear elsewhere on screen.
2. **Given** the player plays 10 consecutive rounds, **When** observing the feedback display location, **Then** every feedback message appears in the same fixed screen position (the status panel).

---

### Edge Cases

- What happens on the very first round (round 1 of 10)? The panel shows "Round 1 of 10 completed" — confirming that the count includes the just-completed round.
- What happens when the player reaches the last round and answers correctly (no replay needed)? The panel shows "Round 10 of 10 completed" with "Correct!" before transitioning to the score summary.
- What happens during a replay round where the player answers incorrectly again? The panel shows "Not quite!" with the replay completion count. The failed round is re-appended to the replay queue, and the total may increase.
- What happens if reduced-motion preferences are enabled? The panel content swap happens instantly without transition animations, but the feedback is still shown for the same duration.
- What happens on very narrow viewports? The feedback message and completion count should remain readable within the status panel's width, reflowing if necessary.
- What happens with screen readers? The feedback message in the status panel must be announced by the live region, maintaining the existing accessibility behavior of the current inline feedback.

## Requirements

### Functional Requirements

#### Status Panel Content Swap

- **FR-001**: During the feedback phase (after answer submission), the status panel MUST replace its standard content (round number, score, countdown timer, and countdown bar) with the round result message.
- **FR-002**: For a correct answer, the status panel MUST display a success indicator (checkmark icon) and the text "Correct!".
- **FR-003**: For an incorrect answer, the status panel MUST display an error indicator (✗ icon) and the text "Not quite!" followed by the correct answer (e.g., "The answer was 42").
- **FR-004**: The feedback display in the status panel MUST include the number of rounds completed so far including the current round (e.g., "Round 3 of 10 completed").
- **FR-005**: During replay mode, the round completion count MUST reflect the replay round position (e.g., "Replay 2 of 4 completed").
- **FR-006**: The status panel MUST revert to its standard content (round number, score, countdown timer) when the feedback phase ends and the next round begins.
- **FR-007**: The countdown bar MUST be hidden during the feedback phase since the timer is stopped and the bar position is stale.

#### Visual Treatment

- **FR-008**: The correct-answer feedback in the status panel MUST use a green-toned visual treatment: the entire panel background changes to a green tone (consistent with the existing success styling) along with the success icon and text.
- **FR-009**: The incorrect-answer feedback in the status panel MUST use a red-toned visual treatment: the entire panel background changes to a red tone (consistent with the existing error styling) along with the error icon and text.
- **FR-010**: The status panel MUST maintain the same outer dimensions and position during feedback as during normal display to prevent layout shift.
- **FR-011**: The content swap between normal display and feedback MUST be visually smooth — a brief crossfade or instant swap — unless reduced-motion preferences are enabled, in which case it MUST be an instant swap.

#### Inline Feedback Removal

- **FR-012**: The existing inline feedback banner (which currently replaces the formula display area during the feedback phase) MUST be removed.
- **FR-013**: During the feedback phase, the formula display area MUST continue to show the just-answered formula with the player's submitted answer filled in (e.g., "7 × 6 = 38") so the player can see what they answered while the result is shown in the status panel above.

#### Accessibility

- **FR-014**: The feedback message in the status panel MUST be announced to screen readers via an appropriate live region (`role="status"` with `aria-live="assertive"`).
- **FR-015**: The feedback MUST use at least two non-color indicators (icon + text) to communicate the result, conforming to WCAG 1.4.1.

### Key Entities

- **Status Panel**: The horizontal bar at the top of the gameplay area. During the input phase it shows round number, score, and countdown timer. During the feedback phase it shows the round result and completion count.
- **Round Completion Count**: A textual indicator showing how many rounds have been completed out of the total (e.g., "Round 3 of 10 completed" or "Replay 2 of 4 completed").
- **Feedback Phase**: The ~1.2-second period after answer submission during which the result is displayed. Controlled by the existing game state phase value (`input` vs `feedback`).

## Success Criteria

### Measurable Outcomes

- **SC-001**: After answer submission, the status panel displays the round result within 100ms — no perceptible delay.
- **SC-002**: During the feedback phase, the round/score/timer content is not visible — only the feedback message and completion count are displayed.
- **SC-003**: The feedback message remains visible for the standard feedback duration (~1.2 seconds) before the panel reverts to normal content.
- **SC-004**: 100% of feedback messages appear in the same fixed screen location (the status panel), with no separate popups or banners elsewhere.
- **SC-005**: The round completion count is accurate for every round, including edge cases (first round, last round, replay rounds).
- **SC-006**: Screen reader users hear the feedback result announced after each answer submission.
- **SC-007**: No layout shift (content below the status panel does not move) when the panel swaps between normal and feedback content.

## Clarifications

### Session 2026-02-16

- Q: What should the formula area display during the ~1.2s feedback phase after the inline feedback banner is removed? → A: Show the answered formula with the player's submitted answer filled in (e.g., "7 × 6 = 38").
- Q: Should the entire status panel background change color during feedback, or only the text/icon? → A: Full panel background changes to green (correct) or red (incorrect) toned color.

## Assumptions

- **Feedback duration unchanged**: The existing ~1.2-second feedback display duration remains the same. This feature only changes where the feedback is displayed, not how long.
- **Existing game state is sufficient**: The current `currentPhase` state (`input` vs `feedback`) already cleanly separates the two display modes. No new game states are needed.
- **Inline feedback component replaced**: The current `InlineFeedback` component that replaces the `FormulaDisplay` during feedback will be removed. The formula area will instead continue showing the answered formula with the player's submitted answer filled in (e.g., "7 × 6 = 38").
- **Countdown bar hidden during feedback**: Since the timer is stopped during feedback, hiding the countdown bar avoids showing stale/confusing progress information.
- **Score not shown during feedback**: The score display is hidden during feedback because the score update for the current round may not yet be reflected, and showing a potentially stale score would be confusing.
- **Same visual styling reused**: The green/red color treatments, icons (✓ / ✗), and accessibility patterns from the existing inline feedback are reused in the status panel — just relocated.
- **Replay round count is dynamic**: During replay, the total number of replay rounds can change if the player answers incorrectly again (the round gets re-appended). The completion count uses the current queue length as the total at the time of display.

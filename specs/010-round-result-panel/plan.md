# Implementation Plan: Round Result in Status Panel

**Branch**: `010-round-result-panel` | **Date**: 2026-02-16 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/010-round-result-panel/spec.md`

## Summary

Move round result feedback ("Correct!" / "Not quite!") from the inline banner in the formula area into the GameStatus panel. During the ~1.2s feedback phase, the status panel swaps its round/score/timer content for the result message with a round completion count (e.g., "Round 3 of 10 completed") and a full-panel background color change (green/red). The existing InlineFeedback component is removed; the formula area instead continues showing the answered formula with the player's submitted answer. The GameStatus component gains a conditional feedback rendering mode driven by the existing `currentPhase` state.

## Technical Context

**Language/Version**: TypeScript 5.x / React 18
**Primary Dependencies**: React, Vite, CSS Modules
**Storage**: N/A (no persistence changes)
**Testing**: Vitest + React Testing Library + axe-core
**Target Platform**: Browser (static SPA) - Chrome, Firefox, Safari, Edge (latest 2 versions) + Chromebooks
**Project Type**: Single frontend SPA
**Performance Goals**: Feedback visible within 100ms of submission; no layout shift; Lighthouse Performance >= 90
**Constraints**: WCAG 2.1 AA; mobile-first responsive (320px-1920px); reduced-motion support
**Scale/Scope**: Single GameStatus component change + FormulaDisplay enhancement + InlineFeedback removal

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Accessibility First | PASS | FR-014/FR-015 require live region + dual non-color indicators (icon + text). Existing a11y patterns relocated, not removed. |
| II. Simplicity & Clarity | PASS | Reduces complexity: removes InlineFeedback component, consolidates feedback into existing GameStatus. No new abstractions. |
| III. Responsive Design | PASS | GameStatus already has responsive CSS (480px breakpoint). Feedback content reflows within the same container. |
| IV. Static SPA | PASS | Pure client-side UI change. No server, no new dependencies. |
| V. Test-First | PASS | Existing GameStatus and InlineFeedback tests will be updated/replaced. axe-core accessibility tests required. |

**Gate result: PASS** - No violations. Proceed to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/010-round-result-panel/
+-- plan.md              # This file
+-- research.md          # Phase 0 output
+-- data-model.md        # Phase 1 output
+-- quickstart.md        # Phase 1 output
+-- contracts/           # Phase 1 output
+-- tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
frontend/
+-- src/
|   +-- components/
|   |   +-- GamePlay/
|   |       +-- GameStatus/
|   |       |   +-- GameStatus.tsx          # MODIFY - add feedback mode rendering
|   |       |   +-- GameStatus.module.css   # MODIFY - add feedback styling
|   |       +-- FormulaDisplay/
|   |       |   +-- FormulaDisplay.tsx      # MODIFY - add playerAnswer prop
|   |       +-- InlineFeedback/
|   |       |   +-- InlineFeedback.tsx      # DELETE
|   |       |   +-- InlineFeedback.module.css # DELETE
|   |       +-- CountdownBar/
|   |           +-- CountdownBar.tsx        # NO CHANGE (hidden via parent)
|   +-- pages/
|       +-- MainPage.tsx                    # MODIFY - pass feedback props, remove InlineFeedback
+-- tests/
    +-- components/
        +-- GameStatus.test.tsx             # MODIFY - add feedback mode tests
        +-- FormulaDisplay.test.tsx         # MODIFY - add playerAnswer tests
        +-- InlineFeedback.test.tsx         # DELETE
```

**Structure Decision**: Single `frontend/` directory - pure React SPA. All changes are within existing component directories. One component removed (InlineFeedback), two modified (GameStatus, FormulaDisplay), one orchestrator updated (MainPage).

## Complexity Tracking

> No constitution violations - this section is empty.

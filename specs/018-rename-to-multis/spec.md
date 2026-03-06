# Feature Specification: Rename Game to Propo

> **Note**: This spec originally documented the rename from "Turbotiply" to "Multis". It has been updated to reflect the subsequent rename to "Propo" (March 2026). Storage keys now use the `propo_` prefix. The brand name is "Propo!".

**Feature Branch**: `018-rename-to-propo`  
**Created**: 2026-02-17  
**Updated**: 2026-03-07  
**Status**: Completed  
**Input**: User description: "Change the name of the game to Propo. Update UI (name remains the same regardless of the currently selected language), specs and internal code accordingly."

## Clarifications

### Session 2026-02-17

- Q: How should the brand name be displayed in the UI (browser tab, welcome heading) — with or without exclamation mark? → A: "Propo!" (with exclamation mark, matching current "Turbotiply!" pattern)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Brand Name Appears as "Propo" in UI (Priority: P1)

A player opens the application in any supported language (English, French, Spanish, Japanese, German, Portuguese). The browser tab reads "Propo!" and the welcome screen heading displays "Propo!" — identical text regardless of the selected language.

**Why this priority**: The brand rename is the core deliverable. If only one thing ships, users must see the new name everywhere in the UI.

**Independent Test**: Open the app, verify the browser tab title is "Propo!" and the welcome page heading reads "Propo!". Switch languages and confirm the name does not change.

**Acceptance Scenarios**:

1. **Given** a player navigates to the application, **When** the page loads, **Then** the browser tab title displays "Propo!"
2. **Given** a player is on the welcome screen (new-player form view), **When** the page renders, **Then** the heading reads "Propo!"
3. **Given** a player is on the welcome screen (player-list view), **When** the page renders, **Then** the heading reads "Propo!"
4. **Given** a player switches the language to any supported locale, **When** the welcome screen re-renders, **Then** the heading still reads "Propo!" (unchanged)

---

### User Story 2 - Existing Player Data Preserved After Rename (Priority: P1)

A returning player who has previously saved profiles and game history opens the updated application. All their existing player data, scores, and session state are still available — nothing is lost due to the rename.

**Why this priority**: Losing user data during a cosmetic rename would be a critical regression. Data continuity is non-negotiable.

**Independent Test**: Pre-populate browser storage with existing player data under the current keys, then open the renamed application and verify all data loads correctly.

**Acceptance Scenarios**:

1. **Given** a player has existing saved data under the old storage keys, **When** they open the updated application for the first time, **Then** all player profiles, scores, and session data are available
2. **Given** a player has no prior data (fresh install), **When** they create a profile in the updated application, **Then** data is stored under the new naming convention
3. **Given** a player's data has been migrated, **When** they open the application again, **Then** data loads normally without re-migration

---

### User Story 3 - Internal References Updated for Consistency (Priority: P2)

A developer working on the codebase sees consistent naming throughout source code, comments, documentation, and configuration — all references reflect "Propo" rather than the old name.

**Why this priority**: Internal consistency reduces confusion for contributors and prevents divergence between the brand and the codebase. Less critical than user-facing changes but important for long-term maintainability.

**Independent Test**: Search the entire repository for the old name; no occurrences should remain in source code, comments, or developer documentation (spec history may retain the old name for historical accuracy).

**Acceptance Scenarios**:

1. **Given** a developer searches the frontend source code for "Turbotiply", **When** the search completes, **Then** zero results are found (excluding historical spec documents)
2. **Given** a developer searches configuration and documentation files for "Turbotiply", **When** the search completes, **Then** zero results are found in active configuration (copilot-instructions.md, constitution.md)
3. **Given** a developer reviews localStorage/sessionStorage key constants, **When** they inspect the code, **Then** all keys use the "propo_" prefix

---

### Edge Cases

- What happens when a user has data stored under old keys (`turbotiply_players`, `turbotiply_session`, `turbotiply_lang`) and the app now uses new keys? The application must check for old keys, migrate the data to new keys, and remove the old keys.
- What happens if migration is interrupted (e.g., browser closes mid-migration)? The migration must be idempotent — safe to re-run. Old keys should only be removed after new keys are confirmed written.
- What happens if both old and new keys exist (e.g., partial migration)? New keys take precedence; old keys are cleaned up.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The browser tab title MUST display "Propo!" on all pages
- **FR-002**: The welcome screen heading MUST display "Propo!" in both the new-player form view and the player-list view
- **FR-003**: The brand name "Propo" MUST NOT be translated — it MUST remain identical across all supported languages (English, French, Spanish, Japanese, German, Portuguese)
- **FR-004**: All localStorage keys MUST be renamed from the `turbotiply_` prefix to the `propo_` prefix:
  - `turbotiply_players` → `propo_players`
  - `turbotiply_lang` → `propo_lang`
- **FR-005**: The sessionStorage key MUST be renamed: `turbotiply_session` → `propo_session`
- **FR-006**: The application MUST perform a one-time data migration on startup: detect data under old keys, copy it to new keys, and remove old keys
- **FR-007**: The migration MUST be idempotent — running it multiple times produces the same result without data loss
- **FR-008**: All source code comments, JSDoc annotations, and internal test-key strings referencing the old name MUST be updated to use "Propo" or "Propo"
- **FR-009**: Developer-facing configuration files (copilot-instructions.md, constitution.md) MUST be updated to reference the new name
- **FR-010**: All test files that hardcode storage key strings MUST be updated to use the new key names

### Key Entities

- **Player Profile**: Stored in localStorage; key changes from `turbotiply_players` to `propo_players`. Data structure remains unchanged.
- **Game Session**: Stored in sessionStorage; key changes from `turbotiply_session` to `propo_session`. Data structure remains unchanged.
- **Language Preference**: Stored in localStorage; key changes from `turbotiply_lang` to `propo_lang`. Value remains unchanged.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of user-visible occurrences of the old name display "Propo" instead
- **SC-002**: The brand name remains "Propo!" in the UI when any of the 6 supported languages is selected
- **SC-003**: Returning users with existing data experience zero data loss after the update — all profiles, scores, and preferences are preserved
- **SC-004**: A full-text search of the active codebase (excluding historical spec files in `specs/002` through `specs/017`) returns zero matches for the old name
- **SC-005**: All existing automated tests pass after the rename with updated assertions

## Assumptions

- The brand name "Propo" includes an exclamation mark ("Propo!") in display contexts, matching the existing pattern of "Turbotiply!"
- The data structures stored in localStorage and sessionStorage remain identical — only the key names change
- Historical spec documents (specs/002 through specs/017) may retain the old name for historical accuracy and do not need to be updated
- The repository name and GitHub-related infrastructure (branch naming, workflow files, Azure resource names) are out of scope for this feature
- No logo or favicon changes are required (the app currently uses the default Vite logo)
- The storage migration runs synchronously at app startup before any data access occurs

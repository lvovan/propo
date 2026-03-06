# Implementation Plan: Rename Game to Propo

**Branch**: `018-rename-to-propo` | **Date**: 2026-02-17 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/018-rename-to-propo/spec.md`

## Summary

Rename the game from "Turbotiply" to "Propo" across all user-facing UI, internal storage keys, source code references, tests, and developer documentation. Includes a one-time idempotent migration of browser storage keys so returning users retain their data. The brand name "Propo!" (with exclamation mark) is language-invariant and not subject to i18n translation.

## Technical Context

**Language/Version**: TypeScript ~5.9, React 19  
**Primary Dependencies**: React, React Router, Vite 7, Vitest 4  
**Storage**: Browser localStorage (`propo_players`, `propo_lang`) and sessionStorage (`propo_session`)  
**Testing**: Vitest + React Testing Library + vitest-axe  
**Target Platform**: Static SPA — any static hosting (Azure Static Web Apps)  
**Project Type**: Single frontend SPA (no backend)  
**Performance Goals**: Lighthouse Performance ≥ 90 on mobile; migration adds negligible overhead (synchronous key copy)  
**Constraints**: No PII collection; WCAG 2.1 AA; mobile-first (320px–1920px)  
**Scale/Scope**: ~30 files affected; rename is purely textual — no behavioral or structural changes beyond storage key migration

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Accessibility First | PASS | No UI changes beyond text replacement; no new interactive elements. Existing WCAG compliance unaffected. |
| II. Simplicity & Clarity | PASS | Feature is a straightforward rename with a small migration utility. No new abstractions, layers, or patterns introduced. YAGNI satisfied. |
| III. Responsive Design | PASS | No layout changes. Text replacement preserves existing responsive behavior. |
| IV. Static SPA | PASS | No server-side code introduced. All changes are within `frontend/` directory. |
| V. Test-First | PASS | Tests for storage migration must be written before implementation. Existing tests updated to match new key names. |

**Gate result: ALL PASS — proceed to Phase 0.**

## Project Structure

### Documentation (this feature)

```text
specs/018-rename-to-propo/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
frontend/
├── index.html                          # <title> tag: "Propo!"
├── src/
│   ├── main.tsx                        # App entry — migration runs here
│   ├── pages/
│   │   └── WelcomePage.tsx             # Brand heading: "Propo!"
│   ├── services/
│   │   ├── playerStorage.ts            # STORAGE_KEY: 'propo_players'
│   │   ├── sessionManager.ts           # SESSION_KEY: 'propo_session'
│   │   └── storageMigration.ts         # NEW: one-time key migration utility
│   ├── i18n/
│   │   └── LanguageContext.tsx          # STORAGE_KEY: 'propo_lang'
│   └── types/
│       └── player.ts                   # JSDoc comment update
└── tests/
    ├── services/
    │   └── storageMigration.test.ts    # NEW: migration tests
    ├── integration/
    │   ├── gameplayFlow.test.tsx        # Key string updates
    │   ├── improveMode.test.tsx         # Key string updates
    │   ├── scoreDisplayFlow.test.tsx    # Key string updates
    │   └── sessionLifecycle.test.tsx    # Key string updates
    ├── hooks/
    │   └── useSession.test.tsx          # Key string updates
    ├── components/
    │   └── Header.test.tsx             # Key string updates
    └── pages/
        └── MainPage.test.tsx           # Key string updates
```

**Structure Decision**: Single `frontend/` SPA structure (matches constitution IV. Static SPA). No new directories beyond the existing layout. One new file (`storageMigration.ts`) and its test added under existing `services/` and `tests/services/` paths.

## Complexity Tracking

> No constitution violations — this section intentionally left empty.

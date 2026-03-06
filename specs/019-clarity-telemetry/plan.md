# Implementation Plan: Microsoft Clarity Telemetry

**Branch**: `019-clarity-telemetry` | **Date**: 2026-02-17 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/019-clarity-telemetry/spec.md`

## Summary

Integrate Microsoft Clarity anonymous telemetry into the Turbotiply React SPA. Clarity is initialized at app startup in cookie-less mode with full text masking. A thin telemetry service module exposes functions for custom events (`game_started`, `answer_submitted`, `game_completed`, `replay_started`, `replay_completed`) and session tags (`language`, `player_type`, `game_mode`). The service wraps the `microsoft-clarity` npm package, guards against missing env config, and is wired into existing hooks/components at the `useGame` consumer layer and language/session providers.

## Technical Context

**Language/Version**: TypeScript 5.9, React 19.2  
**Primary Dependencies**: `microsoft-clarity` (npm package), Vite 7.3  
**Storage**: N/A (telemetry is fire-and-forget to external service)  
**Testing**: Vitest 4, React Testing Library (verify no errors when Clarity unavailable, mock service calls)  
**Target Platform**: Browser SPA (static hosting via Azure Static Web Apps)  
**Project Type**: Web (single `frontend/` directory)  
**Performance Goals**: Clarity init adds <100ms to page load (async, non-blocking)  
**Constraints**: Cookie-less mode (`cookies: false`), full text masking (`mask-text-content`), no PII transmission, must not break app when blocked  
**Scale/Scope**: ~10 custom events per game session, 3 session tags, 1 new service module, 1 env variable

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Assessment |
|-----------|--------|------------|
| I. Accessibility First | PASS | No UI changes. Telemetry is invisible to users — no consent dialogs, no banners, no visual elements added. No WCAG impact. |
| II. Simplicity & Clarity | PASS | Single service module with thin wrapper functions. No new abstractions, no provider nesting. YAGNI: only events/tags specified in spec, nothing more. |
| III. Responsive Design | PASS | No UI changes. No layout impact. |
| IV. Static SPA | PASS | Clarity npm package is bundled client-side. No server-side code. Config via Vite build-time env var. Deployable to any static host. |
| V. Test-First | PASS | Tests will verify: (1) app works when Clarity unavailable, (2) service functions are called with correct arguments, (3) no initialization in test environment. axe-core tests unaffected (no UI changes). |
| Child Safety | PASS | Cookie-less mode, text masking, no PII. Aligns with COPPA/GDPR-K requirements in constitution. |
| Performance | PASS | Async non-blocking init. <100ms budget. Lighthouse score unaffected. |

**Gate result**: ALL PASS — no violations. Proceeding to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/019-clarity-telemetry/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── services/
│   │   └── clarityService.ts     # NEW: Clarity init + event/tag wrapper functions
│   ├── main.tsx                  # MODIFIED: call clarityService.init() at startup
│   ├── hooks/
│   │   └── useGame.ts            # MODIFIED: fire telemetry events on game actions
│   ├── i18n/
│   │   └── LanguageContext.tsx    # MODIFIED: set language tag on change
│   ├── hooks/
│   │   └── useSession.tsx        # MODIFIED: set player_type tag on session start
│   └── pages/
│       └── MainPage.tsx          # MODIFIED: fire events at game state transitions
├── tests/
│   ├── services/
│   │   └── clarityService.test.ts  # NEW: unit tests for service
│   └── integration/
│       └── telemetry.test.ts       # NEW: integration test for event flow
└── .env.example                  # NEW: VITE_CLARITY_PROJECT_ID placeholder
```

**Structure Decision**: Single `frontend/` directory (existing). One new service file. No new providers or context layers — follows constitution Principle II (simplicity). Telemetry calls are added directly at hook/component call sites.

## Complexity Tracking

No constitution violations. No complexity justifications needed.

## Post-Design Constitution Re-check

*Re-evaluated after Phase 1 design completion.*

| Principle | Status | Post-Design Assessment |
|-----------|--------|------------------------|
| I. Accessibility First | PASS | No UI elements added. Telemetry is invisible. No WCAG impact confirmed. |
| II. Simplicity & Clarity | PASS | Single service module (clarityService.ts) with typed helper functions. No new context providers, no new hooks, no abstraction layers. Event metadata encoded as flat strings — simplest possible approach given Clarity API constraints. |
| III. Responsive Design | PASS | No layout changes. No touch targets affected. |
| IV. Static SPA | PASS | `microsoft-clarity` npm package (~1-2 KB) bundled client-side. Tracking script loads async from CDN. Config via `VITE_CLARITY_PROJECT_ID` env var. No server-side code. |
| V. Test-First | PASS | Test plan: unit tests for service module (mock Clarity SDK), integration test for graceful degradation. Tests naturally isolated because `VITE_CLARITY_PROJECT_ID` is absent in test env. |
| Child Safety | PASS | Cookie-less mode (dashboard setting), Strict text masking (dashboard setting), no PII in events/tags. Three layers of protection. |
| Performance | PASS | npm package is ~1-2 KB. CDN script loads async. All telemetry calls are fire-and-forget. No blocking operations. |

**Post-design gate result**: ALL PASS — design is constitution-compliant.

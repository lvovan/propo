<!--
  Sync Impact Report
  ===================
  Version change: 1.1.0 → 2.0.0 (MAJOR — removes backend architecture)
  Modified principles:
    - IV. Monolith Simplicity → IV. Static SPA
        Removed all FastAPI/backend/Azure Web App references.
        The application is a pure React single-page application
        served as static files. No server-side code exists.
    - V. Test-First (unchanged name)
        Removed pytest and API contract test references. All
        tests use Vitest and React Testing Library. Added
        mandatory axe-core accessibility tests.
  Modified sections:
    - Technology Stack & Constraints:
        Removed Backend (Python 3.11+, FastAPI) entirely.
        Removed Azure Web App + FastAPI static-serving deployment.
        Added deployment as static site (any static host).
        Removed `/api` prefix references.
    - Development Workflow:
        Removed Python linting/formatting tools (Ruff, Black).
        CI Pipeline now references ESLint, Prettier, and
        TypeScript type-checking only.
  Added sections: None
  Removed sections: None
  Templates requiring updates:
    - .specify/templates/plan-template.md ✅ no updates needed
        Template already offers single-project and web-app
        structure options. Plan authors select the appropriate
        layout (single `frontend/` directory).
    - .specify/templates/spec-template.md ✅ no updates needed
    - .specify/templates/tasks-template.md ✅ no updates needed
        Template already notes "adjust based on plan.md
        structure". Task authors use `frontend/` paths only.
    - .specify/templates/checklist-template.md ✅ no updates needed
  Follow-up TODOs:
    - Remove `backend/` directory from the repository.
    - Update existing spec/plan docs that reference FastAPI or
      backend architecture.

  Previous Sync Impact Reports
  ----------------------------
  v1.1.0 (2026-02-14): Technology Stack & Constraints updated.
    Database bullet replaced with Browser Storage bullet.
    No server-side persistence; all data lives in browser
    storage and is device-dependent.
  v1.0.0 (2026-02-14): Initial ratification. 5 principles,
    Technology Stack & Constraints, Development Workflow,
    Governance sections added.
-->

# Propo Constitution

## Core Principles

### I. Accessibility First (NON-NEGOTIABLE)

- Every UI element MUST meet WCAG 2.1 AA compliance at minimum.
- Text MUST use large, readable fonts (minimum 16 px base) with
  high-contrast color combinations.
- All interactive elements MUST be operable via keyboard, touch,
  and assistive technologies (screen readers, switch controls).
- Language MUST be age-appropriate for primary school children
  (ages 6–12): short sentences, simple vocabulary, no jargon.
- Visual feedback (color, icons, animation) MUST never be the
  sole indicator of state; always pair with text or ARIA labels.
- Rationale: The target audience includes young children and
  preteens who may have varying reading levels, motor skills,
  or disabilities. Accessibility is not optional.

### II. Simplicity & Clarity

- Every feature MUST be immediately understandable by a child
  without written instructions.
- UI MUST minimize cognitive load: one primary action per screen,
  clear visual hierarchy, no cluttered layouts.
- YAGNI applies strictly — do not build features, abstractions,
  or layers that are not required by a current user story.
- Code MUST favor readability over cleverness; prefer explicit
  patterns over implicit magic.
- Rationale: Complexity alienates young users and increases
  maintenance burden. Simplicity is the primary design constraint.

### III. Responsive Design

- All pages and components MUST render correctly on viewports
  from 320 px (phone) to 1920 px (desktop).
- Touch targets MUST be at least 44×44 CSS pixels per WCAG 2.5.5.
- Layout MUST use a mobile-first approach: design for the
  smallest screen first, then progressively enhance for larger
  viewports.
- No horizontal scrolling on any supported viewport width.
- Rationale: Children access the app on a mix of phones, tablets,
  and classroom PCs. Every device MUST deliver a usable experience.

### IV. Static SPA

- The application MUST be a pure client-side React single-page
  application. There is no backend server.
- The production build MUST consist entirely of static assets
  (HTML, CSS, JS, images) deployable to any static hosting
  provider (e.g., Azure Static Web Apps, GitHub Pages, Vercel,
  Netlify, or a simple CDN).
- No server-side rendering (SSR), no server-side API, no BFF
  unless a constitutional amendment explicitly justifies it.
- The repository MUST contain a single `frontend/` top-level
  directory for all application source code.
- Rationale: A static SPA eliminates server-side operational
  complexity and keeps the project approachable for a small
  team. All logic runs in the browser.

### V. Test-First

- Every new feature MUST have acceptance tests derived from
  user-story scenarios before implementation begins.
- Tests use Vitest and React Testing Library.
- Tests MUST be written to fail first (red), then implementation
  makes them pass (green), then refactor.
- Accessibility tests using axe-core MUST be included for every
  screen and interactive component.
- Rationale: Tests protect young users from regressions and
  provide living documentation of expected behavior.

## Technology Stack & Constraints

- **Frontend**: React (with TypeScript), bundled via Vite.
- **Deployment**: Static site. The Vite production build outputs
  static files to `frontend/dist/` which can be served by any
  static hosting provider. No server-side runtime is required.
- **Persistence**: All user data (scores, player names,
  preferences, progress) MUST be stored in browser storage
  (localStorage or IndexedDB). There is no server-side database.
  Data is inherently device-dependent — users MUST be informed
  that their data does not sync across devices.
- **Styling**: MUST use a system that supports responsive utility
  classes or CSS modules; avoid heavy CSS-in-JS runtimes.
- **Child Safety**: No personally identifiable information (PII)
  may be collected from users under 13 without explicit guardian
  consent (COPPA / GDPR-K compliance). Prefer anonymous usage
  wherever possible.
- **Performance**: Pages MUST achieve a Lighthouse Performance
  score ≥ 90 on mobile. Time-to-interactive MUST be under 3
  seconds on a 3G connection.
- **Browser Support**: Latest two major versions of Chrome,
  Firefox, Safari, and Edge. Must function on school-managed
  Chromebooks.

## Development Workflow

- **Branching**: Feature branches off `main`; merge via pull
  request only.
- **Code Review**: Every pull request MUST be reviewed for
  constitution compliance before merge.
- **CI Pipeline**: Pull requests MUST pass linting (ESLint),
  formatting (Prettier), TypeScript type-checking (`tsc`), and
  the full test suite before merge is permitted.
- **Commit Messages**: Follow Conventional Commits format
  (`feat:`, `fix:`, `docs:`, `chore:`, etc.).
- **Quality Gates**:
  1. All tests green.
  2. No linting or type-check errors.
  3. Accessibility audit passes (axe-core or Lighthouse a11y ≥ 90).
  4. Responsive spot-check on 320 px and 1280 px viewports.

## Governance

- This constitution supersedes all other development practices
  and documentation when conflicts arise.
- Amendments MUST be proposed as a pull request modifying this
  file, reviewed by at least one maintainer, and merged before
  taking effect.
- Every amendment MUST include a version bump (semver), an
  updated Sync Impact Report, and a migration plan if existing
  code is affected.
- All pull requests and code reviews MUST verify compliance with
  the principles above. Non-compliance MUST be resolved or
  explicitly justified with a recorded exception before merge.
- Complexity beyond what is prescribed here MUST be justified
  in the relevant plan or spec document.

**Version**: 2.0.0 | **Ratified**: 2026-02-14 | **Last Amended**: 2026-02-14

# Research: Rename Game to Propo

**Feature**: 018-rename-to-propo  
**Date**: 2026-02-17

## 1. Storage Key Migration Strategy

**Decision**: Create a dedicated `storageMigration.ts` service, called synchronously from `main.tsx` before `createRoot().render()`.

**Rationale**: 
- `main.tsx` runs exactly once and before any React component mounts, eliminating race conditions with `LanguageProvider`, `SessionProvider`, or any component that reads storage.
- The existing codebase has *no* pre-render initialization pattern — `main.tsx` is currently minimal (just `createRoot` + `render`). Adding a single synchronous call is the lightest possible change.
- The existing lazy migration system in `playerStorage.ts` (`readStore()` v1→v5) handles *data format* migrations within a single key. Key renaming is a cross-cutting concern that spans multiple storage domains and belongs in a separate module.

**Alternatives considered**:
- **Lazy migration inside each service module** (playerStorage, sessionManager, LanguageContext): Rejected — would require coordinating three separate modules and risks partial migration if only some modules are accessed in a session.
- **Migration in `App.tsx` or a React context**: Rejected — `App` re-renders and React effects are asynchronous, creating a window where components could read old keys.

## 2. Migration Algorithm

**Decision**: Read-copy-delete with new-key-takes-precedence semantics.

**Rationale**:
- For each key pair (old → new): if the new key already exists, skip (data already migrated). If only the old key exists, copy its value to the new key, then remove the old key.
- This is idempotent: running it multiple times has no effect after the first successful run.
- If the browser closes between the copy and the delete, the next run will see the new key exists and skip — no data loss.

**Alternatives considered**:
- **Rename in place** (remove old, write new in one step): Rejected — no atomic rename API exists for Web Storage; a crash between remove and write would lose data.
- **Keep both keys indefinitely**: Rejected — creates confusion and wastes storage; old keys should be cleaned up.

## 3. Key Constant Export Pattern

**Decision**: Export the language storage key from `LanguageContext.tsx` (as `LANG_STORAGE_KEY`) so the migration module can import it. Keep `playerStorage.STORAGE_KEY` and `sessionManager.SESSION_KEY` imports as-is.

**Rationale**:
- `playerStorage.ts` and `sessionManager.ts` already export their key constants. `LanguageContext.tsx` does not (it's a module-private `const`). Exporting it maintains consistency across all three modules.
- The migration module should not hardcode key strings — it should import them from the authoritative source to avoid drift.

**Alternatives considered**:
- **Hardcode all old/new key strings in the migration module**: Rejected — the old keys are throwaway (used only once), but the new keys should reference the same constants used by the rest of the app.
- **Create a central `storageKeys.ts` barrel file**: Rejected — adds an abstraction layer not justified by YAGNI; three imports are sufficient.

## 4. Brand Name Display

**Decision**: Hardcode "Propo!" as a literal string in JSX (same pattern as current "Turbotiply!"). Do not add it to i18n dictionaries.

**Rationale**:
- The existing codebase intentionally keeps the brand name out of i18n (per historical design decision A-004). The brand is language-invariant by design.
- The `<title>` tag in `index.html` is static HTML, not rendered by React — it must be changed directly.
- Two `<h1>` elements in `WelcomePage.tsx` use hardcoded strings — simple find-and-replace.

**Alternatives considered**:
- **Add brand name to i18n with identical values across all locales**: Rejected — adds maintenance burden (6 locale files to keep in sync) for zero functional benefit, and contradicts the existing design decision.

## 5. Scope of Internal Code Changes

**Decision**: Update all source code, comments, JSDoc, test keys, and developer docs. Leave historical specs (002–017) unchanged.

**Rationale**:
- Active source code must be consistent to avoid developer confusion.
- Historical specs are reference documents — changing them would obscure the project's evolution.
- Developer docs (`copilot-instructions.md`, `constitution.md`) are actively consulted and must reflect current naming.

**Alternatives considered**:
- **Update everything including historical specs**: Rejected — ~60 occurrences across ~20 files with no functional benefit; risks introducing errors in documentation that is no longer actively used.
- **Leave developer docs unchanged**: Rejected — `copilot-instructions.md` drives AI coding assistance and must be accurate.

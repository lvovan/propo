# Quickstart: Rename Game to Propo

**Feature**: 018-rename-to-propo  
**Date**: 2026-02-17

## What This Feature Does

Renames the game from "Turbotiply" to "Propo" across the entire application — UI, storage keys, source code, tests, and developer docs. Includes automatic data migration so returning players keep all their profiles and scores.

## Key Files to Know

| File | Role |
|------|------|
| `frontend/index.html` | Browser tab title |
| `frontend/src/pages/WelcomePage.tsx` | Brand name headings |
| `frontend/src/services/playerStorage.ts` | Player data storage key |
| `frontend/src/services/sessionManager.ts` | Session storage key |
| `frontend/src/i18n/LanguageContext.tsx` | Language preference key |
| `frontend/src/services/storageMigration.ts` | **NEW** — one-time key migration |
| `frontend/src/main.tsx` | App entry point — calls migration |

## How It Works

1. User opens the app
2. `main.tsx` calls `migrateStorageKeys()` synchronously before React renders
3. Migration checks for old `turbotiply_*` and `multis_*` keys, copies data to new `propo_*` keys, removes old keys
4. React app renders with brand name "Propo!" everywhere
5. All storage reads/writes use new key names going forward

## Testing

```bash
cd frontend
npm test
```

Key test files:
- `tests/services/storageMigration.test.ts` — migration logic (new)
- Existing test files updated with new key strings

## Implementation Order

1. Create `storageMigration.ts` + tests (TDD)
2. Update storage key constants in source modules
3. Update test files with new key strings
4. Update UI text (index.html, WelcomePage.tsx)
5. Wire migration into `main.tsx`
6. Update developer docs (constitution, copilot-instructions)
7. Run full test suite to verify

# Storage Migration Contract

**Feature**: 018-rename-to-propo  
**Date**: 2026-02-17

## Module: `storageMigration.ts`

### Purpose

Provides a one-time, synchronous, idempotent migration of browser storage keys from legacy prefixes (`turbotiply_`, `multis_`) to the new `propo_` prefix. Called once at application startup before React mounts.

### Public API

#### `migrateStorageKeys(): void`

Migrates all known storage keys from old names to new names.

**Behavior**:
- For each key pair (old → new):
  1. If new key already has a value → skip (already migrated or fresh data)
  2. If old key has a value → read it, write to new key, remove old key
  3. If neither key exists → skip
- Covers both `localStorage` and `sessionStorage` as appropriate
- Synchronous — completes before returning
- Idempotent — safe to call multiple times
- Silent on errors — catches exceptions to prevent app crash (storage may be unavailable in private browsing)

**Key Mappings**:

| Old Key | New Key | Storage |
|---------|---------|---------|
| `turbotiply_players` | `propo_players` | localStorage |
| `turbotiply_lang` | `propo_lang` | localStorage |
| `turbotiply_session` | `propo_session` | sessionStorage |

**Call Site**: `main.tsx`, before `createRoot().render()`

```typescript
// main.tsx usage
import { migrateStorageKeys } from './services/storageMigration'

migrateStorageKeys()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

### Error Handling

- If `localStorage` or `sessionStorage` is unavailable (e.g., Safari private mode quota exceeded), the migration silently skips. The existing `isStorageAvailable()` pattern in `playerStorage.ts` already handles this downstream — users without storage get a fresh (empty) experience.

### Testing Contract

Tests must verify:
1. **Old keys migrated** — data under old keys appears under new keys after migration
2. **Old keys removed** — old keys no longer exist after migration
3. **Idempotent** — running migration twice produces same result
4. **New keys preserved** — if new keys already exist, they are not overwritten
5. **Mixed state** — if both old and new keys exist, new keys take precedence, old keys removed
6. **Empty storage** — migration on fresh storage produces no side effects
7. **Storage unavailable** — migration does not throw when storage is unavailable

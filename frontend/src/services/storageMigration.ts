/**
 * One-time storage key migration from legacy prefixes to `propo_*`.
 *
 * Handles both the original `turbotiply_*` keys and the intermediate `multis_*` keys.
 * Called synchronously from `main.tsx` before React mounts.
 * Idempotent and silent on errors.
 */

/** Old → new key mappings. Includes both legacy prefixes. */
const LOCAL_STORAGE_KEYS: ReadonlyArray<[oldKey: string, newKey: string]> = [
  ['turbotiply_players', 'propo_players'],
  ['turbotiply_lang', 'propo_lang'],
  ['multis_players', 'propo_players'],
  ['multis_lang', 'propo_lang'],
];

const SESSION_STORAGE_KEYS: ReadonlyArray<[oldKey: string, newKey: string]> = [
  ['turbotiply_session', 'propo_session'],
  ['multis_session', 'propo_session'],
];

/**
 * Migrate a single key from `oldKey` to `newKey` within the given storage.
 * If `newKey` already exists the old value is discarded (new-key-takes-precedence).
 */
function migrateKey(storage: Storage, oldKey: string, newKey: string): void {
  const oldValue = storage.getItem(oldKey);
  if (oldValue === null) return;

  if (storage.getItem(newKey) === null) {
    storage.setItem(newKey, oldValue);
  }
  storage.removeItem(oldKey);
}

/**
 * Migrate all known browser storage keys from legacy prefixes to
 * the new `propo_` prefix. Safe to call multiple times — idempotent and
 * silent on errors.
 */
export function migrateStorageKeys(): void {
  try {
    for (const [oldKey, newKey] of LOCAL_STORAGE_KEYS) {
      migrateKey(localStorage, oldKey, newKey);
    }
    for (const [oldKey, newKey] of SESSION_STORAGE_KEYS) {
      migrateKey(sessionStorage, oldKey, newKey);
    }
  } catch {
    // Storage unavailable (e.g. Safari private mode) — skip silently.
  }
}

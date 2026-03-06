import { describe, it, expect, beforeEach } from 'vitest';
import { migrateStorageKeys } from '../../src/services/storageMigration';

describe('migrateStorageKeys', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('migrates old localStorage keys to new keys', () => {
    localStorage.setItem('turbotiply_players', '{"version":5,"players":[]}');
    localStorage.setItem('turbotiply_lang', 'fr');

    migrateStorageKeys();

    expect(localStorage.getItem('propo_players')).toBe('{"version":5,"players":[]}');
    expect(localStorage.getItem('propo_lang')).toBe('fr');
  });

  it('migrates old sessionStorage key to new key', () => {
    sessionStorage.setItem('turbotiply_session', '{"playerName":"Alice","avatarId":"cat","startedAt":1000}');

    migrateStorageKeys();

    expect(sessionStorage.getItem('propo_session')).toBe(
      '{"playerName":"Alice","avatarId":"cat","startedAt":1000}',
    );
  });

  it('removes old keys after migration', () => {
    localStorage.setItem('turbotiply_players', '{"version":5,"players":[]}');
    localStorage.setItem('turbotiply_lang', 'de');
    sessionStorage.setItem('turbotiply_session', '{"playerName":"Bob","avatarId":"rocket","startedAt":2000}');

    migrateStorageKeys();

    expect(localStorage.getItem('turbotiply_players')).toBeNull();
    expect(localStorage.getItem('turbotiply_lang')).toBeNull();
    expect(sessionStorage.getItem('turbotiply_session')).toBeNull();
  });

  it('is idempotent — running twice produces the same result', () => {
    localStorage.setItem('turbotiply_players', '{"version":5,"players":[{"name":"Eve"}]}');
    localStorage.setItem('turbotiply_lang', 'ja');

    migrateStorageKeys();
    migrateStorageKeys();

    expect(localStorage.getItem('propo_players')).toBe('{"version":5,"players":[{"name":"Eve"}]}');
    expect(localStorage.getItem('propo_lang')).toBe('ja');
    expect(localStorage.getItem('turbotiply_players')).toBeNull();
    expect(localStorage.getItem('turbotiply_lang')).toBeNull();
  });

  it('does not overwrite existing new keys', () => {
    localStorage.setItem('turbotiply_players', '{"version":5,"players":[{"name":"Old"}]}');
    localStorage.setItem('propo_players', '{"version":5,"players":[{"name":"New"}]}');

    migrateStorageKeys();

    expect(localStorage.getItem('propo_players')).toBe('{"version":5,"players":[{"name":"New"}]}');
  });

  it('handles mixed state — new keys preserved, old keys cleaned up', () => {
    localStorage.setItem('turbotiply_players', '{"version":5,"players":[{"name":"Old"}]}');
    localStorage.setItem('propo_players', '{"version":5,"players":[{"name":"New"}]}');
    localStorage.setItem('turbotiply_lang', 'es');
    localStorage.setItem('propo_lang', 'pt');
    sessionStorage.setItem('turbotiply_session', '{"playerName":"Old"}');
    sessionStorage.setItem('propo_session', '{"playerName":"New"}');

    migrateStorageKeys();

    // New keys preserved
    expect(localStorage.getItem('propo_players')).toBe('{"version":5,"players":[{"name":"New"}]}');
    expect(localStorage.getItem('propo_lang')).toBe('pt');
    expect(sessionStorage.getItem('propo_session')).toBe('{"playerName":"New"}');
    // Old keys removed
    expect(localStorage.getItem('turbotiply_players')).toBeNull();
    expect(localStorage.getItem('turbotiply_lang')).toBeNull();
    expect(sessionStorage.getItem('turbotiply_session')).toBeNull();
  });

  it('does nothing on fresh storage — no side effects', () => {
    migrateStorageKeys();

    expect(localStorage.length).toBe(0);
    expect(sessionStorage.length).toBe(0);
  });

  it('does not throw when storage is unavailable', () => {
    // Mock localStorage to throw
    const originalGetItem = localStorage.getItem;
    const originalSetItem = localStorage.setItem;
    localStorage.getItem = () => { throw new DOMException('SecurityError'); };
    localStorage.setItem = () => { throw new DOMException('SecurityError'); };

    expect(() => migrateStorageKeys()).not.toThrow();

    // Restore
    localStorage.getItem = originalGetItem;
    localStorage.setItem = originalSetItem;
  });
});

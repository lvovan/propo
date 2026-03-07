import { describe, it, expect } from 'vitest';
import { encodeShareUrl, decodeShareUrl, type SharedResult } from '../../src/services/shareUrl';

describe('shareUrl', () => {
  const result: SharedResult = {
    seed: 'abc123',
    playerName: 'Alice',
    score: 45,
    totalTimeMs: 29600,
  };

  describe('encodeShareUrl', () => {
    it('encodes all fields in the URL', () => {
      const url = encodeShareUrl(result);
      expect(url).toContain('#/result?');
      expect(url).toContain('seed=abc123');
      expect(url).toContain('player=Alice');
      expect(url).toContain('score=45');
      expect(url).toContain('time=29600');
    });
  });

  describe('decodeShareUrl', () => {
    it('decodes valid hash params', () => {
      const hash = '#/result?seed=abc123&player=Alice&score=45&time=29600';
      const decoded = decodeShareUrl(hash);
      expect(decoded).toEqual(result);
    });

    it('returns null for missing params', () => {
      expect(decodeShareUrl('#/result?seed=abc')).toBeNull();
      expect(decodeShareUrl('#/result')).toBeNull();
      expect(decodeShareUrl('')).toBeNull();
    });

    it('returns null for invalid score', () => {
      expect(decodeShareUrl('#/result?seed=abc&player=A&score=NaN&time=1000')).toBeNull();
    });

    it('returns null for invalid time', () => {
      expect(decodeShareUrl('#/result?seed=abc&player=A&score=10&time=abc')).toBeNull();
    });

    it('handles special characters in seed and player name', () => {
      const hash = '#/result?seed=caf%C3%A9&player=L%C3%A9a&score=50&time=10000';
      const decoded = decodeShareUrl(hash);
      expect(decoded).not.toBeNull();
      expect(decoded!.seed).toBe('café');
      expect(decoded!.playerName).toBe('Léa');
    });
  });

  describe('round-trip', () => {
    it('encode then decode preserves data', () => {
      const url = encodeShareUrl(result);
      const hash = '#' + url.split('#')[1];
      const decoded = decodeShareUrl(hash);
      expect(decoded).toEqual(result);
    });

    it('round-trips special characters', () => {
      const special: SharedResult = {
        seed: 'hello world!',
        playerName: 'Léa',
        score: 30,
        totalTimeMs: 50000,
      };
      const url = encodeShareUrl(special);
      const hash = '#' + url.split('#')[1];
      const decoded = decodeShareUrl(hash);
      expect(decoded).toEqual(special);
    });
  });
});

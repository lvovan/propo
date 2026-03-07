import { describe, it, expect } from 'vitest';
import { encodeShareUrl, decodeShareUrl, type SharedResult } from '../../src/services/shareUrl';

describe('shareUrl', () => {
  const result: SharedResult = {
    seed: 'abc123',
    playerName: 'Alice',
    score: 45,
  };

  describe('encodeShareUrl', () => {
    it('encodes all fields in the URL', () => {
      const url = encodeShareUrl(result);
      expect(url).toContain('#/result?');
      expect(url).toContain('seed=abc123');
      expect(url).toContain('player=Alice');
      expect(url).toContain('score=45');
    });

    it('does not include time parameter', () => {
      const url = encodeShareUrl(result);
      expect(url).not.toContain('time=');
    });

    it('encodes negative scores', () => {
      const url = encodeShareUrl({ ...result, score: -15 });
      expect(url).toContain('score=-15');
    });
  });

  describe('decodeShareUrl', () => {
    it('decodes valid hash params', () => {
      const hash = '#/result?seed=abc123&player=Alice&score=45';
      const decoded = decodeShareUrl(hash);
      expect(decoded).toEqual(result);
    });

    it('returns null for missing params', () => {
      expect(decodeShareUrl('#/result?seed=abc')).toBeNull();
      expect(decodeShareUrl('#/result')).toBeNull();
      expect(decodeShareUrl('')).toBeNull();
    });

    it('returns null for invalid score', () => {
      expect(decodeShareUrl('#/result?seed=abc&player=A&score=NaN')).toBeNull();
    });

    it('handles special characters in seed and player name', () => {
      const hash = '#/result?seed=caf%C3%A9&player=L%C3%A9a&score=50';
      const decoded = decodeShareUrl(hash);
      expect(decoded).not.toBeNull();
      expect(decoded!.seed).toBe('café');
      expect(decoded!.playerName).toBe('Léa');
    });

    it('decodes negative scores', () => {
      const hash = '#/result?seed=abc&player=Bob&score=-30';
      const decoded = decodeShareUrl(hash);
      expect(decoded).not.toBeNull();
      expect(decoded!.score).toBe(-30);
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
      };
      const url = encodeShareUrl(special);
      const hash = '#' + url.split('#')[1];
      const decoded = decodeShareUrl(hash);
      expect(decoded).toEqual(special);
    });

    it('round-trips negative scores', () => {
      const neg: SharedResult = {
        seed: 'test',
        playerName: 'Test',
        score: -100,
      };
      const url = encodeShareUrl(neg);
      const hash = '#' + url.split('#')[1];
      const decoded = decodeShareUrl(hash);
      expect(decoded).toEqual(neg);
    });
  });
});

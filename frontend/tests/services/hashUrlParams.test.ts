import { describe, it, expect, afterEach } from 'vitest';
import { getHashSearchParams, getHashParam } from '../../src/services/hashUrlParams';

describe('hashUrlParams', () => {
  afterEach(() => {
    // Reset hash after each test
    window.location.hash = '';
  });

  describe('getHashSearchParams', () => {
    it('parses seed from hash URL', () => {
      window.location.hash = '#/play?seed=abc123';
      const params = getHashSearchParams();
      expect(params.get('seed')).toBe('abc123');
    });

    it('returns empty params when no query string', () => {
      window.location.hash = '#/play';
      const params = getHashSearchParams();
      expect(params.get('seed')).toBeNull();
    });

    it('handles multiple parameters', () => {
      window.location.hash = '#/result?seed=abc&player=Alice&score=45';
      const params = getHashSearchParams();
      expect(params.get('seed')).toBe('abc');
      expect(params.get('player')).toBe('Alice');
      expect(params.get('score')).toBe('45');
    });

    it('handles URL-encoded values', () => {
      window.location.hash = '#/play?seed=hello%20world';
      const params = getHashSearchParams();
      expect(params.get('seed')).toBe('hello world');
    });

    it('returns empty params when hash is empty', () => {
      window.location.hash = '';
      const params = getHashSearchParams();
      expect(params.get('seed')).toBeNull();
    });
  });

  describe('getHashParam', () => {
    it('returns parameter value', () => {
      window.location.hash = '#/play?seed=abc123';
      expect(getHashParam('seed')).toBe('abc123');
    });

    it('returns null for missing parameter', () => {
      window.location.hash = '#/play?seed=abc123';
      expect(getHashParam('other')).toBeNull();
    });

    it('returns null when no hash', () => {
      window.location.hash = '';
      expect(getHashParam('seed')).toBeNull();
    });
  });
});

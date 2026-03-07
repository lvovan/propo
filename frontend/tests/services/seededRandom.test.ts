import { describe, it, expect } from 'vitest';
import { hashSeed, createSeededRandom, createSeededRandomFromString } from '../../src/services/seededRandom';

describe('seededRandom', () => {
  describe('hashSeed', () => {
    it('returns a positive integer', () => {
      const hash = hashSeed('test');
      expect(hash).toBeGreaterThanOrEqual(0);
      expect(Number.isInteger(hash)).toBe(true);
    });

    it('returns same hash for same input', () => {
      expect(hashSeed('abc123')).toBe(hashSeed('abc123'));
    });

    it('returns different hashes for different inputs', () => {
      expect(hashSeed('abc123')).not.toBe(hashSeed('xyz789'));
    });
  });

  describe('createSeededRandom', () => {
    it('produces values in [0, 1) range', () => {
      const rng = createSeededRandom(42);
      for (let i = 0; i < 100; i++) {
        const val = rng();
        expect(val).toBeGreaterThanOrEqual(0);
        expect(val).toBeLessThan(1);
      }
    });

    it('produces deterministic sequence for same seed', () => {
      const rng1 = createSeededRandom(42);
      const rng2 = createSeededRandom(42);
      for (let i = 0; i < 20; i++) {
        expect(rng1()).toBe(rng2());
      }
    });

    it('produces different sequences for different seeds', () => {
      const rng1 = createSeededRandom(42);
      const rng2 = createSeededRandom(99);
      const seq1 = Array.from({ length: 5 }, () => rng1());
      const seq2 = Array.from({ length: 5 }, () => rng2());
      expect(seq1).not.toEqual(seq2);
    });
  });

  describe('createSeededRandomFromString', () => {
    it('produces deterministic sequence for same string seed', () => {
      const rng1 = createSeededRandomFromString('abc123');
      const rng2 = createSeededRandomFromString('abc123');
      for (let i = 0; i < 20; i++) {
        expect(rng1()).toBe(rng2());
      }
    });

    it('produces different sequences for different string seeds', () => {
      const rng1 = createSeededRandomFromString('abc123');
      const rng2 = createSeededRandomFromString('xyz789');
      const seq1 = Array.from({ length: 5 }, () => rng1());
      const seq2 = Array.from({ length: 5 }, () => rng2());
      expect(seq1).not.toEqual(seq2);
    });

    it('handles unicode seed strings', () => {
      const rng1 = createSeededRandomFromString('café☕');
      const rng2 = createSeededRandomFromString('café☕');
      for (let i = 0; i < 10; i++) {
        expect(rng1()).toBe(rng2());
      }
    });
  });
});

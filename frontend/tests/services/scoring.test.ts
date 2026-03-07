import { describe, it, expect } from 'vitest';
import {
  calculateCompetitiveScore,
  COMPETITIVE_MAX_POINTS,
  COMPETITIVE_MIN_POINTS,
} from '../../src/constants/scoring';

describe('calculateCompetitiveScore', () => {
  const NUMERIC_TIMER = 20_000;
  const STORY_TIMER = 50_000;

  describe('correct answers', () => {
    it('awards 10 points for instant answer', () => {
      expect(calculateCompetitiveScore(true, 0, NUMERIC_TIMER)).toBe(10);
    });

    it('awards 5 points at half-time (numeric)', () => {
      expect(calculateCompetitiveScore(true, 10_000, NUMERIC_TIMER)).toBe(5);
    });

    it('awards 5 points at half-time (story)', () => {
      expect(calculateCompetitiveScore(true, 25_000, STORY_TIMER)).toBe(5);
    });

    it('awards 1 point near expiry', () => {
      expect(calculateCompetitiveScore(true, 19_500, NUMERIC_TIMER)).toBe(1);
    });

    it('awards 1 point at exact expiry', () => {
      expect(calculateCompetitiveScore(true, NUMERIC_TIMER, NUMERIC_TIMER)).toBe(1);
    });

    it('awards 1 point after expiry (clamped)', () => {
      expect(calculateCompetitiveScore(true, 25_000, NUMERIC_TIMER)).toBe(1);
    });
  });

  describe('incorrect answers', () => {
    it('deducts 10 points for instant wrong answer', () => {
      expect(calculateCompetitiveScore(false, 0, NUMERIC_TIMER)).toBe(-10);
    });

    it('deducts 5 points at half-time (numeric)', () => {
      expect(calculateCompetitiveScore(false, 10_000, NUMERIC_TIMER)).toBe(-5);
    });

    it('deducts 5 points at half-time (story)', () => {
      expect(calculateCompetitiveScore(false, 25_000, STORY_TIMER)).toBe(-5);
    });

    it('deducts 1 point near expiry', () => {
      expect(calculateCompetitiveScore(false, 19_500, NUMERIC_TIMER)).toBe(-1);
    });

    it('deducts 1 point at exact expiry', () => {
      expect(calculateCompetitiveScore(false, NUMERIC_TIMER, NUMERIC_TIMER)).toBe(-1);
    });

    it('deducts 1 point after expiry (clamped)', () => {
      expect(calculateCompetitiveScore(false, 25_000, NUMERIC_TIMER)).toBe(-1);
    });
  });

  describe('linear decay boundary values', () => {
    it('returns floor of continuous value', () => {
      // At 1s into 20s timer: fraction=0.05, raw=10-0.45=9.55, floor=9
      expect(calculateCompetitiveScore(true, 1_000, NUMERIC_TIMER)).toBe(9);
    });

    it('uses floor not ceiling', () => {
      // At 2s into 20s timer: fraction=0.1, raw=10-0.9=9.1, floor=9
      expect(calculateCompetitiveScore(true, 2_000, NUMERIC_TIMER)).toBe(9);
    });

    it('never goes below minimum (1)', () => {
      expect(calculateCompetitiveScore(true, 100_000, NUMERIC_TIMER)).toBe(1);
    });
  });

  describe('constants', () => {
    it('COMPETITIVE_MAX_POINTS is 10', () => {
      expect(COMPETITIVE_MAX_POINTS).toBe(10);
    });

    it('COMPETITIVE_MIN_POINTS is 1', () => {
      expect(COMPETITIVE_MIN_POINTS).toBe(1);
    });
  });
});

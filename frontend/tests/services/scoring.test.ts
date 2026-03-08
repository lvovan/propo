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

    it('awards 6 points at half-time (numeric)', () => {
      expect(calculateCompetitiveScore(true, 10_000, NUMERIC_TIMER)).toBe(6);
    });

    it('awards 6 points at half-time (story)', () => {
      expect(calculateCompetitiveScore(true, 25_000, STORY_TIMER)).toBe(6);
    });

    it('awards 2 points near expiry', () => {
      expect(calculateCompetitiveScore(true, 19_500, NUMERIC_TIMER)).toBe(2);
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

    it('deducts 6 points at half-time (numeric)', () => {
      expect(calculateCompetitiveScore(false, 10_000, NUMERIC_TIMER)).toBe(-6);
    });

    it('deducts 6 points at half-time (story)', () => {
      expect(calculateCompetitiveScore(false, 25_000, STORY_TIMER)).toBe(-6);
    });

    it('deducts 2 points near expiry', () => {
      expect(calculateCompetitiveScore(false, 19_500, NUMERIC_TIMER)).toBe(-2);
    });

    it('deducts 1 point at exact expiry', () => {
      expect(calculateCompetitiveScore(false, NUMERIC_TIMER, NUMERIC_TIMER)).toBe(-1);
    });

    it('deducts 1 point after expiry (clamped)', () => {
      expect(calculateCompetitiveScore(false, 25_000, NUMERIC_TIMER)).toBe(-1);
    });
  });

  describe('linear decay boundary values', () => {
    it('keeps 10 points for the first 1/10th of the timer', () => {
      // At 1s into 20s timer: fraction=0.05, floor(9×0.05)=0, value=10
      expect(calculateCompetitiveScore(true, 1_000, NUMERIC_TIMER)).toBe(10);
    });

    it('keeps 10 at exactly the 1/10th boundary', () => {
      // At 2s into 20s timer: fraction=0.1, floor(9×0.1)=0, value=10
      expect(calculateCompetitiveScore(true, 2_000, NUMERIC_TIMER)).toBe(10);
    });

    it('transitions to 9 just past the 1/10th boundary', () => {
      // At 2.223s into 20s timer: fraction=0.11115, floor(9×0.11115)=1, value=10-1=9
      expect(calculateCompetitiveScore(true, 2_223, NUMERIC_TIMER)).toBe(9);
    });

    it('keeps 10 at 1ms (not 9 due to off-by-one)', () => {
      expect(calculateCompetitiveScore(true, 1, NUMERIC_TIMER)).toBe(10);
    });

    it('each value gets approximately equal time within the timer', () => {
      // Verify values at specific known transition points
      // With the fixed formula: pointValue = max(1, 10 - floor(9 * fraction))
      // Transition from N to N-1 occurs when floor(9 * fraction) increases by 1
      // i.e., at fraction = k/9 for k=1,2,...,9
      const transitions = [
        { elapsed: 0, expected: 10 },
        { elapsed: 2222, expected: 10 },  // just before 2222.2ms boundary
        { elapsed: 2223, expected: 9 },   // just after
        { elapsed: 10000, expected: 6 },  // midpoint
        { elapsed: 17778, expected: 2 },  // near end
        { elapsed: 20000, expected: 1 },  // at expiry
      ];
      for (const { elapsed, expected } of transitions) {
        expect(calculateCompetitiveScore(true, elapsed, NUMERIC_TIMER)).toBe(expected);
      }
    });

    it('never goes below minimum (1)', () => {
      expect(calculateCompetitiveScore(true, 100_000, NUMERIC_TIMER)).toBe(1);
    });
  });

  describe('incorrect answer after timer expires (FR-006)', () => {
    it('penalizes exactly -1 when wrong answer submitted after timer expires', () => {
      // Player takes 30s on a 20s timer, then submits wrong answer
      expect(calculateCompetitiveScore(false, 30_000, NUMERIC_TIMER)).toBe(-1);
    });

    it('penalizes exactly -1 at exact timer expiry', () => {
      expect(calculateCompetitiveScore(false, NUMERIC_TIMER, NUMERIC_TIMER)).toBe(-1);
    });

    it('penalizes exactly -1 well after timer expires (story timer)', () => {
      // Player takes 120s on a 50s story timer
      expect(calculateCompetitiveScore(false, 120_000, STORY_TIMER)).toBe(-1);
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

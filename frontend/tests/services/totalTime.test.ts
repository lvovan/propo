import { describe, it, expect } from 'vitest';
import { calculateTotalTime, formatTotalTime } from '../../src/services/totalTime';
import type { Round } from '../../src/types/game';

function createRound(elapsedMs: number, isCorrect: boolean): Round {
  return {
    formula: { type: 'percentage', values: [10, 100, 10], hiddenPosition: 'C', correctAnswer: 10, timerDurationMs: 20000 },
    playerAnswer: isCorrect ? 10 : 99,
    isCorrect,
    elapsedMs,
    points: isCorrect ? 5 : -2,
    firstTryCorrect: isCorrect,
  };
}

describe('calculateTotalTime', () => {
  it('sums elapsedMs for all correct rounds (no penalty)', () => {
    const rounds = [createRound(2000, true), createRound(3000, true), createRound(1500, true)];
    expect(calculateTotalTime(rounds)).toBe(6500);
  });

  it('adds 60s penalty per incorrect answer', () => {
    const rounds = [createRound(2000, true), createRound(3000, false), createRound(1500, true)];
    expect(calculateTotalTime(rounds)).toBe(6500 + 60000);
  });

  it('adds cumulative penalty for multiple incorrect answers', () => {
    const rounds = [
      createRound(2000, false),
      createRound(3000, false),
      createRound(1500, false),
    ];
    expect(calculateTotalTime(rounds)).toBe(6500 + 3 * 60000);
  });

  it('handles empty rounds array', () => {
    expect(calculateTotalTime([])).toBe(0);
  });

  it('handles rounds with null elapsedMs', () => {
    const round: Round = {
      formula: { type: 'percentage', values: [10, 100, 10], hiddenPosition: 'C', correctAnswer: 10, timerDurationMs: 20000 },
      playerAnswer: null,
      isCorrect: null,
      elapsedMs: null,
      points: null,
      firstTryCorrect: null,
    };
    expect(calculateTotalTime([round])).toBe(0);
  });
});

describe('formatTotalTime', () => {
  it('formats time under 60s', () => {
    expect(formatTotalTime(29600)).toBe('29.6s');
  });

  it('formats time at exactly 60s', () => {
    expect(formatTotalTime(60000)).toBe('1m 0.0s');
  });

  it('formats time over 60s', () => {
    expect(formatTotalTime(89600)).toBe('1m 29.6s');
  });

  it('formats time at exactly 2 minutes', () => {
    expect(formatTotalTime(120000)).toBe('2m 0.0s');
  });

  it('formats zero', () => {
    expect(formatTotalTime(0)).toBe('0.0s');
  });

  it('formats large time with penalties (2m 29.6s)', () => {
    // 29.6s + 2×60s penalty = 149.6s
    expect(formatTotalTime(149600)).toBe('2m 29.6s');
  });
});

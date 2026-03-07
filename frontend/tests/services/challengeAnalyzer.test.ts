import { describe, it, expect } from 'vitest';
import {
  identifyChallengingItems,
  extractTrickyCategories,
  getChallengingItemsForPlayer,
} from '../../src/services/challengeAnalyzer';
import type { RoundResult } from '../../src/types/player';
import { STORAGE_KEY } from '../../src/services/playerStorage';

function makeRound(type: 'percentage' | 'ratio' | 'fraction' | 'multiItemRatio' | 'percentageOfWhole' | 'complexExtrapolation', isCorrect: boolean, elapsedMs: number): RoundResult {
  return { type, values: [1, 2, 3], isCorrect, elapsedMs };
}

describe('identifyChallengingItems', () => {
  it('returns items with mistakes sorted by mistakeCount desc', () => {
    const rounds: RoundResult[] = [
      makeRound('percentage', false, 5000),
      makeRound('percentage', false, 4000),
      makeRound('ratio', false, 6000),
      makeRound('fraction', true, 1500),
    ];
    const result = identifyChallengingItems(rounds);
    expect(result.length).toBe(2);
    expect(result[0].type).toBe('percentage');
    expect(result[0].mistakeCount).toBe(2);
    expect(result[1].type).toBe('ratio');
    expect(result[1].mistakeCount).toBe(1);
  });

  it('falls back to avgMs desc when all correct', () => {
    const rounds: RoundResult[] = [
      makeRound('percentage', true, 1500),
      makeRound('ratio', true, 4000),
      makeRound('fraction', true, 3000),
    ];
    const result = identifyChallengingItems(rounds);
    expect(result[0].type).toBe('ratio');
    expect(result[1].type).toBe('fraction');
    expect(result[2].type).toBe('percentage');
  });

  it('returns empty array for empty input', () => {
    expect(identifyChallengingItems([])).toEqual([]);
  });

  it('skips legacy rounds without type field', () => {
    const legacy = [{ factorA: 3, factorB: 4, isCorrect: true, elapsedMs: 1000 }] as unknown as RoundResult[];
    expect(identifyChallengingItems(legacy)).toEqual([]);
  });
});

describe('extractTrickyCategories', () => {
  it('returns up to 3 tricky types', () => {
    const items = [
      { type: 'percentage' as const, mistakeCount: 5, avgMs: 5000 },
      { type: 'ratio' as const, mistakeCount: 3, avgMs: 4000 },
      { type: 'fraction' as const, mistakeCount: 2, avgMs: 3000 },
      { type: 'complexExtrapolation' as const, mistakeCount: 1, avgMs: 2000 },
    ];
    const result = extractTrickyCategories(items);
    expect(result).toEqual(['percentage', 'ratio', 'fraction']);
  });

  it('returns empty array for empty input', () => {
    expect(extractTrickyCategories([])).toEqual([]);
  });
});

describe('getChallengingItemsForPlayer', () => {
  beforeEach(() => { localStorage.clear(); });
  afterEach(() => { localStorage.clear(); });

  it('returns empty array for unknown player', () => {
    expect(getChallengingItemsForPlayer('Nobody')).toEqual([]);
  });

  it('aggregates across recent games', () => {
    const store = {
      version: 5,
      players: [{
        name: 'TestKid', avatarId: 'cat', lastActive: Date.now(),
        createdAt: Date.now(), totalScore: 0, gamesPlayed: 2,
        gameHistory: [
          { score: 10, completedAt: Date.now() - 1000, rounds: [
            makeRound('percentage', false, 6000),
          ], gameMode: 'play' },
          { score: 20, completedAt: Date.now(), rounds: [
            makeRound('percentage', false, 5000),
            makeRound('ratio', false, 4000),
          ], gameMode: 'play' },
        ],
      }],
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    const result = getChallengingItemsForPlayer('TestKid');
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].type).toBe('percentage');
    expect(result[0].mistakeCount).toBe(2);
  });
});

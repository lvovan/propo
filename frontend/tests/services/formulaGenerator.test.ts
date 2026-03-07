import { describe, it, expect } from 'vitest';
import { generateFormulas, generateImproveFormulas, buildPercentagePool, buildRatioPool, buildFractionPool, buildMultiItemRatioPool, buildPercentageOfWholePool, buildComplexExtrapolationPool } from '../../src/services/formulaGenerator';
import { PURE_NUMERIC_TYPES, STORY_CHALLENGE_TYPES } from '../../src/types/game';
import type { ChallengingItem, QuestionType } from '../../src/types/game';

function createSeededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

describe('buildPercentagePool', () => {
  it('returns triples where A% of B = C (all integers)', () => {
    const pool = buildPercentagePool();
    expect(pool.length).toBeGreaterThan(0);
    pool.forEach(({ a, b, c }) => {
      expect(a * b / 100).toBe(c);
      expect(Number.isInteger(c)).toBe(true);
    });
  });
});

describe('buildRatioPool', () => {
  it('returns quads where A:B = C:D', () => {
    const pool = buildRatioPool();
    expect(pool.length).toBeGreaterThan(0);
    pool.forEach(({ a, b, c, d }) => {
      expect(a * d).toBe(b * c);
    });
  });
});

describe('buildFractionPool', () => {
  it('returns proper fractions', () => {
    const pool = buildFractionPool();
    expect(pool.length).toBeGreaterThan(0);
    pool.forEach(({ a, b }) => {
      expect(a).toBeLessThan(b);
    });
  });
});

describe('buildMultiItemRatioPool', () => {
  it('returns entries with positive integer subset totals <=999', () => {
    const pool = buildMultiItemRatioPool();
    expect(pool.length).toBeGreaterThan(0);
    pool.slice(0, 100).forEach(({ a, b }) => {
      const answer = a * b;
      expect(answer).toBeGreaterThan(0);
      expect(answer).toBeLessThanOrEqual(999);
      expect(Number.isInteger(answer)).toBe(true);
    });
  });
});

describe('buildPercentageOfWholePool', () => {
  it('returns entries with whole-number percentage answers 1-100', () => {
    const pool = buildPercentageOfWholePool();
    expect(pool.length).toBeGreaterThan(0);
    pool.forEach(({ c }) => {
      expect(c).toBeGreaterThanOrEqual(1);
      expect(c).toBeLessThanOrEqual(100);
      expect(Number.isInteger(c)).toBe(true);
    });
  });
});

describe('buildComplexExtrapolationPool', () => {
  it('returns quads with whole-number proportions', () => {
    const pool = buildComplexExtrapolationPool();
    expect(pool.length).toBeGreaterThan(0);
    pool.forEach(({ a, b, c, d }) => {
      expect(b * c).toBe(a * d);
    });
  });
});

describe('generateFormulas', () => {
  it('generates exactly 10 formulas', () => {
    const formulas = generateFormulas(createSeededRandom(42));
    expect(formulas).toHaveLength(10);
  });

  it('produces exactly 5 numeric and 5 word problem rounds', () => {
    const formulas = generateFormulas(createSeededRandom(42));
    const numeric = formulas.filter((f) => f.type !== 'ruleOfThree');
    const wordProblems = formulas.filter((f) => f.type === 'ruleOfThree');
    expect(numeric).toHaveLength(5);
    expect(wordProblems).toHaveLength(5);
  });

  it('includes all 4 question types', () => {
    const formulas = generateFormulas(createSeededRandom(42));
    const storyTypes = new Set(formulas.filter((f) => STORY_CHALLENGE_TYPES.includes(f.type)).map((f) => f.type));
    expect(storyTypes.has('multiItemRatio')).toBe(true);
    expect(storyTypes.has('percentageOfWhole')).toBe(true);
    expect(storyTypes.has('complexExtrapolation')).toBe(true);
  });

  it('sets timerDurationMs correctly per type', () => {
    const formulas = generateFormulas(createSeededRandom(42));
    formulas.forEach((f) => {
      if (PURE_NUMERIC_TYPES.includes(f.type)) {
        expect(f.timerDurationMs).toBe(20000);
      } else {
        expect(f.timerDurationMs).toBe(50000);
      }
    });
  });

  it('story formulas have wordProblemKey', () => {
    const formulas = generateFormulas(createSeededRandom(42));
    formulas.filter((f) => STORY_CHALLENGE_TYPES.includes(f.type)).forEach((f) => {
      expect(f.wordProblemKey).toBeTruthy();
    });
  });

  it('produces deterministic output with injected randomFn', () => {
    const f1 = generateFormulas(createSeededRandom(42));
    const f2 = generateFormulas(createSeededRandom(42));
    expect(f1).toEqual(f2);
  });

  it('ruleOfThree formulas only hide position D (answer)', () => {
    for (let g = 0; g < 20; g++) {
      const formulas = generateFormulas();
      formulas.filter((f) => f.type === 'ruleOfThree').forEach((f) => {
        expect(f.hiddenPosition).toBe('D');
      });
    }
  });

  it('ruleOfThree formulas have a wordProblemKey', () => {
    const formulas = generateFormulas(createSeededRandom(42));
    formulas.filter((f) => f.type === 'ruleOfThree').forEach((f) => {
      expect(f.wordProblemKey).toBeTruthy();
    });
  });

  it('all values are positive integers', () => {
    for (let g = 0; g < 20; g++) {
      const formulas = generateFormulas();
      formulas.forEach((f) => {
        f.values.forEach((v) => {
          expect(v).toBeGreaterThan(0);
          expect(Number.isInteger(v)).toBe(true);
        });
      });
    }
  });
});

describe('generateImproveFormulas', () => {
  function makeItem(type: QuestionType, mistakeCount = 2): ChallengingItem {
    return { type, mistakeCount, avgMs: 5000 };
  }

  it('returns exactly 10 formulas', () => {
    const items = [makeItem('percentage')];
    const formulas = generateImproveFormulas(items);
    expect(formulas).toHaveLength(10);
  });

  it('biases toward challenging numeric types while keeping 5/5 split', () => {
    const items = [makeItem('percentage', 5)];
    const formulas = generateImproveFormulas(items, createSeededRandom(42));
    const numeric = formulas.filter((f) => f.type !== 'ruleOfThree');
    const wordProblems = formulas.filter((f) => f.type === 'ruleOfThree');
    expect(numeric).toHaveLength(5);
    expect(wordProblems).toHaveLength(5);
    const pctCount = formulas.filter((f) => f.type === 'percentage').length;
    expect(pctCount).toBeGreaterThanOrEqual(2);
  });

  it('includes all 6 types', () => {
    const items = [makeItem('ratio')];
    const formulas = generateImproveFormulas(items, createSeededRandom(42));
    const types = new Set(formulas.map((f) => f.type));
    expect(types.size).toBe(6);
  });
});

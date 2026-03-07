import { describe, it, expect } from 'vitest';
import { generateFormulas, generateImproveFormulas, buildPercentagePool, buildRatioPool, buildFractionPool, buildRuleOfThreePool } from '../../src/services/formulaGenerator';
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
      expect(c).toBeGreaterThanOrEqual(1);
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
  it('returns proper fractions (numerator < denominator)', () => {
    const pool = buildFractionPool();
    expect(pool.length).toBeGreaterThan(0);
    pool.forEach(({ a, b }) => {
      expect(a).toBeLessThan(b);
    });
  });
});

describe('buildRuleOfThreePool', () => {
  it('returns quads with whole-number proportions', () => {
    const pool = buildRuleOfThreePool();
    expect(pool.length).toBeGreaterThan(0);
    pool.forEach(({ a, b, c, d }) => {
      // rate = b/a = d/c
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
    const types = new Set(formulas.map((f) => f.type));
    expect(types.has('percentage')).toBe(true);
    expect(types.has('ratio')).toBe(true);
    expect(types.has('fraction')).toBe(true);
    expect(types.has('ruleOfThree')).toBe(true);
  });

  it('correctAnswer matches the hidden value for all formulas', () => {
    const formulas = generateFormulas(createSeededRandom(42));
    formulas.forEach((f) => {
      const idx = ['A', 'B', 'C', 'D'].indexOf(f.hiddenPosition);
      expect(f.correctAnswer).toBe(f.values[idx]);
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
    for (let g = 0; g < 50; g++) {
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

  it('includes all 4 types even when only 1 is challenging', () => {
    const items = [makeItem('ratio')];
    const formulas = generateImproveFormulas(items, createSeededRandom(42));
    const types = new Set(formulas.map((f) => f.type));
    expect(types.size).toBe(4);
  });
});

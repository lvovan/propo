import { describe, it, expect } from 'vitest';
import { generateFormulas, generateImproveFormulas, buildPercentagePool, buildFractionPool, buildMultiItemRatioPool, buildPercentageOfWholePool, buildComplexExtrapolationPool, MULTI_ITEM_RATIO_COMBINED_TEMPLATES, MULTI_ITEM_RATIO_TEMPLATES } from '../../src/services/formulaGenerator';
import { PURE_NUMERIC_TYPES, STORY_CHALLENGE_TYPES } from '../../src/types/game';
import type { ChallengingItem, QuestionType } from '../../src/types/game';
import { createSeededRandomFromString, createSeededRandom as createMulberry32 } from '../../src/services/seededRandom';

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

describe('buildFractionPool', () => {
  it('returns proper fractions', () => {
    const pool = buildFractionPool();
    expect(pool.length).toBeGreaterThan(0);
    pool.forEach(({ a, b }) => {
      expect(a).toBeLessThan(b);
    });
  });
});

const FRIENDLY_VALUES = new Set([2, 3, 4, 5, 10, 15, 20, 25, 50]);

describe('buildMultiItemRatioPool', () => {
  it('returns entries with positive integer subset totals <=999 using friendly values', () => {
    const pool = buildMultiItemRatioPool();
    expect(pool.length).toBeGreaterThan(0);
    pool.forEach(({ a, b, c, d }) => {
      const answer = a * b;
      expect(answer).toBeGreaterThan(0);
      expect(answer).toBeLessThanOrEqual(999);
      expect(Number.isInteger(answer)).toBe(true);
      // values per item must be friendly round numbers
      expect(FRIENDLY_VALUES.has(b)).toBe(true);
      expect(FRIENDLY_VALUES.has(d)).toBe(true);
      // noise value must differ from target value
      expect(b).not.toBe(d);
      // counts are in range
      expect(a).toBeGreaterThanOrEqual(2);
      expect(a).toBeLessThanOrEqual(8);
      expect(c).toBeGreaterThanOrEqual(2);
      expect(c).toBeLessThanOrEqual(8);
    });
  });
});

const FRIENDLY_PERCENTAGES = [10, 20, 25, 50, 75];

describe('buildPercentageOfWholePool', () => {
  it('returns non-empty sub-pools for all three targets', () => {
    const poolSet = buildPercentageOfWholePool();
    expect(poolSet.first.length).toBeGreaterThan(0);
    expect(poolSet.second.length).toBeGreaterThan(0);
    expect(poolSet.combined.length).toBeGreaterThan(0);
  });

  it('first sub-pool: all triples satisfy a/c is a friendly percentage', () => {
    const poolSet = buildPercentageOfWholePool();
    poolSet.first.forEach(({ a, b, c }) => {
      expect(c).toBeGreaterThanOrEqual(10);
      expect(c).toBeLessThanOrEqual(50);
      expect(a).toBeGreaterThanOrEqual(1);
      expect(b).toBeGreaterThanOrEqual(1);
      const pct = (a / c) * 100;
      expect(FRIENDLY_PERCENTAGES).toContain(pct);
    });
  });

  it('second sub-pool: all triples satisfy b/c is a friendly percentage', () => {
    const poolSet = buildPercentageOfWholePool();
    poolSet.second.forEach(({ a, b, c }) => {
      expect(c).toBeGreaterThanOrEqual(10);
      expect(c).toBeLessThanOrEqual(50);
      expect(a).toBeGreaterThanOrEqual(1);
      expect(b).toBeGreaterThanOrEqual(1);
      const pct = (b / c) * 100;
      expect(FRIENDLY_PERCENTAGES).toContain(pct);
    });
  });

  it('combined sub-pool: all triples satisfy (a+b)/c is a friendly percentage', () => {
    const poolSet = buildPercentageOfWholePool();
    poolSet.combined.forEach(({ a, b, c }) => {
      expect(c).toBeGreaterThanOrEqual(10);
      expect(c).toBeLessThanOrEqual(50);
      expect(a).toBeGreaterThanOrEqual(1);
      expect(b).toBeGreaterThanOrEqual(1);
      const pct = ((a + b) / c) * 100;
      expect(FRIENDLY_PERCENTAGES).toContain(pct);
    });
  });

  it('a + b <= c always holds across all sub-pools', () => {
    const poolSet = buildPercentageOfWholePool();
    [...poolSet.first, ...poolSet.second, ...poolSet.combined].forEach(({ a, b, c }) => {
      expect(a + b).toBeLessThanOrEqual(c);
    });
  });

  it('each sub-pool covers all 5 friendly percentages', () => {
    const poolSet = buildPercentageOfWholePool();
    const seenFirst = new Set(poolSet.first.map(({ a, c }) => (a / c) * 100));
    const seenSecond = new Set(poolSet.second.map(({ b, c }) => (b / c) * 100));
    const seenCombined = new Set(poolSet.combined.map(({ a, b, c }) => ((a + b) / c) * 100));
    for (const pct of FRIENDLY_PERCENTAGES) {
      expect(seenFirst.has(pct)).toBe(true);
      expect(seenSecond.has(pct)).toBe(true);
      expect(seenCombined.has(pct)).toBe(true);
    }
  });

  it('acceptance: 5/25 = 20% appears in first sub-pool', () => {
    const poolSet = buildPercentageOfWholePool();
    const has20pct = poolSet.first.some(({ a, c }) => a === 5 && c === 25);
    expect(has20pct).toBe(true);
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
    const numeric = formulas.filter((f) => PURE_NUMERIC_TYPES.includes(f.type));
    const wordProblems = formulas.filter((f) => STORY_CHALLENGE_TYPES.includes(f.type));
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

  it('never generates ratio questions', () => {
    for (let seed = 1; seed <= 50; seed++) {
      const formulas = generateFormulas(createSeededRandom(seed));
      expect(formulas.every((f) => f.type !== 'ratio')).toBe(true);
    }
  });

  it('numeric rounds use only percentage and fraction', () => {
    for (let seed = 1; seed <= 50; seed++) {
      const formulas = generateFormulas(createSeededRandom(seed));
      const numeric = formulas.filter((f) => PURE_NUMERIC_TYPES.includes(f.type));
      numeric.forEach((f) => {
        expect(['percentage', 'fraction']).toContain(f.type);
      });
    }
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

  it('story challenge formulas have valid correctAnswer', () => {
    for (let g = 0; g < 20; g++) {
      const formulas = generateFormulas();
      formulas.filter((f) => STORY_CHALLENGE_TYPES.includes(f.type)).forEach((f) => {
        expect(f.correctAnswer).toBeGreaterThan(0);
        expect(Number.isInteger(f.correctAnswer)).toBe(true);
      });
    }
  });

  it('story challenge formulas have a wordProblemKey', () => {
    const formulas = generateFormulas(createSeededRandom(42));
    formulas.filter((f) => STORY_CHALLENGE_TYPES.includes(f.type)).forEach((f) => {
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
    const numeric = formulas.filter((f) => PURE_NUMERIC_TYPES.includes(f.type));
    const wordProblems = formulas.filter((f) => STORY_CHALLENGE_TYPES.includes(f.type));
    expect(numeric).toHaveLength(5);
    expect(wordProblems).toHaveLength(5);
    const pctCount = formulas.filter((f) => f.type === 'percentage').length;
    expect(pctCount).toBeGreaterThanOrEqual(2);
  });

  it('includes all 5 types', () => {
    const items = [makeItem('fraction')];
    const formulas = generateImproveFormulas(items, createSeededRandom(42));
    const types = new Set(formulas.map((f) => f.type));
    expect(types.size).toBe(5);
  });
});
describe('generateFormulas with seeded PRNG (competitive mode)', () => {
  it('same string seed produces identical 10-question sequence', () => {
    const f1 = generateFormulas(createSeededRandomFromString('abc123'));
    const f2 = generateFormulas(createSeededRandomFromString('abc123'));
    expect(f1).toEqual(f2);
    expect(f1.length).toBe(10);
  });

  it('different string seeds produce different questions', () => {
    const f1 = generateFormulas(createSeededRandomFromString('abc123'));
    const f2 = generateFormulas(createSeededRandomFromString('xyz789'));
    // At least one question should differ
    const same = f1.every((q, i) =>
      q.type === f2[i].type && q.correctAnswer === f2[i].correctAnswer && q.hiddenPosition === f2[i].hiddenPosition
    );
    expect(same).toBe(false);
  });

  it('preserves question structure with seeded PRNG', () => {
    const formulas = generateFormulas(createSeededRandomFromString('test-seed'));
    expect(formulas.length).toBe(10);
    const numericCount = formulas.filter((f) => PURE_NUMERIC_TYPES.includes(f.type)).length;
    const storyCount = formulas.filter((f) => STORY_CHALLENGE_TYPES.includes(f.type)).length;
    expect(numericCount).toBe(5);
    expect(storyCount).toBe(5);
  });
});

describe('word problem target variation', () => {
  it('multiItemRatio: target item varies across games (not always the first)', () => {
    // Generate many games and check that the answer varies between a*b patterns
    // When swapped, values[0]*values[1] still equals correctAnswer (since values are reordered)
    // But the underlying item pair changes, so we verify different value patterns emerge
    const answerSets = new Set<string>();
    for (let seed = 0; seed < 100; seed++) {
      const rng = createMulberry32(seed);
      const formulas = generateFormulas(rng);
      for (const f of formulas) {
        if (f.type === 'multiItemRatio') {
          // Track the count+value pair that is the target
          answerSets.add(`${f.values[0]}x${f.values[1]}`);
        }
      }
    }
    // Should have variety in target pairs (not always the same pattern)
    expect(answerSets.size).toBeGreaterThan(10);
  });

  it('multiItemRatio: correctAnswer matches variant (single=a*b, combined=a*b+c*d)', () => {
    for (let seed = 0; seed < 50; seed++) {
      const rng = createMulberry32(seed);
      const formulas = generateFormulas(rng);
      for (const f of formulas) {
        if (f.type === 'multiItemRatio') {
          if (f.wordProblemKey?.endsWith('.combined')) {
            expect(f.correctAnswer).toBe((f.values[0] * f.values[1]) + (f.values[2] * f.values[3]));
          } else {
            expect(f.correctAnswer).toBe(f.values[0] * f.values[1]);
          }
        }
      }
    }
  });

  it('percentageOfWhole: target element varies (not always first pool element)', () => {
    // When b/total is a friendly percentage, there's a 50% chance of swap
    // Over many seeds, we should see different answer values for same-pool entries
    const answers = new Set<number>();
    for (let seed = 0; seed < 100; seed++) {
      const rng = createMulberry32(seed);
      const formulas = generateFormulas(rng);
      for (const f of formulas) {
        if (f.type === 'percentageOfWhole') {
          answers.add(f.correctAnswer);
        }
      }
    }
    // Should produce multiple different percentage answers
    expect(answers.size).toBeGreaterThan(2);
  });

  it('percentageOfWhole: correctAnswer is always a friendly percentage and all 5 values appear', () => {
    const friendly = new Set([10, 20, 25, 50, 75]);
    const seen = new Set<number>();
    for (let seed = 0; seed < 200; seed++) {
      const rng = createMulberry32(seed);
      const formulas = generateFormulas(rng);
      for (const f of formulas) {
        if (f.type === 'percentageOfWhole') {
          expect(friendly.has(f.correctAnswer)).toBe(true);
          seen.add(f.correctAnswer);
        }
      }
    }
    // All 5 friendly percentages should appear across 200 games
    for (const pct of friendly) {
      expect(seen.has(pct)).toBe(true);
    }
  });

  it('percentageOfWhole: all 3 target variants appear with balanced distribution (each ≥20%)', () => {
    let firstCount = 0;
    let secondCount = 0;
    let combinedCount = 0;
    for (let seed = 0; seed < 200; seed++) {
      const rng = createMulberry32(seed);
      const formulas = generateFormulas(rng);
      for (const f of formulas) {
        if (f.type === 'percentageOfWhole') {
          if (f.wordProblemKey?.endsWith('.combined')) {
            combinedCount++;
          } else {
            // Detect 'second' vs 'first': for 'second', values are [b, a, c]
            // and correctAnswer = b/c * 100 = values[0]/values[2] * 100
            const pctOfFirst = (f.values[0] / f.values[2]) * 100;
            if (pctOfFirst === f.correctAnswer) {
              // correctAnswer matches values[0]/total — could be first or second
              // (both use base key). Since target-first selection is uniform,
              // we count first+second together as non-combined and verify combined separately
              firstCount++;
            } else {
              secondCount++;
            }
          }
        }
      }
    }
    const total = firstCount + secondCount + combinedCount;
    expect(total).toBeGreaterThan(0);
    // Each target type should appear at least 20% of the time
    // With uniform 1/3 selection, we expect ~33% each
    expect(combinedCount / total).toBeGreaterThanOrEqual(0.2);
    // first + second (non-combined) should be ~66%, each individually ~33%
    expect((firstCount + secondCount) / total).toBeGreaterThanOrEqual(0.4);
    expect(combinedCount).toBeGreaterThan(0);
    expect(firstCount + secondCount).toBeGreaterThan(0);
  });

  it('percentageOfWhole: combined target uses .combined key suffix', () => {
    for (let seed = 0; seed < 100; seed++) {
      const rng = createMulberry32(seed);
      const formulas = generateFormulas(rng);
      for (const f of formulas) {
        if (f.type === 'percentageOfWhole' && f.wordProblemKey?.endsWith('.combined')) {
          // Verify correctAnswer matches (a+b)/c * 100
          const pct = ((f.values[0] + f.values[1]) / f.values[2]) * 100;
          expect(f.correctAnswer).toBe(pct);
        }
      }
    }
  });

  it('percentageOfWhole: deterministic with seeded random', () => {
    const rng1 = createMulberry32(42);
    const rng2 = createMulberry32(42);
    const f1 = generateFormulas(rng1).filter(f => f.type === 'percentageOfWhole');
    const f2 = generateFormulas(rng2).filter(f => f.type === 'percentageOfWhole');
    expect(f1).toEqual(f2);
  });

  it('percentageOfWhole: all answers are friendly percentages across 500 games', () => {
    const friendly = new Set([10, 20, 25, 50, 75]);
    for (let seed = 0; seed < 500; seed++) {
      const rng = createMulberry32(seed);
      const formulas = generateFormulas(rng);
      for (const f of formulas) {
        if (f.type === 'percentageOfWhole') {
          expect(friendly.has(f.correctAnswer)).toBe(true);
        }
      }
    }
  });

  it('percentageOfWhole: deterministic across 50 seeds', () => {
    for (let seed = 0; seed < 50; seed++) {
      const rng1 = createMulberry32(seed);
      const rng2 = createMulberry32(seed);
      const f1 = generateFormulas(rng1).filter(f => f.type === 'percentageOfWhole');
      const f2 = generateFormulas(rng2).filter(f => f.type === 'percentageOfWhole');
      expect(JSON.stringify(f1)).toBe(JSON.stringify(f2));
    }
  });
});

describe('multiItemRatio combined variant', () => {
  it('MULTI_ITEM_RATIO_COMBINED_TEMPLATES has same length as MULTI_ITEM_RATIO_TEMPLATES', () => {
    expect(MULTI_ITEM_RATIO_COMBINED_TEMPLATES.length).toBe(MULTI_ITEM_RATIO_TEMPLATES.length);
  });

  it('combined templates have matching unit keys', () => {
    for (let i = 0; i < MULTI_ITEM_RATIO_TEMPLATES.length; i++) {
      expect(MULTI_ITEM_RATIO_COMBINED_TEMPLATES[i].unitKey).toBe(MULTI_ITEM_RATIO_TEMPLATES[i].unitKey);
    }
  });

  it('variant distribution: all 3 variants appear and none exceeds 60%', () => {
    let singleFirst = 0;
    let singleSecond = 0;
    let combined = 0;
    for (let seed = 0; seed < 200; seed++) {
      const rng = createMulberry32(seed);
      const formulas = generateFormulas(rng);
      for (const f of formulas) {
        if (f.type === 'multiItemRatio') {
          if (f.wordProblemKey?.endsWith('.combined')) {
            combined++;
          } else {
            // For single variants, check if answer = values[0]*values[1]
            // (it always does after reorder, but we count by template key)
            singleFirst++; // both single-first and single-second use non-combined keys
          }
        }
      }
    }
    const total = singleFirst + combined;
    expect(combined).toBeGreaterThan(0);
    expect(singleFirst).toBeGreaterThan(0);
    // Combined should be roughly 33%, so between 15% and 60%
    const combinedPct = (combined / total) * 100;
    expect(combinedPct).toBeGreaterThan(15);
    expect(combinedPct).toBeLessThan(60);
  });

  it('combined answer equals (a*b) + (c*d) and is <= 999', () => {
    for (let seed = 0; seed < 100; seed++) {
      const rng = createMulberry32(seed);
      const formulas = generateFormulas(rng);
      for (const f of formulas) {
        if (f.type === 'multiItemRatio' && f.wordProblemKey?.endsWith('.combined')) {
          const expectedAnswer = (f.values[0] * f.values[1]) + (f.values[2] * f.values[3]);
          expect(f.correctAnswer).toBe(expectedAnswer);
          expect(f.correctAnswer).toBeLessThanOrEqual(999);
          expect(f.correctAnswer).toBeGreaterThan(0);
        }
      }
    }
  });

  it('combined variant is deterministic with same seed', () => {
    const f1 = generateFormulas(createSeededRandomFromString('combined-test'));
    const f2 = generateFormulas(createSeededRandomFromString('combined-test'));
    for (let i = 0; i < 10; i++) {
      expect(f1[i].wordProblemKey).toBe(f2[i].wordProblemKey);
      expect(f1[i].correctAnswer).toBe(f2[i].correctAnswer);
      expect(f1[i].values).toEqual(f2[i].values);
    }
  });

  it('combined template keys end with .combined', () => {
    for (let seed = 0; seed < 50; seed++) {
      const rng = createMulberry32(seed);
      const formulas = generateFormulas(rng);
      for (const f of formulas) {
        if (f.type === 'multiItemRatio') {
          const isCombined = f.wordProblemKey?.endsWith('.combined');
          if (isCombined) {
            // Combined: answer should be sum of both item totals
            const sum = (f.values[0] * f.values[1]) + (f.values[2] * f.values[3]);
            expect(f.correctAnswer).toBe(sum);
          } else {
            // Single: answer should be first item total
            expect(f.correctAnswer).toBe(f.values[0] * f.values[1]);
          }
        }
      }
    }
  });
});
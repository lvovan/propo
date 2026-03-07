import type { Formula, QuestionType, HiddenPosition, ChallengingItem } from '../types/game';
import { PURE_NUMERIC_TYPES, STORY_CHALLENGE_TYPES } from '../types/game';
import { NUMERIC_TIMER_MS, STORY_TIMER_MS } from '../constants/scoring';

// ── Helpers ──────────────────────────────────────────────────────

/** Fisher-Yates (Knuth) shuffle — mutates the array in place. */
function fisherYatesShuffle<T>(array: T[], randomFn: () => number): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(randomFn() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/** Pick a random element from an array. */
function pickRandom<T>(arr: T[], randomFn: () => number): T {
  return arr[Math.floor(randomFn() * arr.length)];
}

// ── Percentage pool ──────────────────────────────────────────────

const FRIENDLY_PERCENTAGES = [5, 10, 20, 25, 50, 75] as const;

export interface Triple { a: number; b: number; c: number }

export function buildPercentagePool(): Triple[] {
  const pool: Triple[] = [];
  for (const pct of FRIENDLY_PERCENTAGES) {
    for (let base = 4; base <= 200; base++) {
      const result = (pct * base) / 100;
      if (Number.isInteger(result) && result >= 1 && result <= 200) {
        pool.push({ a: pct, b: base, c: result });
      }
    }
  }
  return pool;
}

function generatePercentageFormula(pool: Triple[], randomFn: () => number): Formula {
  const triple = pickRandom(pool, randomFn);
  const positions: HiddenPosition[] = ['A', 'B', 'C'];
  const hiddenPosition = pickRandom(positions, randomFn);
  const values = [triple.a, triple.b, triple.c];
  const correctAnswer = values[positions.indexOf(hiddenPosition)];
  return { type: 'percentage', values, hiddenPosition, correctAnswer, timerDurationMs: NUMERIC_TIMER_MS };
}

// ── Ratio pool ───────────────────────────────────────────────────

export interface Quad { a: number; b: number; c: number; d: number }

export function buildRatioPool(): Quad[] {
  const pool: Quad[] = [];
  for (let a = 1; a <= 10; a++) {
    for (let b = 1; b <= 10; b++) {
      if (a === b) continue;
      for (let m = 2; m <= 8; m++) {
        const c = a * m;
        const d = b * m;
        if (c <= 100 && d <= 100) {
          pool.push({ a, b, c, d });
        }
      }
    }
  }
  return pool;
}

function generateRatioFormula(pool: Quad[], randomFn: () => number): Formula {
  const quad = pickRandom(pool, randomFn);
  const positions: HiddenPosition[] = ['A', 'B', 'C', 'D'];
  const hiddenPosition = pickRandom(positions, randomFn);
  const values = [quad.a, quad.b, quad.c, quad.d];
  const correctAnswer = values[positions.indexOf(hiddenPosition)];
  return { type: 'ratio', values, hiddenPosition, correctAnswer, timerDurationMs: NUMERIC_TIMER_MS };
}

// ── Fraction pool ────────────────────────────────────────────────

export function buildFractionPool(): Quad[] {
  const pool: Quad[] = [];
  for (let num = 1; num <= 10; num++) {
    for (let den = num + 1; den <= 12; den++) {
      for (let m = 2; m <= 8; m++) {
        const eqNum = num * m;
        const eqDen = den * m;
        if (eqNum <= 100 && eqDen <= 100) {
          pool.push({ a: num, b: den, c: eqNum, d: eqDen });
        }
      }
    }
  }
  return pool;
}

function generateFractionFormula(pool: Quad[], randomFn: () => number): Formula {
  const quad = pickRandom(pool, randomFn);
  const positions: HiddenPosition[] = ['A', 'B', 'C', 'D'];
  const hiddenPosition = pickRandom(positions, randomFn);
  const values = [quad.a, quad.b, quad.c, quad.d];
  const correctAnswer = values[positions.indexOf(hiddenPosition)];
  return { type: 'fraction', values, hiddenPosition, correctAnswer, timerDurationMs: NUMERIC_TIMER_MS };
}

// ── Multi-Item Ratio pool (Story Challenge) ──────────────────────
// "X items of type A at V₁ each, Y items of type B at V₂ each. Total of just type A?"

export const MULTI_ITEM_RATIO_KEYS: string[] = [
  'story.multiItemRatio.backpack',
  'story.multiItemRatio.lunchbox',
  'story.multiItemRatio.toybox',
  'story.multiItemRatio.garden',
  'story.multiItemRatio.shelf',
  'story.multiItemRatio.art',
];

export function buildMultiItemRatioPool(): Quad[] {
  const pool: Quad[] = [];
  for (let x = 2; x <= 8; x++) {
    for (let v1 = 2; v1 <= 50; v1++) {
      for (let y = 2; y <= 8; y++) {
        for (let v2 = 2; v2 <= 50; v2++) {
          if (v1 === v2) continue; // need different values for noise
          const answer = x * v1;
          if (answer >= 1 && answer <= 999) {
            pool.push({ a: x, b: v1, c: y, d: v2 });
          }
        }
      }
    }
  }
  // Pool is huge; we only need a manageable subset for random picks
  return pool.slice(0, 5000);
}

function generateMultiItemRatioFormula(pool: Quad[], randomFn: () => number): Formula {
  const quad = pickRandom(pool, randomFn);
  // values: [countA, valueA, countB, valueB]; answer = countA * valueA
  const values = [quad.a, quad.b, quad.c, quad.d];
  const correctAnswer = quad.a * quad.b;
  const wordProblemKey = pickRandom(MULTI_ITEM_RATIO_KEYS, randomFn);
  return { type: 'multiItemRatio', values, hiddenPosition: 'D', correctAnswer, wordProblemKey, timerDurationMs: STORY_TIMER_MS };
}

// ── Percentage of the Whole pool (Story Challenge) ───────────────
// "Group has X of A, Y of B, Z of C. What % are the [target]?"

export const PERCENTAGE_OF_WHOLE_KEYS: string[] = [
  'story.percentageOfWhole.petshop',
  'story.percentageOfWhole.classroom',
  'story.percentageOfWhole.orchard',
  'story.percentageOfWhole.aquarium',
  'story.percentageOfWhole.market',
  'story.percentageOfWhole.zoo',
];

export function buildPercentageOfWholePool(): Triple[] {
  const pool: Triple[] = [];
  // x = target count, y = other count 1, z = other count 2
  // answer = (x / (x+y+z)) * 100, must be integer
  for (let x = 1; x <= 20; x++) {
    for (let y = 1; y <= 20; y++) {
      for (let z = 1; z <= 20; z++) {
        const total = x + y + z;
        if (total < 10 || total > 50) continue;
        const pct = (x / total) * 100;
        if (Number.isInteger(pct) && pct >= 1 && pct <= 100) {
          pool.push({ a: x, b: y, c: pct });
        }
      }
    }
  }
  return pool;
}

function generatePercentageOfWholeFormula(pool: Triple[], randomFn: () => number): Formula {
  const triple = pickRandom(pool, randomFn);
  // values: [targetCount, otherCount, answerPercent]; noise = otherCount
  const values = [triple.a, triple.b, triple.c];
  const correctAnswer = triple.c;
  const wordProblemKey = pickRandom(PERCENTAGE_OF_WHOLE_KEYS, randomFn);
  return { type: 'percentageOfWhole', values, hiddenPosition: 'C', correctAnswer, wordProblemKey, timerDurationMs: STORY_TIMER_MS };
}

// ── Complex Extrapolation pool (Story Challenge) ─────────────────
// "If A units need B resources, how many resources do C units need?"

export const COMPLEX_EXTRAPOLATION_KEYS: string[] = [
  'story.complexExtrapolation.space',
  'story.complexExtrapolation.camping',
  'story.complexExtrapolation.baking',
  'story.complexExtrapolation.travel',
  'story.complexExtrapolation.sports',
  'story.complexExtrapolation.school',
];

export function buildComplexExtrapolationPool(): Quad[] {
  const pool: Quad[] = [];
  for (let rate = 2; rate <= 10; rate++) {
    for (let baseQty = 2; baseQty <= 8; baseQty++) {
      for (let targetQty = 2; targetQty <= 12; targetQty++) {
        if (targetQty === baseQty) continue;
        const baseTotal = rate * baseQty;
        const answer = rate * targetQty;
        if (baseTotal <= 100 && answer <= 999) {
          pool.push({ a: baseQty, b: baseTotal, c: targetQty, d: answer });
        }
      }
    }
  }
  return pool;
}

function generateComplexExtrapolationFormula(pool: Quad[], randomFn: () => number): Formula {
  const quad = pickRandom(pool, randomFn);
  // Only hide D (the answer). Hiding C would make word problems unsolvable
  // since the player wouldn't know the target quantity.
  const hiddenPosition: HiddenPosition = 'D';
  const values = [quad.a, quad.b, quad.c, quad.d];
  const correctAnswer = quad.d;
  const wordProblemKey = pickRandom(WORD_PROBLEM_KEYS, randomFn);
  return { type: 'ruleOfThree', values, hiddenPosition, correctAnswer, wordProblemKey };
}

// ── Public API ───────────────────────────────────────────────────

/** Default distribution: 5 numeric (2 percentage, 2 ratio, 1 fraction) + 5 word problems (ruleOfThree). */
const DEFAULT_DISTRIBUTION: QuestionType[] = [
  'percentage', 'percentage',
  'ratio', 'ratio',
  'fraction',
  'ruleOfThree', 'ruleOfThree', 'ruleOfThree', 'ruleOfThree', 'ruleOfThree',
];

/**
 * Generates 10 proportional-reasoning questions for a single game.
 *
 * Distribution: 5 numeric (2 percentage, 2 ratio, 1 fraction) + 5 word problems (ruleOfThree).
 * Order is shuffled.
 */
export function generateFormulas(randomFn: () => number = Math.random): Formula[] {
  const pools = buildAllPools();

  // 5 Pure Numeric: 2+2+1, shuffled to pick which gets 1
  const numericTypes: QuestionType[] = ['percentage', 'percentage', 'ratio', 'ratio', 'fraction'];
  fisherYatesShuffle(numericTypes, randomFn);
  // Randomly give the 5th slot to one of the 3 types
  numericTypes[4] = pickRandom(PURE_NUMERIC_TYPES, randomFn);

  // 5 Story Challenge: 1 each guaranteed + 2 random
  const storyTypes: QuestionType[] = [
    'multiItemRatio', 'percentageOfWhole', 'complexExtrapolation',
    pickRandom(STORY_CHALLENGE_TYPES, randomFn),
    pickRandom(STORY_CHALLENGE_TYPES, randomFn),
  ];

  const allTypes = [...numericTypes, ...storyTypes];
  const formulas = allTypes.map((type) => generateFormulaByType(type, pools, randomFn));

  fisherYatesShuffle(formulas, randomFn);
  return formulas;
}

/**
 * Generates 10 formulas for an Improve game, maintaining the 5/5 split.
 *
 * 5 numeric rounds (percentage, ratio, fraction) biased toward challenging numeric types.
 * 5 word problem rounds (ruleOfThree) always.
 * Non-challenging numeric slots filled with balanced distribution.
 */
export function generateImproveFormulas(
  challengingItems: ChallengingItem[],
  randomFn: () => number = Math.random,
): Formula[] {
  const numericTypes: QuestionType[] = ['percentage', 'ratio', 'fraction'];

  // Build numeric distribution: 1 per type baseline + 2 extra biased toward challenges
  const numericCounts: Record<string, number> = {
    percentage: 1, ratio: 1, fraction: 1,
  };

  const challengeNumeric = challengingItems
    .filter((item) => numericTypes.includes(item.type))
    .map((item) => item.type);
  const uniqueNumericChallenges = [...new Set(challengeNumeric)];

  // Distribute 2 extra numeric slots
  if (uniqueNumericChallenges.length > 0) {
    for (let i = 0; i < 2; i++) {
      const t = uniqueNumericChallenges[i % uniqueNumericChallenges.length];
      numericCounts[t]++;
    }
  } else {
    // No numeric challenges — give extras to percentage and ratio
    numericCounts['percentage']++;
    numericCounts['ratio']++;
  }

  const percentagePool = buildPercentagePool();
  const ratioPool = buildRatioPool();
  const fractionPool = buildFractionPool();
  const ruleOfThreePool = buildRuleOfThreePool();

  const formulas: Formula[] = [];

  // Generate 5 numeric formulas
  for (const t of numericTypes) {
    for (let i = 0; i < numericCounts[t]; i++) {
      switch (t) {
        case 'percentage': formulas.push(generatePercentageFormula(percentagePool, randomFn)); break;
        case 'ratio':      formulas.push(generateRatioFormula(ratioPool, randomFn)); break;
        case 'fraction':   formulas.push(generateFractionFormula(fractionPool, randomFn)); break;
      }
    }
  }

  // Generate 5 word problem formulas
  for (let i = 0; i < 5; i++) {
    formulas.push(generateRuleOfThreeFormula(ruleOfThreePool, randomFn));
  }

  fisherYatesShuffle(formulas, randomFn);
  return formulas;
}

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
  // values: [countA, valueA, countB, valueB] — all visible in template as noise + data
  // Answer: countA * valueA (total of subset A) — not in values array
  const values = [quad.a, quad.b, quad.c, quad.d];
  const correctAnswer = quad.a * quad.b;
  const wordProblemKey = pickRandom(MULTI_ITEM_RATIO_KEYS, randomFn);
  // hiddenPosition 'D' is used for the answer preview display, but all template values stay visible
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
  const wordProblemKey = pickRandom(COMPLEX_EXTRAPOLATION_KEYS, randomFn);
  return { type: 'complexExtrapolation', values, hiddenPosition, correctAnswer, wordProblemKey, timerDurationMs: STORY_TIMER_MS };
}

// ── Formula generators by type ───────────────────────────────────

interface Pools {
  percentage: Triple[];
  ratio: Quad[];
  fraction: Quad[];
  multiItemRatio: Quad[];
  percentageOfWhole: Triple[];
  complexExtrapolation: Quad[];
}

function buildAllPools(): Pools {
  return {
    percentage: buildPercentagePool(),
    ratio: buildRatioPool(),
    fraction: buildFractionPool(),
    multiItemRatio: buildMultiItemRatioPool(),
    percentageOfWhole: buildPercentageOfWholePool(),
    complexExtrapolation: buildComplexExtrapolationPool(),
  };
}

function generateFormulaByType(type: QuestionType, pools: Pools, randomFn: () => number): Formula {
  switch (type) {
    case 'percentage': return generatePercentageFormula(pools.percentage, randomFn);
    case 'ratio':      return generateRatioFormula(pools.ratio, randomFn);
    case 'fraction':   return generateFractionFormula(pools.fraction, randomFn);
    case 'multiItemRatio': return generateMultiItemRatioFormula(pools.multiItemRatio, randomFn);
    case 'percentageOfWhole': return generatePercentageOfWholeFormula(pools.percentageOfWhole, randomFn);
    case 'complexExtrapolation': return generateComplexExtrapolationFormula(pools.complexExtrapolation, randomFn);
  }
}

// ── Public API ───────────────────────────────────────────────────

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
 * 5 story challenge rounds biased toward challenging story types.
 * Non-challenging slots filled with balanced distribution.
 */
export function generateImproveFormulas(
  challengingItems: ChallengingItem[],
  randomFn: () => number = Math.random,
): Formula[] {
  const pools = buildAllPools();

  // Map legacy ruleOfThree to complexExtrapolation
  const mappedItems = challengingItems.map((item) =>
    item.type === ('ruleOfThree' as string) ? { ...item, type: 'complexExtrapolation' as QuestionType } : item,
  );

  // Split challenging items by category
  const challengeNumeric = mappedItems.filter((i) => PURE_NUMERIC_TYPES.includes(i.type));
  const challengeStory = mappedItems.filter((i) => STORY_CHALLENGE_TYPES.includes(i.type));

  // Build 5 numeric slots: 1 per type baseline + 2 extra biased toward challenges
  const numericSlots: QuestionType[] = [...PURE_NUMERIC_TYPES];
  const uniqueNumericChallenges = [...new Set(challengeNumeric.map((i) => i.type))];
  for (let i = 0; i < 2; i++) {
    if (uniqueNumericChallenges.length > 0) {
      numericSlots.push(pickRandom(uniqueNumericChallenges, randomFn));
    } else {
      numericSlots.push(pickRandom(PURE_NUMERIC_TYPES, randomFn));
    }
  }

  // Build 5 story slots: 1 each guaranteed + 2 biased toward challenges
  const storySlots: QuestionType[] = [...STORY_CHALLENGE_TYPES];
  const uniqueStoryChallenges = [...new Set(challengeStory.map((i) => i.type))];
  for (let i = 0; i < 2; i++) {
    if (uniqueStoryChallenges.length > 0) {
      storySlots.push(pickRandom(uniqueStoryChallenges, randomFn));
    } else {
      storySlots.push(pickRandom(STORY_CHALLENGE_TYPES, randomFn));
    }
  }

  const allTypes = [...numericSlots, ...storySlots];
  const formulas = allTypes.map((type) => generateFormulaByType(type, pools, randomFn));

  fisherYatesShuffle(formulas, randomFn);
  return formulas;
}

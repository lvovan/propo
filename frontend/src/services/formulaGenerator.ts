import type { Formula, QuestionType, HiddenPosition, ChallengingItem } from '../types/game';

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
// A% of B = C, where C = A*B/100, all integers, 1 ≤ C ≤ 200, 4 ≤ B ≤ 200.

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
  return { type: 'percentage', values, hiddenPosition, correctAnswer };
}

// ── Ratio pool ───────────────────────────────────────────────────
// A : B = C : D, where C = A*m, D = B*m, m ∈ [2, 8].

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
  return { type: 'ratio', values, hiddenPosition, correctAnswer };
}

// ── Fraction pool ────────────────────────────────────────────────
// A/B = C/D (proper fractions: A < B), C = A*m, D = B*m.

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
  return { type: 'fraction', values, hiddenPosition, correctAnswer };
}

// ── Rule of Three pool ───────────────────────────────────────────
// Word problems: if A units → B total, then C units → D total.
// rate ∈ [1, 10], baseQty ∈ [2, 8], targetQty ∈ [2, 12] (≠ baseQty).

/** Available word-problem i18n template keys. */
export const WORD_PROBLEM_KEYS: string[] = [
  'ruleOfThree.shopping',
  'ruleOfThree.reading',
  'ruleOfThree.cooking',
  'ruleOfThree.travel',
  'ruleOfThree.art',
  'ruleOfThree.sports',
];

export function buildRuleOfThreePool(): Quad[] {
  const pool: Quad[] = [];
  for (let rate = 1; rate <= 10; rate++) {
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

function generateRuleOfThreeFormula(pool: Quad[], randomFn: () => number): Formula {
  const quad = pickRandom(pool, randomFn);
  // Hide either C (find target quantity) or D (find answer)
  const hiddenPosition: HiddenPosition = randomFn() < 0.5 ? 'C' : 'D';
  const values = [quad.a, quad.b, quad.c, quad.d];
  const correctAnswer = hiddenPosition === 'C' ? quad.c : quad.d;
  const wordProblemKey = pickRandom(WORD_PROBLEM_KEYS, randomFn);
  return { type: 'ruleOfThree', values, hiddenPosition, correctAnswer, wordProblemKey };
}

// ── Public API ───────────────────────────────────────────────────

/** Default distribution: 3 percentage, 2 ratio, 2 fraction, 3 ruleOfThree. */
const DEFAULT_DISTRIBUTION: QuestionType[] = [
  'percentage', 'percentage', 'percentage',
  'ratio', 'ratio',
  'fraction', 'fraction',
  'ruleOfThree', 'ruleOfThree', 'ruleOfThree',
];

/**
 * Generates 10 proportional-reasoning questions for a single game.
 *
 * Distribution: 3 percentage, 2 ratio, 2 fraction, 3 rule-of-three.
 * Order is shuffled.
 *
 * @param randomFn Optional RNG returning [0, 1). Defaults to Math.random.
 */
export function generateFormulas(randomFn: () => number = Math.random): Formula[] {
  const percentagePool = buildPercentagePool();
  const ratioPool = buildRatioPool();
  const fractionPool = buildFractionPool();
  const ruleOfThreePool = buildRuleOfThreePool();

  const formulas: Formula[] = DEFAULT_DISTRIBUTION.map((type) => {
    switch (type) {
      case 'percentage': return generatePercentageFormula(percentagePool, randomFn);
      case 'ratio':      return generateRatioFormula(ratioPool, randomFn);
      case 'fraction':   return generateFractionFormula(fractionPool, randomFn);
      case 'ruleOfThree': return generateRuleOfThreeFormula(ruleOfThreePool, randomFn);
    }
  });

  fisherYatesShuffle(formulas, randomFn);
  return formulas;
}

/**
 * Generates 10 formulas for an Improve game, biased toward challenging categories.
 *
 * If a single type is challenging, 6 questions of that type + 2 random + 2 random.
 * Multiple challenging types get proportionally more slots.
 * Non-challenging slots filled with a balanced random distribution.
 */
export function generateImproveFormulas(
  challengingItems: ChallengingItem[],
  randomFn: () => number = Math.random,
): Formula[] {
  const allTypes: QuestionType[] = ['percentage', 'ratio', 'fraction', 'ruleOfThree'];

  // Build a distribution: default 2 per type + extra for challenging ones
  const typeCounts: Record<QuestionType, number> = {
    percentage: 1, ratio: 1, fraction: 1, ruleOfThree: 1,
  };

  // Distribute 6 extra slots among challenging types (proportional to difficulty rank)
  const challengeTypes = challengingItems.map((item) => item.type);
  const uniqueChallengeTypes = [...new Set(challengeTypes)];
  let extraSlots = 6;

  if (uniqueChallengeTypes.length > 0) {
    const perType = Math.floor(extraSlots / uniqueChallengeTypes.length);
    let remainder = extraSlots - perType * uniqueChallengeTypes.length;
    for (const t of uniqueChallengeTypes) {
      typeCounts[t] += perType;
      if (remainder > 0) {
        typeCounts[t]++;
        remainder--;
      }
    }
  } else {
    // No specific challenges: even distribution
    for (const t of allTypes) {
      typeCounts[t] += Math.floor(extraSlots / 4);
    }
    // Distribute remainder
    let rem = extraSlots % 4;
    for (const t of allTypes) {
      if (rem <= 0) break;
      typeCounts[t]++;
      rem--;
    }
  }

  const percentagePool = buildPercentagePool();
  const ratioPool = buildRatioPool();
  const fractionPool = buildFractionPool();
  const ruleOfThreePool = buildRuleOfThreePool();

  const formulas: Formula[] = [];
  for (const t of allTypes) {
    for (let i = 0; i < typeCounts[t]; i++) {
      switch (t) {
        case 'percentage': formulas.push(generatePercentageFormula(percentagePool, randomFn)); break;
        case 'ratio':      formulas.push(generateRatioFormula(ratioPool, randomFn)); break;
        case 'fraction':   formulas.push(generateFractionFormula(fractionPool, randomFn)); break;
        case 'ruleOfThree': formulas.push(generateRuleOfThreeFormula(ruleOfThreePool, randomFn)); break;
      }
    }
  }

  fisherYatesShuffle(formulas, randomFn);
  return formulas;
}

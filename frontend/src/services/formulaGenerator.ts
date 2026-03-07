import type { Formula, QuestionType, HiddenPosition, ChallengingItem } from '../types/game';
import { PURE_NUMERIC_TYPES, STORY_CHALLENGE_TYPES } from '../types/game';
import { NUMERIC_TIMER_MS, STORY_TIMER_MS } from '../constants/scoring';

// ── Types ─────────────────────────────────────────────────────────

interface StoryTemplate { key: string; unitKey: string }

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

export const MULTI_ITEM_RATIO_TEMPLATES: StoryTemplate[] = [
  // g (grams)
  { key: 'story.multiItemRatio.backpack', unitKey: 'unit.g' },
  { key: 'story.multiItemRatio.kitchen', unitKey: 'unit.g' },
  { key: 'story.multiItemRatio.mail', unitKey: 'unit.g' },
  { key: 'story.multiItemRatio.toolbox', unitKey: 'unit.g' },
  { key: 'story.multiItemRatio.jewelry', unitKey: 'unit.g' },
  { key: 'story.multiItemRatio.geology', unitKey: 'unit.g' },
  { key: 'story.multiItemRatio.party', unitKey: 'unit.g' },
  // kg
  { key: 'story.multiItemRatio.grocery', unitKey: 'unit.kg' },
  { key: 'story.multiItemRatio.camping', unitKey: 'unit.kg' },
  { key: 'story.multiItemRatio.gym', unitKey: 'unit.kg' },
  { key: 'story.multiItemRatio.warehouse', unitKey: 'unit.kg' },
  { key: 'story.multiItemRatio.fishing', unitKey: 'unit.kg' },
  { key: 'story.multiItemRatio.pet', unitKey: 'unit.kg' },
  // cal
  { key: 'story.multiItemRatio.lunchbox', unitKey: 'unit.cal' },
  { key: 'story.multiItemRatio.cafeteria', unitKey: 'unit.cal' },
  { key: 'story.multiItemRatio.breakfast', unitKey: 'unit.cal' },
  { key: 'story.multiItemRatio.snack', unitKey: 'unit.cal' },
  { key: 'story.multiItemRatio.smoothie', unitKey: 'unit.cal' },
  { key: 'story.multiItemRatio.picnic', unitKey: 'unit.cal' },
  { key: 'story.multiItemRatio.dinner', unitKey: 'unit.cal' },
  // $
  { key: 'story.multiItemRatio.toybox', unitKey: 'unit.dollars' },
  { key: 'story.multiItemRatio.shop', unitKey: 'unit.dollars' },
  { key: 'story.multiItemRatio.bookstore', unitKey: 'unit.dollars' },
  { key: 'story.multiItemRatio.arcade', unitKey: 'unit.dollars' },
  { key: 'story.multiItemRatio.stationery', unitKey: 'unit.dollars' },
  { key: 'story.multiItemRatio.bakery', unitKey: 'unit.dollars' },
  { key: 'story.multiItemRatio.craft', unitKey: 'unit.dollars' },
  // cm
  { key: 'story.multiItemRatio.garden', unitKey: 'unit.cm' },
  { key: 'story.multiItemRatio.aquarium2', unitKey: 'unit.cm' },
  { key: 'story.multiItemRatio.model', unitKey: 'unit.cm' },
  { key: 'story.multiItemRatio.sewing', unitKey: 'unit.cm' },
  { key: 'story.multiItemRatio.paper', unitKey: 'unit.cm' },
  { key: 'story.multiItemRatio.terrarium', unitKey: 'unit.cm' },
  { key: 'story.multiItemRatio.music', unitKey: 'unit.cm' },
  // pages
  { key: 'story.multiItemRatio.shelf', unitKey: 'unit.pages' },
  { key: 'story.multiItemRatio.library', unitKey: 'unit.pages' },
  { key: 'story.multiItemRatio.homework', unitKey: 'unit.pages' },
  { key: 'story.multiItemRatio.reading', unitKey: 'unit.pages' },
  { key: 'story.multiItemRatio.magazine', unitKey: 'unit.pages' },
  // ml
  { key: 'story.multiItemRatio.art', unitKey: 'unit.ml' },
  { key: 'story.multiItemRatio.lab', unitKey: 'unit.ml' },
  { key: 'story.multiItemRatio.drink', unitKey: 'unit.ml' },
  { key: 'story.multiItemRatio.cleaning', unitKey: 'unit.ml' },
  { key: 'story.multiItemRatio.cooking', unitKey: 'unit.ml' },
  // L
  { key: 'story.multiItemRatio.pool', unitKey: 'unit.L' },
  { key: 'story.multiItemRatio.gardening', unitKey: 'unit.L' },
  // min
  { key: 'story.multiItemRatio.playlist', unitKey: 'unit.min' },
  { key: 'story.multiItemRatio.workout', unitKey: 'unit.min' },
  { key: 'story.multiItemRatio.gaming', unitKey: 'unit.min' },
  { key: 'story.multiItemRatio.cooking2', unitKey: 'unit.min' },
  // pts
  { key: 'story.multiItemRatio.quiz', unitKey: 'unit.pts' },
  { key: 'story.multiItemRatio.videogame', unitKey: 'unit.pts' },
  { key: 'story.multiItemRatio.contest', unitKey: 'unit.pts' },
  // m
  { key: 'story.multiItemRatio.fence', unitKey: 'unit.m' },
  { key: 'story.multiItemRatio.track', unitKey: 'unit.m' },
  { key: 'story.multiItemRatio.rope', unitKey: 'unit.m' },
  // extra kg/$
  { key: 'story.multiItemRatio.market2', unitKey: 'unit.kg' },
  { key: 'story.multiItemRatio.electronics', unitKey: 'unit.dollars' },
];

export const MULTI_ITEM_RATIO_KEYS: string[] = MULTI_ITEM_RATIO_TEMPLATES.map(t => t.key);

const FRIENDLY_VALUES = [2, 3, 4, 5, 10, 15, 20, 25, 50] as const;

export function buildMultiItemRatioPool(): Quad[] {
  const pool: Quad[] = [];
  for (let x = 2; x <= 8; x++) {
    for (const v1 of FRIENDLY_VALUES) {
      for (let y = 2; y <= 8; y++) {
        for (const v2 of FRIENDLY_VALUES) {
          if (v1 === v2) continue; // need different values for noise
          const answer = x * v1;
          if (answer >= 1 && answer <= 999) {
            pool.push({ a: x, b: v1, c: y, d: v2 });
          }
        }
      }
    }
  }
  return pool;
}

function generateMultiItemRatioFormula(pool: Quad[], randomFn: () => number): Formula {
  const quad = pickRandom(pool, randomFn);
  // values: [countA, valueA, countB, valueB] — all visible in template as noise + data
  // Answer: countA * valueA (total of subset A) — not in values array
  const values = [quad.a, quad.b, quad.c, quad.d];
  const correctAnswer = quad.a * quad.b;
  const template = pickRandom(MULTI_ITEM_RATIO_TEMPLATES, randomFn);
  // hiddenPosition 'D' is used for the answer preview display, but all template values stay visible
  return { type: 'multiItemRatio', values, hiddenPosition: 'D', correctAnswer, wordProblemKey: template.key, answerUnitKey: template.unitKey, timerDurationMs: STORY_TIMER_MS };
}

// ── Percentage of the Whole pool (Story Challenge) ───────────────
// "Group has X of A, Y of B, Z of C. What % are the [target]?"

export const PERCENTAGE_OF_WHOLE_TEMPLATES: StoryTemplate[] = [
  { key: 'story.percentageOfWhole.petshop', unitKey: 'unit.percent' },
  { key: 'story.percentageOfWhole.classroom', unitKey: 'unit.percent' },
  { key: 'story.percentageOfWhole.orchard', unitKey: 'unit.percent' },
  { key: 'story.percentageOfWhole.aquarium', unitKey: 'unit.percent' },
  { key: 'story.percentageOfWhole.market', unitKey: 'unit.percent' },
  { key: 'story.percentageOfWhole.zoo', unitKey: 'unit.percent' },
  { key: 'story.percentageOfWhole.school', unitKey: 'unit.percent' },
  { key: 'story.percentageOfWhole.parking', unitKey: 'unit.percent' },
  { key: 'story.percentageOfWhole.garden', unitKey: 'unit.percent' },
  { key: 'story.percentageOfWhole.library', unitKey: 'unit.percent' },
  { key: 'story.percentageOfWhole.farm', unitKey: 'unit.percent' },
  { key: 'story.percentageOfWhole.playlist', unitKey: 'unit.percent' },
  { key: 'story.percentageOfWhole.team', unitKey: 'unit.percent' },
  { key: 'story.percentageOfWhole.closet', unitKey: 'unit.percent' },
  { key: 'story.percentageOfWhole.bakery', unitKey: 'unit.percent' },
  { key: 'story.percentageOfWhole.pond', unitKey: 'unit.percent' },
  { key: 'story.percentageOfWhole.toolbox', unitKey: 'unit.percent' },
  { key: 'story.percentageOfWhole.camp', unitKey: 'unit.percent' },
  { key: 'story.percentageOfWhole.bus', unitKey: 'unit.percent' },
  { key: 'story.percentageOfWhole.fridge', unitKey: 'unit.percent' },
  { key: 'story.percentageOfWhole.beach', unitKey: 'unit.percent' },
  { key: 'story.percentageOfWhole.forest', unitKey: 'unit.percent' },
  { key: 'story.percentageOfWhole.jar', unitKey: 'unit.percent' },
  { key: 'story.percentageOfWhole.science', unitKey: 'unit.percent' },
  { key: 'story.percentageOfWhole.race', unitKey: 'unit.percent' },
  { key: 'story.percentageOfWhole.collection', unitKey: 'unit.percent' },
  { key: 'story.percentageOfWhole.basket', unitKey: 'unit.percent' },
  { key: 'story.percentageOfWhole.desk', unitKey: 'unit.percent' },
  { key: 'story.percentageOfWhole.band', unitKey: 'unit.percent' },
  { key: 'story.percentageOfWhole.cinema', unitKey: 'unit.percent' },
  { key: 'story.percentageOfWhole.shoes', unitKey: 'unit.percent' },
  { key: 'story.percentageOfWhole.park', unitKey: 'unit.percent' },
  { key: 'story.percentageOfWhole.chocolate', unitKey: 'unit.percent' },
  { key: 'story.percentageOfWhole.chess', unitKey: 'unit.percent' },
  { key: 'story.percentageOfWhole.aviary', unitKey: 'unit.percent' },
  { key: 'story.percentageOfWhole.toystore', unitKey: 'unit.percent' },
  { key: 'story.percentageOfWhole.lab', unitKey: 'unit.percent' },
  { key: 'story.percentageOfWhole.field', unitKey: 'unit.percent' },
  { key: 'story.percentageOfWhole.train', unitKey: 'unit.percent' },
  { key: 'story.percentageOfWhole.farmers', unitKey: 'unit.percent' },
  { key: 'story.percentageOfWhole.tank', unitKey: 'unit.percent' },
  { key: 'story.percentageOfWhole.museum', unitKey: 'unit.percent' },
  { key: 'story.percentageOfWhole.lunch', unitKey: 'unit.percent' },
  { key: 'story.percentageOfWhole.gym', unitKey: 'unit.percent' },
  { key: 'story.percentageOfWhole.veggie', unitKey: 'unit.percent' },
  { key: 'story.percentageOfWhole.scouts', unitKey: 'unit.percent' },
  { key: 'story.percentageOfWhole.traffic', unitKey: 'unit.percent' },
  { key: 'story.percentageOfWhole.spices', unitKey: 'unit.percent' },
  { key: 'story.percentageOfWhole.airport', unitKey: 'unit.percent' },
  { key: 'story.percentageOfWhole.reef', unitKey: 'unit.percent' },
  { key: 'story.percentageOfWhole.candy', unitKey: 'unit.percent' },
  { key: 'story.percentageOfWhole.theater', unitKey: 'unit.percent' },
  { key: 'story.percentageOfWhole.safari', unitKey: 'unit.percent' },
  { key: 'story.percentageOfWhole.garage', unitKey: 'unit.percent' },
  { key: 'story.percentageOfWhole.studio', unitKey: 'unit.percent' },
  { key: 'story.percentageOfWhole.shelter', unitKey: 'unit.percent' },
  { key: 'story.percentageOfWhole.carnival', unitKey: 'unit.percent' },
  { key: 'story.percentageOfWhole.island', unitKey: 'unit.percent' },
  { key: 'story.percentageOfWhole.arcade', unitKey: 'unit.percent' },
  { key: 'story.percentageOfWhole.hospital', unitKey: 'unit.percent' },
];

export const PERCENTAGE_OF_WHOLE_KEYS: string[] = PERCENTAGE_OF_WHOLE_TEMPLATES.map(t => t.key);

const FRIENDLY_WHOLE_PERCENTAGES = new Set([10, 20, 25, 50, 75]);

export function buildPercentageOfWholePool(): Triple[] {
  const pool: Triple[] = [];
  // a = target count, b = other count, c = total (a + b + remaining)
  // answer = (a / c) * 100, must be a friendly percentage
  for (let x = 1; x <= 20; x++) {
    for (let y = 1; y <= 20; y++) {
      for (let z = 1; z <= 20; z++) {
        const total = x + y + z;
        if (total < 10 || total > 50) continue;
        const pct = (x / total) * 100;
        if (FRIENDLY_WHOLE_PERCENTAGES.has(pct)) {
          pool.push({ a: x, b: y, c: total });
        }
      }
    }
  }
  return pool;
}

function generatePercentageOfWholeFormula(pool: Triple[], randomFn: () => number): Formula {
  const triple = pickRandom(pool, randomFn);
  // values: [targetCount, otherCount, total] — template uses {a}, {b}, {c}
  const values = [triple.a, triple.b, triple.c];
  const correctAnswer = (triple.a / triple.c) * 100; // integer by pool construction
  const template = pickRandom(PERCENTAGE_OF_WHOLE_TEMPLATES, randomFn);
  return { type: 'percentageOfWhole', values, hiddenPosition: 'C', correctAnswer, wordProblemKey: template.key, answerUnitKey: template.unitKey, timerDurationMs: STORY_TIMER_MS };
}

// ── Complex Extrapolation pool (Story Challenge) ─────────────────
// "If A units need B resources, how many resources do C units need?"

export const COMPLEX_EXTRAPOLATION_TEMPLATES: StoryTemplate[] = [
  { key: 'story.complexExtrapolation.space', unitKey: 'unit.tanks' },
  { key: 'story.complexExtrapolation.camping', unitKey: 'unit.pegs' },
  { key: 'story.complexExtrapolation.baking', unitKey: 'unit.eggs' },
  { key: 'story.complexExtrapolation.travel', unitKey: 'unit.litres' },
  { key: 'story.complexExtrapolation.sports', unitKey: 'unit.balls' },
  { key: 'story.complexExtrapolation.school', unitKey: 'unit.brushes' },
  { key: 'story.complexExtrapolation.party', unitKey: 'unit.plates' },
  { key: 'story.complexExtrapolation.garden', unitKey: 'unit.seeds' },
  { key: 'story.complexExtrapolation.construction', unitKey: 'unit.bricks' },
  { key: 'story.complexExtrapolation.reading', unitKey: 'unit.chapters' },
  { key: 'story.complexExtrapolation.classroom', unitKey: 'unit.chairs' },
  { key: 'story.complexExtrapolation.pizza', unitKey: 'unit.slices' },
  { key: 'story.complexExtrapolation.sewing', unitKey: 'unit.buttons' },
  { key: 'story.complexExtrapolation.painting', unitKey: 'unit.cans' },
  { key: 'story.complexExtrapolation.racing', unitKey: 'unit.tyres' },
  { key: 'story.complexExtrapolation.orchestra', unitKey: 'unit.strings' },
  { key: 'story.complexExtrapolation.aquarium', unitKey: 'unit.fish' },
  { key: 'story.complexExtrapolation.hiking', unitKey: 'unit.bottles' },
  { key: 'story.complexExtrapolation.science', unitKey: 'unit.tubes' },
  { key: 'story.complexExtrapolation.kennel', unitKey: 'unit.treats' },
  { key: 'story.complexExtrapolation.bike', unitKey: 'unit.spokes' },
  { key: 'story.complexExtrapolation.concert', unitKey: 'unit.seats' },
  { key: 'story.complexExtrapolation.beading', unitKey: 'unit.beads' },
  { key: 'story.complexExtrapolation.hotel', unitKey: 'unit.towels' },
  { key: 'story.complexExtrapolation.woodwork', unitKey: 'unit.nails' },
  { key: 'story.complexExtrapolation.yearbook', unitKey: 'unit.photos' },
  { key: 'story.complexExtrapolation.delivery', unitKey: 'unit.packages' },
  { key: 'story.complexExtrapolation.greenhouse', unitKey: 'unit.pots' },
  { key: 'story.complexExtrapolation.diving', unitKey: 'unit.tanks' },
  { key: 'story.complexExtrapolation.archery', unitKey: 'unit.arrows' },
  { key: 'story.complexExtrapolation.cinema', unitKey: 'unit.buckets' },
  { key: 'story.complexExtrapolation.flight', unitKey: 'unit.snacks' },
  { key: 'story.complexExtrapolation.soccer', unitKey: 'unit.cones' },
  { key: 'story.complexExtrapolation.train', unitKey: 'unit.windows' },
  { key: 'story.complexExtrapolation.picnic', unitKey: 'unit.blankets' },
  { key: 'story.complexExtrapolation.school2', unitKey: 'unit.desks' },
  { key: 'story.complexExtrapolation.printing', unitKey: 'unit.sheets' },
  { key: 'story.complexExtrapolation.magic', unitKey: 'unit.cards' },
  { key: 'story.complexExtrapolation.robotics', unitKey: 'unit.batteries' },
  { key: 'story.complexExtrapolation.theater', unitKey: 'unit.props' },
  { key: 'story.complexExtrapolation.stables', unitKey: 'unit.carrots' },
  { key: 'story.complexExtrapolation.monkeys', unitKey: 'unit.bananas' },
  { key: 'story.complexExtrapolation.fair', unitKey: 'unit.prizes' },
  { key: 'story.complexExtrapolation.scouts', unitKey: 'unit.stakes' },
  { key: 'story.complexExtrapolation.lemonade', unitKey: 'unit.lemons' },
  { key: 'story.complexExtrapolation.sandcastle', unitKey: 'unit.buckets' },
  { key: 'story.complexExtrapolation.birthday', unitKey: 'unit.candles' },
  { key: 'story.complexExtrapolation.festival', unitKey: 'unit.cups' },
  { key: 'story.complexExtrapolation.garden2', unitKey: 'unit.bags' },
  { key: 'story.complexExtrapolation.safari', unitKey: 'unit.bottles' },
  { key: 'story.complexExtrapolation.skiing', unitKey: 'unit.helmets' },
  { key: 'story.complexExtrapolation.origami', unitKey: 'unit.sheets' },
  { key: 'story.complexExtrapolation.planting', unitKey: 'unit.saplings' },
  { key: 'story.complexExtrapolation.farm', unitKey: 'unit.eggs' },
  { key: 'story.complexExtrapolation.pool', unitKey: 'unit.litres' },
  { key: 'story.complexExtrapolation.camping2', unitKey: 'unit.bottles' },
  { key: 'story.complexExtrapolation.canteen', unitKey: 'unit.cups' },
  { key: 'story.complexExtrapolation.beach', unitKey: 'unit.towels' },
  { key: 'story.complexExtrapolation.relay', unitKey: 'unit.batons' },
  { key: 'story.complexExtrapolation.cleaning', unitKey: 'unit.sponges' },
];

export const COMPLEX_EXTRAPOLATION_KEYS: string[] = COMPLEX_EXTRAPOLATION_TEMPLATES.map(t => t.key);

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
  const template = pickRandom(COMPLEX_EXTRAPOLATION_TEMPLATES, randomFn);
  return { type: 'complexExtrapolation', values, hiddenPosition, correctAnswer, wordProblemKey: template.key, answerUnitKey: template.unitKey, timerDurationMs: STORY_TIMER_MS };
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

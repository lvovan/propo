# Contract: QuestionType & Formula Interfaces

**Feature**: 033-question-type-ui-fixes

## QuestionType (modified)

```typescript
// BEFORE
export type QuestionType = 'percentage' | 'ratio' | 'fraction' | 'multiItemRatio' | 'percentageOfWhole' | 'complexExtrapolation';
export const PURE_NUMERIC_TYPES: QuestionType[] = ['percentage', 'ratio', 'fraction'];

// AFTER
export type QuestionType = 'percentage' | 'fraction' | 'multiItemRatio' | 'percentageOfWhole' | 'complexExtrapolation';
export const PURE_NUMERIC_TYPES: QuestionType[] = ['percentage', 'fraction'];
```

## generateFormulas() — Numeric Distribution (modified)

```typescript
// BEFORE: 5 numeric slots
const numericTypes: QuestionType[] = ['percentage', 'percentage', 'ratio', 'ratio', 'fraction'];
fisherYatesShuffle(numericTypes, randomFn);
numericTypes[4] = pickRandom(PURE_NUMERIC_TYPES, randomFn);  // random from [percentage, ratio, fraction]

// AFTER: 5 numeric slots
const numericTypes: QuestionType[] = ['percentage', 'percentage', 'fraction', 'fraction'];
numericTypes.push(pickRandom(PURE_NUMERIC_TYPES, randomFn));  // random from [percentage, fraction]
fisherYatesShuffle(numericTypes, randomFn);
```

## generatePercentageOfWholeFormula() — Multi-Target (modified)

```typescript
// BEFORE
function generatePercentageOfWholeFormula(pool: Triple[], randomFn: () => number): Formula {
  const triple = pickRandom(pool, randomFn);
  const bPct = (triple.b / triple.c) * 100;
  const canSwap = FRIENDLY_WHOLE_PERCENTAGES.has(bPct);
  const shouldSwap = canSwap && randomFn() < 0.5;
  const targetCount = shouldSwap ? triple.b : triple.a;
  const otherCount = shouldSwap ? triple.a : triple.b;
  const values = [targetCount, otherCount, triple.c];
  const correctAnswer = (targetCount / triple.c) * 100;
  const template = pickRandom(PERCENTAGE_OF_WHOLE_TEMPLATES, randomFn);
  return { type: 'percentageOfWhole', values, hiddenPosition: 'C', correctAnswer, wordProblemKey: template.key, answerUnitKey: template.unitKey, timerDurationMs: STORY_TIMER_MS };
}

// AFTER — 3-target selection with fallback
function generatePercentageOfWholeFormula(pool: Triple[], randomFn: () => number): Formula {
  const triple = pickRandom(pool, randomFn);
  const template = pickRandom(PERCENTAGE_OF_WHOLE_TEMPLATES, randomFn);
  
  // Compute percentages for all three target options
  const aPct = (triple.a / triple.c) * 100;  // always valid (pool invariant)
  const bPct = (triple.b / triple.c) * 100;
  const combinedPct = ((triple.a + triple.b) / triple.c) * 100;

  // Build list of valid targets
  type Target = 'first' | 'second' | 'combined';
  const validTargets: Target[] = ['first'];  // 'first' always valid
  if (FRIENDLY_WHOLE_PERCENTAGES.has(bPct)) validTargets.push('second');
  if (FRIENDLY_WHOLE_PERCENTAGES.has(combinedPct)) validTargets.push('combined');

  // Deterministic random selection from valid targets
  const target = validTargets[Math.floor(randomFn() * validTargets.length)];

  let values: number[];
  let correctAnswer: number;
  let wordProblemKey: string;

  switch (target) {
    case 'first':
      values = [triple.a, triple.b, triple.c];
      correctAnswer = aPct;
      wordProblemKey = template.key;
      break;
    case 'second':
      values = [triple.b, triple.a, triple.c];
      correctAnswer = bPct;
      wordProblemKey = template.key;
      break;
    case 'combined':
      values = [triple.a, triple.b, triple.c];
      correctAnswer = combinedPct;
      wordProblemKey = template.key + '.combined';
      break;
  }

  return { type: 'percentageOfWhole', values, hiddenPosition: 'C', correctAnswer, wordProblemKey, answerUnitKey: template.unitKey, timerDurationMs: STORY_TIMER_MS };
}
```

## challengeAnalyzer — Legacy Mapping (modified)

```typescript
// BEFORE
const type: QuestionType = (round.type as string) === 'ruleOfThree' ? 'complexExtrapolation' : round.type;

// AFTER
const rawType = round.type as string;
const type: QuestionType = rawType === 'ruleOfThree' ? 'complexExtrapolation'
  : rawType === 'ratio' ? 'fraction'
  : round.type;
```

## CATEGORY_LABEL_KEYS (modified)

```typescript
// BEFORE
const CATEGORY_LABEL_KEYS: Record<QuestionType, string> = {
  percentage: 'questionType.percentage',
  ratio: 'questionType.ratio',
  fraction: 'questionType.fraction',
  multiItemRatio: 'questionType.multiItemRatio',
  percentageOfWhole: 'questionType.percentageOfWhole',
  complexExtrapolation: 'questionType.complexExtrapolation',
};

// AFTER
const CATEGORY_LABEL_KEYS: Record<QuestionType, string> = {
  percentage: 'questionType.percentage',
  fraction: 'questionType.fraction',
  multiItemRatio: 'questionType.multiItemRatio',
  percentageOfWhole: 'questionType.percentageOfWhole',
  complexExtrapolation: 'questionType.complexExtrapolation',
};
```

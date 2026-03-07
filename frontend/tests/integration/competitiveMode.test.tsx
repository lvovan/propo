import { describe, it, expect } from 'vitest';
import { generateFormulas } from '../../src/services/formulaGenerator';
import { createSeededRandomFromString } from '../../src/services/seededRandom';
import { calculateTotalTime, formatTotalTime } from '../../src/services/totalTime';
import { encodeShareUrl, decodeShareUrl } from '../../src/services/shareUrl';
import { gameReducer, initialGameState, getCorrectAnswer, getCurrentRound } from '../../src/services/gameEngine';
import { calculateCompetitiveScore } from '../../src/constants/scoring';
import type { Round } from '../../src/types/game';

describe('Competitive Mode Integration', () => {
  it('full competitive flow: seed → formulas → play 10 rounds → results → share', () => {
    const seed = 'integration-test-seed';

    // 1. Generate formulas from seed
    const randomFn = createSeededRandomFromString(seed);
    const formulas = generateFormulas(randomFn);
    expect(formulas.length).toBe(10);

    // 2. Start competitive game
    let state = gameReducer(initialGameState, {
      type: 'START_GAME',
      formulas,
      mode: 'competitive',
      seed,
    });
    expect(state.status).toBe('playing');
    expect(state.gameMode).toBe('competitive');
    expect(state.seed).toBe(seed);

    // 3. Answer all 10 rounds (some correct, some wrong)
    for (let i = 0; i < 10; i++) {
      const round = getCurrentRound(state)!;
      const correctAnswer = getCorrectAnswer(round.formula);
      // Answer first 7 correctly, last 3 incorrectly
      const answer = i < 7 ? correctAnswer : correctAnswer + 1;
      state = gameReducer(state, { type: 'SUBMIT_ANSWER', answer, elapsedMs: 2000 + i * 100 });
      state = gameReducer(state, { type: 'NEXT_ROUND' });
    }

    // 4. Should be completed (no replay for competitive)
    expect(state.status).toBe('completed');

    // 5. Verify competitive scoring (point-decay model)
    // Each round uses point-decay: points = floor(10 - 9 * elapsed/timer)
    // All rounds have timerDurationMs=20000, elapsedMs ranges from 2000-2900
    // Correct rounds (0-6): positive points; Incorrect rounds (7-9): negative points
    for (let i = 0; i < 10; i++) {
      const round = state.rounds[i];
      const elapsedMs = 2000 + i * 100;
      const expectedPoints = calculateCompetitiveScore(i < 7, elapsedMs, round.formula.timerDurationMs);
      expect(round.points).toBe(expectedPoints);
    }

    // 6. Generate share URL (no time, only score)
    const shareResult = {
      seed,
      playerName: 'TestPlayer',
      score: state.score,
    };
    const url = encodeShareUrl(shareResult);
    expect(url).toContain('#/result');
    expect(url).toContain(`seed=${seed}`);
    expect(url).not.toContain('time=');

    // 7. Decode share URL
    const hash = '#' + url.split('#')[1];
    const decoded = decodeShareUrl(hash);
    expect(decoded).not.toBeNull();
    expect(decoded!.seed).toBe(seed);
    expect(decoded!.playerName).toBe('TestPlayer');
    expect(decoded!.score).toBe(state.score);
  });

  it('determinism: same seed produces identical questions across runs', () => {
    const seed = 'determinism-check';

    // Run 1
    const formulas1 = generateFormulas(createSeededRandomFromString(seed));
    // Run 2
    const formulas2 = generateFormulas(createSeededRandomFromString(seed));

    expect(formulas1).toEqual(formulas2);

    // Verify question details match
    for (let i = 0; i < 10; i++) {
      expect(formulas1[i].type).toBe(formulas2[i].type);
      expect(formulas1[i].values).toEqual(formulas2[i].values);
      expect(formulas1[i].hiddenPosition).toBe(formulas2[i].hiddenPosition);
      expect(formulas1[i].correctAnswer).toBe(formulas2[i].correctAnswer);
    }
  });

  it('different seeds produce different questions', () => {
    const f1 = generateFormulas(createSeededRandomFromString('seed-A'));
    const f2 = generateFormulas(createSeededRandomFromString('seed-B'));

    // At least one question should differ
    const allSame = f1.every((q, i) =>
      q.type === f2[i].type &&
      q.correctAnswer === f2[i].correctAnswer &&
      q.hiddenPosition === f2[i].hiddenPosition &&
      JSON.stringify(q.values) === JSON.stringify(f2[i].values)
    );
    expect(allSame).toBe(false);
  });

  it('competitive mode skips replay even with wrong answers', () => {
    const formulas = generateFormulas(createSeededRandomFromString('replay-test'));

    let state = gameReducer(initialGameState, {
      type: 'START_GAME',
      formulas,
      mode: 'competitive',
      seed: 'replay-test',
    });

    // Answer ALL 10 rounds incorrectly
    for (let i = 0; i < 10; i++) {
      const round = getCurrentRound(state)!;
      const wrongAnswer = getCorrectAnswer(round.formula) + 999;
      state = gameReducer(state, { type: 'SUBMIT_ANSWER', answer: wrongAnswer, elapsedMs: 1000 });
      state = gameReducer(state, { type: 'NEXT_ROUND' });
    }

    // Should go directly to completed, never to replay
    expect(state.status).toBe('completed');
    expect(state.rounds.filter((r: Round) => r.isCorrect).length).toBe(0);
  });

  it('total time penalty: 1 minute per wrong answer', () => {
    const rounds: Round[] = Array.from({ length: 10 }, (_, i) => ({
      formula: { type: 'percentage' as const, values: [10, 100, 10], hiddenPosition: 'C' as const, correctAnswer: 10, timerDurationMs: 20000 },
      playerAnswer: i < 8 ? 10 : 99,
      isCorrect: i < 8,
      elapsedMs: 3000,
      points: i < 8 ? 5 : -2,
      firstTryCorrect: i < 8,
    }));

    const totalTime = calculateTotalTime(rounds);
    // 10 × 3000ms = 30000ms base
    // 2 wrong × 60000ms = 120000ms penalty
    expect(totalTime).toBe(30000 + 120000);
    expect(formatTotalTime(totalTime)).toBe('2m 30.0s');
  });
});

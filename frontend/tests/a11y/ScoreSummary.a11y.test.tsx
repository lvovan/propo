import { describe, it, expect } from 'vitest';
import { render } from '../test-utils';
import { axe } from 'vitest-axe';
import ScoreSummary from '../../src/components/GamePlay/ScoreSummary/ScoreSummary';
import type { Round } from '../../src/types/game';
import { vi } from 'vitest';

function createMockRounds(): Round[] {
  return [
    {
      formula: { type: 'percentage', values: [25, 80, 20], hiddenPosition: 'C', correctAnswer: 20 },
      playerAnswer: 20,
      isCorrect: true,
      elapsedMs: 1500,
      points: 5,
      firstTryCorrect: true,
    },
    {
      formula: { type: 'percentage', values: [20, 20, 4], hiddenPosition: 'A', correctAnswer: 20 },
      playerAnswer: 20,
      isCorrect: true,
      elapsedMs: 2500,
      points: 3,
      firstTryCorrect: true,
    },
    {
      formula: { type: 'ratio', values: [2, 3, 6, 9], hiddenPosition: 'B', correctAnswer: 3 },
      playerAnswer: 9,
      isCorrect: false,
      elapsedMs: 3000,
      points: -2,
      firstTryCorrect: false,
    },
  ];
}

describe('ScoreSummary accessibility (Improve mode)', () => {
  it('passes axe check in improve mode with incorrect pairs', async () => {
    const rounds = createMockRounds();
    const { container } = render(
      <ScoreSummary
        rounds={rounds}
        score={6}
        onPlayAgain={vi.fn()}
        onBackToMenu={vi.fn()}
        gameMode="improve"
      />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('passes axe check in improve mode with all correct', async () => {
    const rounds: Round[] = [
      {
        formula: { type: 'percentage', values: [25, 80, 20], hiddenPosition: 'C', correctAnswer: 20 },
        playerAnswer: 20,
        isCorrect: true,
        elapsedMs: 1500,
        points: 5,
        firstTryCorrect: true,
      },
    ];
    const { container } = render(
      <ScoreSummary
        rounds={rounds}
        score={5}
        onPlayAgain={vi.fn()}
        onBackToMenu={vi.fn()}
        gameMode="improve"
      />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('passes axe check in play mode', async () => {
    const rounds = createMockRounds();
    const { container } = render(
      <ScoreSummary
        rounds={rounds}
        score={6}
        onPlayAgain={vi.fn()}
        onBackToMenu={vi.fn()}
        gameMode="play"
      />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

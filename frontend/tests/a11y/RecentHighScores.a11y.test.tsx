import { describe, it, expect } from 'vitest';
import { render } from '../test-utils';
import { axe } from 'vitest-axe';
import RecentHighScores from '../../src/components/GamePlay/RecentHighScores/RecentHighScores';
import type { GameRecord } from '../../src/types/player';

const sampleScores: GameRecord[] = [
  { score: 45, completedAt: 500 },
  { score: 38, completedAt: 400 },
];

describe('RecentHighScores accessibility', () => {
  it('passes axe check with scores and subtitle', async () => {
    const { container } = render(
      <RecentHighScores scores={sampleScores} isEmpty={false} />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('passes axe check when empty with subtitle', async () => {
    const { container } = render(
      <RecentHighScores scores={[]} isEmpty={true} />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

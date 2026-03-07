import { describe, it, expect } from 'vitest';
import { render } from '../test-utils';
import { axe } from 'vitest-axe';
import CompetitionSetup from '../../src/components/GamePlay/CompetitionSetup/CompetitionSetup';
import { vi } from 'vitest';

describe('CompetitionSetup a11y', () => {
  it('has no accessibility violations with empty seed', async () => {
    const { container } = render(
      <CompetitionSetup onStart={vi.fn()} onBack={vi.fn()} />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no accessibility violations with pre-filled seed', async () => {
    const { container } = render(
      <CompetitionSetup onStart={vi.fn()} onBack={vi.fn()} initialSeed="test123" />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

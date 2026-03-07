import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test-utils';
import { axe } from 'vitest-axe';
import FormulaDisplay from '../../src/components/GamePlay/FormulaDisplay/FormulaDisplay';
import type { Formula } from '../../src/types/game';

describe('FormulaDisplay accessibility', () => {
  const formula: Formula = {
    type: 'percentage',
    values: [25, 80, 20],
    hiddenPosition: 'C',
    correctAnswer: 20, timerDurationMs: 20000,
  };

  it('passes axe checks during input phase with pulsing', async () => {
    const { container } = render(
      <FormulaDisplay formula={formula} isInputPhase={true} />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('passes axe checks during input phase with typed digits', async () => {
    const { container } = render(
      <FormulaDisplay formula={formula} typedDigits="42" isInputPhase={true} />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('passes axe checks during feedback phase', async () => {
    const { container } = render(
      <FormulaDisplay formula={formula} playerAnswer={21} isInputPhase={false} />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has role="math" attribute', () => {
    render(<FormulaDisplay formula={formula} isInputPhase={true} />);
    expect(screen.getByRole('math')).toBeInTheDocument();
  });

  it('has aria-label attribute', () => {
    render(<FormulaDisplay formula={formula} isInputPhase={true} />);
    const math = screen.getByRole('math');
    expect(math).toHaveAttribute('aria-label');
    expect(math.getAttribute('aria-label')).toBeTruthy();
  });
});

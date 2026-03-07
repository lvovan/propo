import { describe, it, expect } from 'vitest';
import { render, screen } from '../test-utils';
import FormulaDisplay from '../../src/components/GamePlay/FormulaDisplay/FormulaDisplay';
import type { Formula } from '../../src/types/game';

describe('FormulaDisplay', () => {
  const percentageFormula: Formula = {
    type: 'percentage',
    values: [25, 80, 20],
    hiddenPosition: 'C',
    correctAnswer: 20, timerDurationMs: 20000,
  };

  const ratioFormula: Formula = {
    type: 'ratio',
    values: [2, 3, 6, 9],
    hiddenPosition: 'D',
    correctAnswer: 9, timerDurationMs: 20000,
  };

  const fractionFormula: Formula = {
    type: 'fraction',
    values: [2, 5, 4, 10],
    hiddenPosition: 'D',
    correctAnswer: 10, timerDurationMs: 20000,
  };

  const storyFormula: Formula = {
    type: 'complexExtrapolation',
    values: [3, 6, 9, 18],
    hiddenPosition: 'D',
    correctAnswer: 18,
    wordProblemKey: 'story.complexExtrapolation.baking',
    timerDurationMs: 50000,
  };

  it('renders percentage formula with hidden result', () => {
    render(<FormulaDisplay formula={percentageFormula} />);
    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('80')).toBeInTheDocument();
    expect(screen.getByText('?')).toBeInTheDocument();
    expect(screen.queryByText('20')).not.toBeInTheDocument();
  });

  it('renders ratio formula with hidden value', () => {
    render(<FormulaDisplay formula={ratioFormula} />);
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('6')).toBeInTheDocument();
    expect(screen.getByText('?')).toBeInTheDocument();
    expect(screen.queryByText('9')).not.toBeInTheDocument();
  });

  it('renders fraction formula', () => {
    render(<FormulaDisplay formula={fractionFormula} />);
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('?')).toBeInTheDocument();
  });

  it('renders story challenge with answer preview in play mode', () => {
    render(<FormulaDisplay formula={storyFormula} />);
    expect(screen.getByText(/cakes/)).toBeInTheDocument();
    // Answer preview shows "?" placeholder
    expect(screen.getByText('?')).toBeInTheDocument();
    // Numeric proportion (→) should NOT be shown in play mode
    expect(screen.queryByText('→')).not.toBeInTheDocument();
  });

  it('renders rule-of-three word problem with answer preview showing typed digits', () => {
    render(<FormulaDisplay formula={storyFormula} typedDigits="42" />);
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.queryByText('?')).not.toBeInTheDocument();
  });

  it('renders story challenge with numeric proportion in improve mode', () => {
    render(<FormulaDisplay formula={storyFormula} gameMode="improve" />);
    expect(screen.getByText(/cakes/)).toBeInTheDocument();
    // Numeric proportion SHOULD be shown in improve mode
    expect(screen.getByText('6')).toBeInTheDocument();
  });

  it('has accessible math role', () => {
    render(<FormulaDisplay formula={percentageFormula} />);
    const math = screen.getByRole('math');
    expect(math).toBeInTheDocument();
    expect(math).toHaveAttribute('aria-label');
  });

  describe('playerAnswer prop', () => {
    it('shows player answer instead of ?', () => {
      render(<FormulaDisplay formula={percentageFormula} playerAnswer={38} />);
      expect(screen.getByText('38')).toBeInTheDocument();
      expect(screen.queryByText('?')).not.toBeInTheDocument();
    });
  });

  describe('typedDigits prop', () => {
    it('shows typed digits in hidden slot', () => {
      render(<FormulaDisplay formula={percentageFormula} typedDigits="42" />);
      expect(screen.getByText('42')).toBeInTheDocument();
      expect(screen.queryByText('?')).not.toBeInTheDocument();
    });

    it('shows ? when typedDigits is empty', () => {
      render(<FormulaDisplay formula={percentageFormula} typedDigits="" />);
      expect(screen.getByText('?')).toBeInTheDocument();
    });

    it('playerAnswer takes precedence over typedDigits', () => {
      render(<FormulaDisplay formula={percentageFormula} playerAnswer={38} typedDigits="4" />);
      expect(screen.getByText('38')).toBeInTheDocument();
      expect(screen.queryByText('4')).not.toBeInTheDocument();
    });
  });

  describe('isInputPhase prop', () => {
    it('applies pulsing class when isInputPhase is true', () => {
      render(<FormulaDisplay formula={percentageFormula} isInputPhase={true} />);
      const hiddenSpan = screen.getByText('?');
      expect(hiddenSpan.className).toMatch(/pulsing/);
    });

    it('does not apply pulsing class when isInputPhase is false', () => {
      render(<FormulaDisplay formula={percentageFormula} isInputPhase={false} />);
      const hiddenSpan = screen.getByText('?');
      expect(hiddenSpan.className).not.toMatch(/pulsing/);
    });
  });
});

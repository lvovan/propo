import { describe, it, expect, vi } from 'vitest';
import { useState, useCallback } from 'react';
import { render, screen } from '../test-utils';
import userEvent from '@testing-library/user-event';
import FormulaDisplay from '../../src/components/GamePlay/FormulaDisplay/FormulaDisplay';
import AnswerInput from '../../src/components/GamePlay/AnswerInput/AnswerInput';
import type { Formula } from '../../src/types/game';

/**
 * Integration test: inline answer round flow.
 * Verifies that typing digits on the keyboard updates the formula display inline,
 * Enter submits, and feedback phase shows the submitted answer.
 */
describe('Inline Answer Round Flow', () => {
  const formula: Formula = {
    type: 'percentage',
    values: [25, 80, 20],
    hiddenPosition: 'C',
    correctAnswer: 20, timerDurationMs: 20000,
  };

  function RoundHarness({
    onSubmit,
    phase = 'input',
    playerAnswer,
  }: {
    onSubmit: (answer: number) => void;
    phase?: 'input' | 'feedback';
    playerAnswer?: number;
  }) {
    const [digits, setDigits] = useState('');

    const handleDigit = useCallback(
      (digit: string) => {
        setDigits((prev: string) => {
          if (prev.length >= 3) return prev;
          if (prev === '' && digit === '0') return prev;
          return prev + digit;
        });
      },
      [],
    );

    const handleBackspace = useCallback(() => {
      setDigits((prev: string) => prev.slice(0, -1));
    }, []);

    const handleSubmit = useCallback(() => {
      setDigits((prev: string) => {
        if (prev.length === 0) return prev;
        onSubmit(parseInt(prev, 10));
        return '';
      });
    }, [onSubmit]);

    const isInputPhase = phase === 'input';
    const acceptingInput = isInputPhase;

    return (
      <div>
        <FormulaDisplay
          formula={formula}
          playerAnswer={playerAnswer}
          typedDigits={digits}
          isInputPhase={isInputPhase}
        />
        <AnswerInput
          typedDigits={digits}
          onDigit={handleDigit}
          onBackspace={handleBackspace}
          onSubmit={handleSubmit}
          acceptingInput={acceptingInput}
        />
      </div>
    );
  }

  it('shows "?" initially in the formula', () => {
    render(<RoundHarness onSubmit={vi.fn()} />);

    expect(screen.getByText('?')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('80')).toBeInTheDocument();
  });

  it('displays typed digits inline in the formula', async () => {
    const user = userEvent.setup();
    render(<RoundHarness onSubmit={vi.fn()} />);

    await user.keyboard('4');
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.queryByText('?')).not.toBeInTheDocument();

    await user.keyboard('2');
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('submits on Enter and clears input', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<RoundHarness onSubmit={onSubmit} />);

    await user.keyboard('21{Enter}');
    expect(onSubmit).toHaveBeenCalledWith(21);
  });

  it('supports backspace to correct input', async () => {
    const user = userEvent.setup();
    render(<RoundHarness onSubmit={vi.fn()} />);

    await user.keyboard('45{Backspace}');
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('shows "?" again after all digits are cleared', async () => {
    const user = userEvent.setup();
    render(<RoundHarness onSubmit={vi.fn()} />);

    await user.keyboard('4{Backspace}');
    expect(screen.getByText('?')).toBeInTheDocument();
  });

  it('shows playerAnswer during feedback phase', () => {
    render(
      <RoundHarness
        onSubmit={vi.fn()}
        phase="feedback"
        playerAnswer={42}
      />,
    );

    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.queryByText('?')).not.toBeInTheDocument();
  });

  it('pulsing class present during input phase', () => {
    render(<RoundHarness onSubmit={vi.fn()} />);

    const hiddenSpan = screen.getByText('?');
    expect(hiddenSpan.className).toMatch(/pulsing/);
  });

  it('pulsing class absent during feedback phase', () => {
    render(
      <RoundHarness
        onSubmit={vi.fn()}
        phase="feedback"
        playerAnswer={21}
      />,
    );

    const answerSpan = screen.getByText('21');
    expect(answerSpan.className).not.toMatch(/pulsing/);
  });
});

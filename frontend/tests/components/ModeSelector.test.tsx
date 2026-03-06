import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test-utils';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import ModeSelector from '../../src/components/GamePlay/ModeSelector/ModeSelector';
import type { QuestionType } from '../../src/types/game';

function defaultProps(overrides?: Partial<Parameters<typeof ModeSelector>[0]>) {
  return {
    onStartPlay: vi.fn(),
    onStartImprove: vi.fn(),
    trickyCategories: [] as QuestionType[],
    showImprove: false,
    showEncouragement: false,
    ...overrides,
  };
}

describe('ModeSelector', () => {
  it('always renders Play button with descriptor', () => {
    render(<ModeSelector {...defaultProps()} />);
    expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument();
    expect(screen.getByText(/go for a high score/i)).toBeInTheDocument();
  });

  it('calls onStartPlay when Play button is clicked', async () => {
    const user = userEvent.setup();
    const onStartPlay = vi.fn();
    render(<ModeSelector {...defaultProps({ onStartPlay })} />);
    await user.click(screen.getByRole('button', { name: /play/i }));
    expect(onStartPlay).toHaveBeenCalledTimes(1);
  });

  it('shows Improve button when showImprove is true', () => {
    render(
      <ModeSelector
        {...defaultProps({ showImprove: true, trickyCategories: ['percentage', 'ratio'] })}
      />,
    );
    expect(screen.getByRole('button', { name: /improve/i })).toBeInTheDocument();
  });

  it('hides Improve button when showImprove is false', () => {
    render(<ModeSelector {...defaultProps({ showImprove: false })} />);
    expect(screen.queryByRole('button', { name: /improve/i })).not.toBeInTheDocument();
  });

  it('calls onStartImprove when Improve button is clicked', async () => {
    const user = userEvent.setup();
    const onStartImprove = vi.fn();
    render(
      <ModeSelector
        {...defaultProps({
          showImprove: true,
          trickyCategories: ['percentage'],
          onStartImprove,
        })}
      />,
    );
    await user.click(screen.getByRole('button', { name: /improve/i }));
    expect(onStartImprove).toHaveBeenCalledTimes(1);
  });

  it('renders tricky categories in Improve descriptor', () => {
    render(
      <ModeSelector
        {...defaultProps({ showImprove: true, trickyCategories: ['percentage', 'ratio'] })}
      />,
    );
    expect(screen.getByText(/Percentages/)).toBeInTheDocument();
    expect(screen.getByText(/Ratios/)).toBeInTheDocument();
  });

  it('shows encouraging message when showEncouragement is true and showImprove is false', () => {
    render(
      <ModeSelector
        {...defaultProps({ showImprove: false, showEncouragement: true })}
      />,
    );
    expect(screen.getByText(/no tricky areas/i)).toBeInTheDocument();
  });

  it('does not show encouraging message when showEncouragement is false', () => {
    render(
      <ModeSelector
        {...defaultProps({ showImprove: false, showEncouragement: false })}
      />,
    );
    expect(screen.queryByText(/no tricky areas/i)).not.toBeInTheDocument();
  });

  it('Play button is keyboard-focusable', () => {
    render(<ModeSelector {...defaultProps()} />);
    const btn = screen.getByRole('button', { name: /play/i });
    btn.focus();
    expect(btn).toHaveFocus();
  });

  it('Improve button is keyboard-focusable', () => {
    render(
      <ModeSelector
        {...defaultProps({ showImprove: true, trickyCategories: ['percentage'] })}
      />,
    );
    const btn = screen.getByRole('button', { name: /improve/i });
    btn.focus();
    expect(btn).toHaveFocus();
  });

  it('Improve button aria-label includes tricky categories', () => {
    render(
      <ModeSelector
        {...defaultProps({ showImprove: true, trickyCategories: ['percentage', 'ratio'] })}
      />,
    );
    const btn = screen.getByRole('button', { name: /improve/i });
    expect(btn.getAttribute('aria-label')).toContain('Percentages');
  });

  describe('accessibility', () => {
    it('passes axe check with Play button only', async () => {
      const { container } = render(<ModeSelector {...defaultProps()} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('passes axe check with both buttons', async () => {
      const { container } = render(
        <ModeSelector
          {...defaultProps({ showImprove: true, trickyCategories: ['percentage'] })}
        />,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('passes axe check with encouraging message', async () => {
      const { container } = render(
        <ModeSelector
          {...defaultProps({ showImprove: false, showEncouragement: true })}
        />,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});

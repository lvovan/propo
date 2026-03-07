import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test-utils';
import userEvent from '@testing-library/user-event';
import CompetitionSetup from '../../src/components/GamePlay/CompetitionSetup/CompetitionSetup';

describe('CompetitionSetup', () => {
  it('renders seed input, Generate, Start, and Back buttons', () => {
    render(<CompetitionSetup onStart={vi.fn()} onBack={vi.fn()} />);
    expect(screen.getByLabelText(/game seed/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /generate seed/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /start game/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
  });

  it('Start button is disabled when seed is empty', () => {
    render(<CompetitionSetup onStart={vi.fn()} onBack={vi.fn()} />);
    const startButton = screen.getByRole('button', { name: /start game/i });
    expect(startButton).toBeDisabled();
  });

  it('Start button is enabled when seed has content', async () => {
    const user = userEvent.setup();
    render(<CompetitionSetup onStart={vi.fn()} onBack={vi.fn()} />);
    const input = screen.getByLabelText(/game seed/i);
    await user.type(input, 'abc123');
    const startButton = screen.getByRole('button', { name: /start game/i });
    expect(startButton).toBeEnabled();
  });

  it('calls onStart with trimmed seed when Start is pressed', async () => {
    const user = userEvent.setup();
    const onStart = vi.fn();
    render(<CompetitionSetup onStart={onStart} onBack={vi.fn()} />);
    const input = screen.getByLabelText(/game seed/i);
    await user.type(input, '  abc123  ');
    await user.click(screen.getByRole('button', { name: /start game/i }));
    expect(onStart).toHaveBeenCalledWith('abc123');
  });

  it('Generate seed fills input with 6-char alphanumeric string', async () => {
    const user = userEvent.setup();
    render(<CompetitionSetup onStart={vi.fn()} onBack={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: /generate seed/i }));
    const input = screen.getByLabelText(/game seed/i) as HTMLInputElement;
    expect(input.value).toMatch(/^[a-z0-9]{6}$/);
  });

  it('pre-fills seed from initialSeed prop', () => {
    render(<CompetitionSetup onStart={vi.fn()} onBack={vi.fn()} initialSeed="preset" />);
    const input = screen.getByLabelText(/game seed/i) as HTMLInputElement;
    expect(input.value).toBe('preset');
  });

  it('enforces maxLength of 100 characters', () => {
    render(<CompetitionSetup onStart={vi.fn()} onBack={vi.fn()} />);
    const input = screen.getByLabelText(/game seed/i);
    expect(input).toHaveAttribute('maxLength', '100');
  });

  it('calls onBack when Back button is pressed', async () => {
    const user = userEvent.setup();
    const onBack = vi.fn();
    render(<CompetitionSetup onStart={vi.fn()} onBack={onBack} />);
    await user.click(screen.getByRole('button', { name: /back/i }));
    expect(onBack).toHaveBeenCalled();
  });

  it('does not call onStart when seed is only whitespace', async () => {
    const user = userEvent.setup();
    const onStart = vi.fn();
    render(<CompetitionSetup onStart={onStart} onBack={vi.fn()} />);
    const input = screen.getByLabelText(/game seed/i);
    await user.type(input, '   ');
    const startButton = screen.getByRole('button', { name: /start game/i });
    expect(startButton).toBeDisabled();
  });
});

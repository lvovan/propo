import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, within } from '../test-utils';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import TouchNumpad from '../../src/components/GamePlay/AnswerInput/TouchNumpad';

describe('TouchNumpad', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const baseProps = {
    typedDigits: '',
    onDigit: vi.fn(),
    onBackspace: vi.fn(),
    onSubmit: vi.fn(),
    acceptingInput: true,
  };

  // --- Digit button taps ---

  it('calls onDigit when a digit button is tapped', async () => {
    const onDigit = vi.fn();
    const user = userEvent.setup();
    render(<TouchNumpad {...baseProps} onDigit={onDigit} />);

    await user.click(screen.getByRole('button', { name: 'digit 7' }));
    expect(onDigit).toHaveBeenCalledWith('7');
  });

  it('calls onDigit for each digit button', async () => {
    const onDigit = vi.fn();
    const user = userEvent.setup();
    render(<TouchNumpad {...baseProps} onDigit={onDigit} />);

    await user.click(screen.getByRole('button', { name: 'digit 4' }));
    await user.click(screen.getByRole('button', { name: 'digit 2' }));
    expect(onDigit).toHaveBeenCalledTimes(2);
    expect(onDigit).toHaveBeenNthCalledWith(1, '4');
    expect(onDigit).toHaveBeenNthCalledWith(2, '2');
  });

  it('calls onDigit for zero button', async () => {
    const onDigit = vi.fn();
    const user = userEvent.setup();
    render(<TouchNumpad {...baseProps} onDigit={onDigit} />);

    await user.click(screen.getByRole('button', { name: 'digit 0' }));
    expect(onDigit).toHaveBeenCalledWith('0');
  });

  // --- Submit button ---

  it('calls onSubmit when checkmark button is tapped', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<TouchNumpad {...baseProps} typedDigits="42" onSubmit={onSubmit} />);

    await user.click(screen.getByRole('button', { name: 'submit answer' }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('submit button is disabled when typedDigits is empty', () => {
    render(<TouchNumpad {...baseProps} typedDigits="" />);

    expect(screen.getByRole('button', { name: 'submit answer' })).toBeDisabled();
  });

  it('submit button is enabled when typedDigits has content', () => {
    render(<TouchNumpad {...baseProps} typedDigits="5" />);

    expect(screen.getByRole('button', { name: 'submit answer' })).toBeEnabled();
  });

  it('renders "Go" on the submit button', () => {
    render(<TouchNumpad {...baseProps} typedDigits="5" />);

    const submitButton = screen.getByRole('button', { name: 'submit answer' });
    expect(submitButton).toHaveTextContent('Go');
  });

  // --- Backspace button ---

  it('calls onBackspace when backspace button is tapped', async () => {
    const onBackspace = vi.fn();
    const user = userEvent.setup();
    render(<TouchNumpad {...baseProps} typedDigits="7" onBackspace={onBackspace} />);

    await user.click(screen.getByRole('button', { name: 'delete last digit' }));
    expect(onBackspace).toHaveBeenCalledTimes(1);
  });

  // --- Disabled state ---

  it('disables all buttons when acceptingInput is false', () => {
    render(<TouchNumpad {...baseProps} acceptingInput={false} />);

    const buttons = screen.getAllByRole('button');
    buttons.forEach((button) => {
      expect(button).toBeDisabled();
    });
  });

  // --- Physical keyboard input ---

  it('calls onDigit via physical keyboard keydown', async () => {
    const onDigit = vi.fn();
    const user = userEvent.setup();
    render(<TouchNumpad {...baseProps} onDigit={onDigit} />);

    await user.keyboard('8');
    expect(onDigit).toHaveBeenCalledWith('8');
  });

  it('calls onSubmit via Enter key', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<TouchNumpad {...baseProps} onSubmit={onSubmit} />);

    await user.keyboard('{Enter}');
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('calls onBackspace via Backspace key', async () => {
    const onBackspace = vi.fn();
    const user = userEvent.setup();
    render(<TouchNumpad {...baseProps} onBackspace={onBackspace} />);

    await user.keyboard('{Backspace}');
    expect(onBackspace).toHaveBeenCalledTimes(1);
  });

  it('ignores keyboard input when acceptingInput is false', async () => {
    const onDigit = vi.fn();
    const onSubmit = vi.fn();
    const onBackspace = vi.fn();
    const user = userEvent.setup();
    render(
      <TouchNumpad
        {...baseProps}
        onDigit={onDigit}
        onSubmit={onSubmit}
        onBackspace={onBackspace}
        acceptingInput={false}
      />,
    );

    await user.keyboard('5{Backspace}{Enter}');
    expect(onDigit).not.toHaveBeenCalled();
    expect(onBackspace).not.toHaveBeenCalled();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  // --- ARIA / Accessibility ---

  it('has ARIA labels on all digit buttons', () => {
    render(<TouchNumpad {...baseProps} />);

    for (let i = 0; i <= 9; i++) {
      expect(screen.getByRole('button', { name: `digit ${i}` })).toBeInTheDocument();
    }
  });

  it('has ARIA label on submit button', () => {
    render(<TouchNumpad {...baseProps} />);
    expect(screen.getByRole('button', { name: 'submit answer' })).toBeInTheDocument();
  });

  it('has ARIA label on backspace button', () => {
    render(<TouchNumpad {...baseProps} />);
    expect(screen.getByRole('button', { name: 'delete last digit' })).toBeInTheDocument();
  });

  it('passes axe accessibility checks', async () => {
    const { container } = render(<TouchNumpad {...baseProps} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  // --- Button grid layout ---

  it('renders all 12 buttons (10 digits + backspace + checkmark)', () => {
    render(<TouchNumpad {...baseProps} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(12);
  });

  // --- No answer display div ---

  it('does not render an answer display element', () => {
    render(<TouchNumpad {...baseProps} />);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});

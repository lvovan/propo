import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '../test-utils';
import userEvent from '@testing-library/user-event';
import AnswerInput from '../../src/components/GamePlay/AnswerInput/AnswerInput';

function mockMaxTouchPoints(value: number) {
  Object.defineProperty(navigator, 'maxTouchPoints', {
    value,
    writable: true,
    configurable: true,
  });
}

describe('AnswerInput', () => {
  const originalMaxTouchPoints = navigator.maxTouchPoints;

  afterEach(() => {
    Object.defineProperty(navigator, 'maxTouchPoints', {
      value: originalMaxTouchPoints,
      writable: true,
      configurable: true,
    });
  });

  const baseProps = {
    typedDigits: '',
    onDigit: vi.fn(),
    onBackspace: vi.fn(),
    onSubmit: vi.fn(),
    acceptingInput: true,
  };

  // --- Desktop keyboard handling (document-level keydown) ---

  describe('desktop keyboard handling', () => {
    it('calls onDigit for digit keys 0-9', async () => {
      mockMaxTouchPoints(0);
      const onDigit = vi.fn();
      const user = userEvent.setup();
      render(<AnswerInput {...baseProps} onDigit={onDigit} />);

      await user.keyboard('5');
      expect(onDigit).toHaveBeenCalledWith('5');
    });

    it('calls onDigit for each digit in sequence', async () => {
      mockMaxTouchPoints(0);
      const onDigit = vi.fn();
      const user = userEvent.setup();
      render(<AnswerInput {...baseProps} onDigit={onDigit} />);

      await user.keyboard('42');
      expect(onDigit).toHaveBeenCalledTimes(2);
      expect(onDigit).toHaveBeenNthCalledWith(1, '4');
      expect(onDigit).toHaveBeenNthCalledWith(2, '2');
    });

    it('calls onBackspace for Backspace key', async () => {
      mockMaxTouchPoints(0);
      const onBackspace = vi.fn();
      const user = userEvent.setup();
      render(<AnswerInput {...baseProps} onBackspace={onBackspace} />);

      await user.keyboard('{Backspace}');
      expect(onBackspace).toHaveBeenCalledTimes(1);
    });

    it('calls onSubmit for Enter key', async () => {
      mockMaxTouchPoints(0);
      const onSubmit = vi.fn();
      const user = userEvent.setup();
      render(<AnswerInput {...baseProps} onSubmit={onSubmit} />);

      await user.keyboard('{Enter}');
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    it('ignores non-digit keys', async () => {
      mockMaxTouchPoints(0);
      const onDigit = vi.fn();
      const user = userEvent.setup();
      render(<AnswerInput {...baseProps} onDigit={onDigit} />);

      await user.keyboard('abc');
      expect(onDigit).not.toHaveBeenCalled();
    });

    it('does not fire callbacks when acceptingInput is false', async () => {
      mockMaxTouchPoints(0);
      const onDigit = vi.fn();
      const onBackspace = vi.fn();
      const onSubmit = vi.fn();
      const user = userEvent.setup();
      render(
        <AnswerInput
          {...baseProps}
          onDigit={onDigit}
          onBackspace={onBackspace}
          onSubmit={onSubmit}
          acceptingInput={false}
        />,
      );

      await user.keyboard('5{Backspace}{Enter}');
      expect(onDigit).not.toHaveBeenCalled();
      expect(onBackspace).not.toHaveBeenCalled();
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  // --- Conditional rendering ---

  describe('conditional rendering', () => {
    it('renders no visible input on desktop (non-touch)', () => {
      mockMaxTouchPoints(0);
      render(<AnswerInput {...baseProps} />);

      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    });

    it('renders TouchNumpad when touchscreen is detected', () => {
      mockMaxTouchPoints(5);
      render(<AnswerInput {...baseProps} />);

      // Verify digit buttons are present
      expect(screen.getByRole('button', { name: 'digit 1' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'submit answer' })).toBeInTheDocument();
    });
  });
});

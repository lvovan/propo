import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '../test-utils';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { SessionProvider } from '../../src/hooks/useSession.tsx';
import MainPage from '../../src/pages/MainPage';
import { FEEDBACK_DURATION_MS } from '../../src/constants/scoring';
import * as formulaGenerator from '../../src/services/formulaGenerator';
import { getCorrectAnswer } from '../../src/services/gameEngine';
import type { Formula } from '../../src/types/game';

// Mock navigation
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    Navigate: ({ to }: { to: string }) => {
      mockNavigate(to);
      return null;
    },
  };
});

function createTestFormulas(): Formula[] {
  return [
    { type: 'percentage', values: [10, 60, 6], hiddenPosition: 'C', correctAnswer: 6, timerDurationMs: 20000 },
    { type: 'percentage', values: [20, 20, 4], hiddenPosition: 'A', correctAnswer: 20, timerDurationMs: 20000 },
    { type: 'ratio', values: [2, 3, 6, 9], hiddenPosition: 'B', correctAnswer: 3, timerDurationMs: 20000 },
    { type: 'percentage', values: [50, 40, 20], hiddenPosition: 'C', correctAnswer: 20, timerDurationMs: 20000 },
    { type: 'percentage', values: [10, 110, 11], hiddenPosition: 'C', correctAnswer: 11, timerDurationMs: 20000 },
    { type: 'fraction', values: [1, 4, 3, 12], hiddenPosition: 'A', correctAnswer: 1, timerDurationMs: 20000 },
    { type: 'ratio', values: [5, 6, 10, 12], hiddenPosition: 'B', correctAnswer: 6, timerDurationMs: 20000 },
    { type: 'percentage', values: [25, 80, 20], hiddenPosition: 'C', correctAnswer: 20, timerDurationMs: 20000 },
    { type: 'percentage', values: [10, 100, 10], hiddenPosition: 'C', correctAnswer: 10, timerDurationMs: 20000 },
    { type: 'percentage', values: [50, 18, 9], hiddenPosition: 'A', correctAnswer: 50, timerDurationMs: 20000 },
  ];
}

function setUpActiveSession() {
  const session = {
    playerName: 'IntegrationPlayer',
    avatarId: 'rocket',
    startedAt: Date.now(),
  };
  sessionStorage.setItem('propo_session', JSON.stringify(session));
}

function renderMainPage() {
  return render(
    <MemoryRouter initialEntries={['/play']}>
      <SessionProvider>
        <MainPage />
      </SessionProvider>
    </MemoryRouter>,
  );
}

describe('Gameplay Flow Integration', () => {
  const testFormulas = createTestFormulas();

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.spyOn(formulaGenerator, 'generateFormulas').mockReturnValue(testFormulas);
    setUpActiveSession();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('full game: start → 10 rounds (mix correct/incorrect) → replay → score summary → play again → new game', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderMainPage();

    // === START GAME ===
    expect(screen.getByRole('button', { name: /^play/i })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /^play/i }));

    // === PLAY 10 ROUNDS ===
    // Rounds 1-8 correct, rounds 9-10 incorrect
    const correctAnswers = testFormulas.map((f) => getCorrectAnswer(f));

    for (let i = 0; i < 10; i++) {
      // Verify we're on the right round
      if (i < 8) {
        expect(screen.getByText(new RegExp(`Round ${i + 1} of 10`))).toBeInTheDocument();
      }

      if (i < 8) {
        // Correct answer
        await user.keyboard(`${correctAnswers[i]}{Enter}`);
      } else {
        // Wrong answer for rounds 9-10
        await user.keyboard('999{Enter}');
      }

      // Verify feedback appears
      if (i < 8) {
        expect(screen.getByText(/correct/i)).toBeInTheDocument();
      } else {
        expect(screen.getByText(/not quite/i)).toBeInTheDocument();
      }

      // Advance past feedback
      act(() => {
        vi.advanceTimersByTime(FEEDBACK_DURATION_MS + 50);
      });

      // Wait for next state
      if (i < 9) {
        await waitFor(() => {
          expect(screen.getByText('?')).toBeInTheDocument();
        });
      }
    }

    // === REPLAY PHASE ===
    // Rounds 9-10 were wrong → should enter replay
    await waitFor(() => {
      expect(screen.getByText(/Replay/i)).toBeInTheDocument();
    });

    // Answer replay round 1 (formula index 8: 10×12=120, hidden=C) correctly
    await user.keyboard(`${correctAnswers[8]}{Enter}`);

    act(() => {
      vi.advanceTimersByTime(FEEDBACK_DURATION_MS + 50);
    });

    // Still in replay for round 2
    await waitFor(() => {
      expect(screen.getByText('?')).toBeInTheDocument();
    });

    // Answer replay round 2 (formula index 9: 9×11=99, hidden=A, answer=9) correctly
    await user.keyboard(`${correctAnswers[9]}{Enter}`);

    act(() => {
      vi.advanceTimersByTime(FEEDBACK_DURATION_MS + 50);
    });

    // === SCORE SUMMARY ===
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /play again/i })).toBeInTheDocument();
    });

    // Verify score summary has a table
    expect(screen.getByRole('table')).toBeInTheDocument();

    // Should show Play Again and Back to Menu buttons
    expect(screen.getByRole('button', { name: /play again/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /back to menu/i })).toBeInTheDocument();

    // Scoring: 8 correct fast (+5 each) + 2 incorrect (-2 each) = 40 - 4 = 36
    const totalLabel = screen.getByText('Score');
    const totalSection = totalLabel.parentElement!;
    expect(totalSection).toHaveTextContent('36');

    // === PLAY AGAIN ===
    await user.click(screen.getByRole('button', { name: /play again/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^play/i })).toBeInTheDocument();
    });

    // === START A NEW GAME ===
    await user.click(screen.getByRole('button', { name: /^play/i }));

    // Should be back in round 1
    expect(screen.getByText(/round 1 of 10/i)).toBeInTheDocument();
    expect(screen.getByText('?')).toBeInTheDocument();
  });

  it('back to menu navigates to welcome after gameplay', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderMainPage();

    await user.click(screen.getByRole('button', { name: /^play/i }));

    // Play all 10 rounds correctly
    const correctAnswers = testFormulas.map((f) => getCorrectAnswer(f));
    for (let i = 0; i < 10; i++) {
      await user.keyboard(`${correctAnswers[i]}{Enter}`);

      act(() => {
        vi.advanceTimersByTime(FEEDBACK_DURATION_MS + 50);
      });

      if (i < 9) {
        await waitFor(() => {
          expect(screen.getByText('?')).toBeInTheDocument();
        });
      }
    }

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /play again/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /back to menu/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});

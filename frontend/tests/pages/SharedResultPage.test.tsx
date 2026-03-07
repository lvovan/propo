import { describe, it, expect, vi, afterEach } from 'vitest';
import { render as baseRender, screen, type RenderOptions } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { LanguageProvider } from '../../src/i18n';
import { SessionProvider } from '../../src/hooks/useSession';
import SharedResultPage from '../../src/pages/SharedResultPage';
import type { ReactElement, ReactNode } from 'react';

function Providers({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <SessionProvider>{children}</SessionProvider>
    </LanguageProvider>
  );
}

function renderWithHash(hash: string) {
  window.location.hash = hash;
  return baseRender(
    <Providers>
      <MemoryRouter initialEntries={['/result']}>
        <Routes>
          <Route path="/result" element={<SharedResultPage />} />
        </Routes>
      </MemoryRouter>
    </Providers>,
  );
}

describe('SharedResultPage', () => {
  afterEach(() => {
    window.location.hash = '';
  });

  it('displays player name, score, time, and seed from URL params', () => {
    renderWithHash('#/result?seed=abc123&player=Alice&score=45&time=29600');
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('45')).toBeInTheDocument();
    expect(screen.getByText('29.6s')).toBeInTheDocument();
    expect(screen.getByText(/abc123/)).toBeInTheDocument();
  });

  it('displays "Play this game" button', () => {
    renderWithHash('#/result?seed=abc123&player=Alice&score=45&time=29600');
    expect(screen.getByRole('button', { name: /play this game/i })).toBeInTheDocument();
  });

  it('shows error when params are missing', () => {
    renderWithHash('#/result?seed=abc123');
    expect(screen.getByText(/invalid/i)).toBeInTheDocument();
  });

  it('shows error when hash is empty', () => {
    renderWithHash('');
    expect(screen.getByText(/invalid/i)).toBeInTheDocument();
  });

  it('formats time over 60 seconds correctly', () => {
    renderWithHash('#/result?seed=test&player=Bob&score=30&time=149600');
    expect(screen.getByText('2m 29.6s')).toBeInTheDocument();
  });
});

import { describe, it, expect, afterEach } from 'vitest';
import { render as baseRender } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { LanguageProvider } from '../../src/i18n';
import { SessionProvider } from '../../src/hooks/useSession';
import SharedResultPage from '../../src/pages/SharedResultPage';
import type { ReactNode } from 'react';

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

describe('SharedResultPage a11y', () => {
  afterEach(() => {
    window.location.hash = '';
  });

  it('has no accessibility violations with valid result', async () => {
    const { container } = renderWithHash('#/result?seed=abc123&player=Alice&score=45&time=29600');
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no accessibility violations with error state', async () => {
    const { container } = renderWithHash('#/result?seed=abc');
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

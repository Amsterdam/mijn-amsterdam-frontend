import { render, screen } from '@testing-library/react';
import type { Mock } from 'vitest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ThemaPagina } from './ThemaPagina.tsx';
import type { LinkConfig } from '../../../universal/types/thema-types.ts';
import { MockApp } from '../../apps/bob/pages/MockApp.tsx';
import { useProfileTypeValue } from '../../hooks/useProfileType.ts';

vi.mock('../../hooks/useProfileType.ts', () => ({
  useProfileTypeValue: vi.fn(),
}));

const PAGE_LINKS: LinkConfig[] = [
  {
    to: '/always-visible',
    title: 'Always visible',
  },
  {
    to: '/commercial-only',
    title: 'Commercial only',
    profileTypes: ['commercial'],
  },
  {
    to: '/private-only',
    title: 'Private only',
    profileTypes: ['private'],
  },
];

function renderThemaPagina() {
  render(
    <MockApp
      routeEntry="/"
      routePath="/"
      component={() => (
        <ThemaPagina
          id="test-id"
          title="Test thema"
          pageContentTop={<div>Top content</div>}
          pageContentMain={<div>Main content</div>}
          pageLinks={PAGE_LINKS}
          isError={false}
          isLoading={false}
        />
      )}
    />
  );
}

describe('ThemaPagina', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows only links for commercial profile type', () => {
    (useProfileTypeValue as Mock).mockReturnValue('commercial');

    renderThemaPagina();

    expect(screen.getByRole('link', { name: 'Always visible' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'Commercial only' })).toBeVisible();
    expect(
      screen.queryByRole('link', { name: 'Private only' })
    ).not.toBeInTheDocument();
  });

  it('shows only links for private profile type', () => {
    (useProfileTypeValue as Mock).mockReturnValue('private');

    renderThemaPagina();

    expect(screen.getByRole('link', { name: 'Always visible' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'Private only' })).toBeVisible();
    expect(
      screen.queryByRole('link', { name: 'Commercial only' })
    ).not.toBeInTheDocument();
  });
});

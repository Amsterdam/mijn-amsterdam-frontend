import { render, screen } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router';
import { RecoilRoot } from 'recoil';
import { describe, expect, it, vi } from 'vitest';

import { MainHeader } from './MainHeader';

vi.mock('../../hooks/media.hook');

describe('<MainHeader />', () => {
  it('Renders unauthenticated header on Dashboard', () => {
    render(
      <RecoilRoot>
        <BrowserRouter>
          <MainHeader />
        </BrowserRouter>
      </RecoilRoot>
    );

    expect(
      screen.queryByText('Ga naar de homepage van Mijn Amsterdam')
    ).toBeInTheDocument();
  });

  it('Renders authenticated header on Dashboard', () => {
    render(
      <RecoilRoot>
        <BrowserRouter>
          <MainHeader isAuthenticated />
        </BrowserRouter>
      </RecoilRoot>
    );

    expect(screen.getByText(/Uitloggen/)).toBeInTheDocument();
    expect(screen.queryByText('Zoeken')).not.toBeInTheDocument();
    expect(screen.getAllByText('Menu').length).toBe(2);
  });

  it('Renders authenticated header on Other page', () => {
    render(
      <RecoilRoot>
        <MemoryRouter initialEntries={['/other']}>
          <MainHeader isAuthenticated />
        </MemoryRouter>
      </RecoilRoot>
    );

    expect(screen.getByText(/Uitloggen/)).toBeInTheDocument();
    expect(screen.queryByText('Zoeken')).toBeInTheDocument();
    expect(screen.getAllByText('Menu').length).toBe(2);
  });
});

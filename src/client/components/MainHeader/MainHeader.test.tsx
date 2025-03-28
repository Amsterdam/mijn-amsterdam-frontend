import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import { describe, expect, it, vi } from 'vitest';

import { MainHeader } from './MainHeader';

vi.mock('../../hooks/media.hook');

describe('<MainHeader />', () => {
  it('Renders unauthenticated header', () => {
    render(
      <RecoilRoot>
        <BrowserRouter>
          <MainHeader />
        </BrowserRouter>
      </RecoilRoot>
    );

    expect(screen.getAllByText(/Mijn Amsterdam/).length).toBe(2);
    expect(screen.getByText('Ga naar de homepage')).toBeInTheDocument();
  });

  it('Renders authenticated header', () => {
    render(
      <RecoilRoot>
        <BrowserRouter>
          <MainHeader isAuthenticated={true} />
        </BrowserRouter>
      </RecoilRoot>
    );

    expect(screen.getByText(/Uitloggen/)).toBeInTheDocument();
    expect(screen.getByText('Zoeken')).toBeInTheDocument();
    expect(screen.getAllByText('Menu').length).toBe(2);
  });
});

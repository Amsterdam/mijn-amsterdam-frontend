import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import { describe, expect, it, vi } from 'vitest';

import MainHeader from './MainHeader';


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

    expect(screen.getByText('Mijn Amsterdam')).toBeInTheDocument();
    expect(screen.getByText('Ga naar de homepage')).toBeInTheDocument();
  });

  it('Renders authenticated header', () => {
    const { container } = render(
      <RecoilRoot>
        <BrowserRouter>
          <MainHeader isAuthenticated={true} />
        </BrowserRouter>
      </RecoilRoot>
    );

    expect(container.querySelector('picture')).toBeInTheDocument();
    expect(container.querySelector('img')?.getAttribute('src')).toBe(
      '/header/1600x400-algemeen.jpg'
    );

    expect(screen.getByText(/Uitloggen/)).toBeInTheDocument();
    expect(screen.getByText('Zoeken')).toBeInTheDocument();
    expect(screen.getByText('Menu')).toBeInTheDocument();
  });
});

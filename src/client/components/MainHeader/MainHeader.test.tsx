import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import MainHeader from './MainHeader';

import { describe, expect, it, vi } from 'vitest';

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
    expect(screen.getAllByText(/Direct naar:/).length).toBe(2);
    expect(
      screen.getByLabelText('Gemeente Amsterdam logo')
    ).toBeInTheDocument();
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

    expect(screen.getByText(/Mijn buurt/)).toBeInTheDocument();
    expect(screen.getByText(/Home/)).toBeInTheDocument();
    expect(screen.getByText(/Mijn thema's/)).toBeInTheDocument();
    expect(screen.getByText(/Actueel/)).toBeInTheDocument();
  });
});

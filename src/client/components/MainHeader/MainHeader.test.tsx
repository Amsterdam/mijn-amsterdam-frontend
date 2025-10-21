import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import { MainHeader } from './MainHeader';

vi.mock('../../hooks/media.hook');

describe('<MainHeader />', () => {
  it('Renders unauthenticated header on Dashboard', () => {
    render(
      <BrowserRouter>
        <MainHeader />
      </BrowserRouter>
    );

    expect(
      screen.queryByText('Ga naar de homepage van Mijn Amsterdam')
    ).toBeInTheDocument();
  });

  it('Renders authenticated header on Dashboard', () => {
    render(
      <BrowserRouter>
        <MainHeader isAuthenticated={true} />
      </BrowserRouter>
    );

    expect(screen.getByText(/Uitloggen/)).toBeInTheDocument();
    expect(screen.queryByText('Zoeken')).not.toBeInTheDocument();
    expect(screen.getAllByText('Menu').length).toBe(2);
  });
});

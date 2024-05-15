import { render, screen } from '@testing-library/react';
import { generatePath } from 'react-router-dom';

import { AppRoutes, ThemaTitles } from '../../../universal/config';

import MockApp from '../MockApp';
import Parkeren from './Parkeren';

import { beforeAll, describe, expect, it, vi } from 'vitest';

describe('Parkeren', () => {
  beforeAll(() => {
    (window.scrollTo as any) = vi.fn();
  });

  const routeEntry = generatePath(AppRoutes.PARKEREN);
  const routePath = AppRoutes.PARKEREN;

  const Component = () => (
    <MockApp
      routeEntry={routeEntry}
      routePath={routePath}
      component={Parkeren}
    />
  );

  it('should render the component and show the correct title', () => {
    render(<Component />);

    expect(screen.getAllByText(ThemaTitles.PARKEREN)[0]).toBeInTheDocument();
  });

  it('should contain the correct links', () => {
    render(<Component />);

    expect(
      screen.getByText('Lees hier meer over parkeervergunningen')
    ).toBeInTheDocument();

    expect(screen.getByText('Log in op Mijn Parkeren')).toBeInTheDocument();
  });
});

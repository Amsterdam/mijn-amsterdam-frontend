import { render, screen } from '@testing-library/react';
import { generatePath } from 'react-router-dom';

import { AppRoutes, ChapterTitles } from '../../../universal/config';

import MockApp from '../MockApp';
import Parkeren from './Parkeren';

describe('Parkeren', () => {
  beforeAll(() => {
    (window.scrollTo as any) = jest.fn();
  });

  const routeEntry = generatePath(AppRoutes.TIPS);
  const routePath = AppRoutes.TIPS;

  const Component = () => (
    <MockApp
      routeEntry={routeEntry}
      routePath={routePath}
      component={Parkeren}
    />
  );

  it('should render the component and show the correct title', () => {
    render(<Component />);

    expect(screen.getByText(ChapterTitles.PARKEREN)).toBeInTheDocument();
  });

  it('should contain the correct links', () => {
    render(<Component />);

    expect(
      screen.getByText('Lees hier meer over parkeren')
    ).toBeInTheDocument();

    expect(
      screen.getByText('Log voor uw vergunning in op Mijn Parkeren')
    ).toBeInTheDocument();
  });
});

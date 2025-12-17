import { render, screen } from '@testing-library/react';

import { PageV2 } from './Page';
import MockApp from '../../pages/MockApp';

it('Renders without crashing', () => {
  render(
    <MockApp
      routeEntry="/"
      routePath="/"
      component={() => <PageV2 heading="Hela!">Hola!</PageV2>}
    />
  );
  expect(screen.getByRole('heading', { name: 'Hela!' })).toBeInTheDocument();
  expect(screen.getByText('Hola!')).toBeInTheDocument();
});

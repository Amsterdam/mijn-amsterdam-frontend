import { render, screen } from '@testing-library/react';

import Page from './Page';

it('Renders without crashing', () => {
  render(<Page>Hela!</Page>);
  expect(screen.getByText('Hela!')).toBeInTheDocument();
});

import { render, screen } from '@testing-library/react';

import { PageV2 } from './Page';

it('Renders without crashing', () => {
  render(<PageV2>Hela!</PageV2>);
  expect(screen.getByText('Hela!')).toBeInTheDocument();
});

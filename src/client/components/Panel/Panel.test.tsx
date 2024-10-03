import { render, screen } from '@testing-library/react';

import Panel from './Panel';

it('Renders without crashing', () => {
  render(
    <Panel>
      <p>hey!</p>
    </Panel>
  );
  expect(screen.getByText('hey!')).toBeInTheDocument();
});

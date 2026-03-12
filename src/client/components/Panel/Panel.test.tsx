import { render, screen } from '@testing-library/react';

import Panel from './Panel.tsx';

it('Renders without crashing', () => {
  render(
    <Panel>
      <p>hey!</p>
    </Panel>
  );
  expect(screen.getByText('hey!')).toBeInTheDocument();
});

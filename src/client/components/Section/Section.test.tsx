import { render, screen } from '@testing-library/react';

import Section from './Section';

it('Renders without crashing', () => {
  render(
    <Section>
      <p>Hey!</p>
    </Section>
  );
  expect(screen.getByText('Hey!')).toBeInTheDocument();
});

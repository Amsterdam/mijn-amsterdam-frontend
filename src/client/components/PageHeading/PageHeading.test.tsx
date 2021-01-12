import { render } from '@testing-library/react';
import React from 'react';
import PageHeading from './PageHeading';

it('Renders without crashing', () => {
  const { container } = render(<PageHeading>Hola!</PageHeading>);
  expect(container.querySelector('h2')).toBeInTheDocument();
});

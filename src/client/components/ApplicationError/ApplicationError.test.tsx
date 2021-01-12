import React from 'react';
import { render, screen } from '@testing-library/react';
import ApplicationError from './ApplicationError';

it('Renders without crashing', () => {
  const error = new Error('There is an error');

  // @ts-ignore
  render(<ApplicationError error={error} />);
  expect(screen.getByText(/There is an error/)).toBeInTheDocument();
});

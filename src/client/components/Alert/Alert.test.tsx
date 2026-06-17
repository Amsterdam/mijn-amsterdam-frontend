import { render, screen } from '@testing-library/react';

import { ErrorAlert } from './Alert.tsx';

it('Renders without crashing', () => {
  render(<ErrorAlert>O nee!</ErrorAlert>);
  expect(screen.getByText('O nee!')).toBeInTheDocument();
});

import Alert from './Alert';
import { render, screen } from '@testing-library/react';

it('Renders without crashing', () => {
  render(<Alert>O nee!</Alert>);
  expect(screen.getByText('O nee!')).toBeInTheDocument();
});

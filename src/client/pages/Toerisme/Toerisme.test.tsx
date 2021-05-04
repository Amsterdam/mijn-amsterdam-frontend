import { render, screen } from '@testing-library/react';

import Toerisme from './Toerisme';

describe('<Toerisme />', () => {
  it('Renders without crashing', () => {
    render(<Toerisme />);
    expect(screen.getByText('Toerisme title')).toBeInTheDocument();
    expect(screen.getByText('Toerisme body')).toBeInTheDocument();
  });
});

import { render, screen } from '@testing-library/react';

import AlphaComponent from './AlphaComponent';


describe('<AlphaComponent />', () => {
  it('Renders without crashing', () => {
    render(<AlphaComponent />);
  });

  it('Renders AlphaComponent text', () => {
    render(<AlphaComponent />);
    expect(screen.getByText('AlphaComponent')).toBeInTheDocument();
  });
});

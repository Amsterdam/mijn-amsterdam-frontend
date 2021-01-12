import AlphaComponent from './AlphaComponent';
import React from 'react';
import { render, screen } from '@testing-library/react';

describe('<AlphaComponent />', () => {
  it('Renders without crashing', () => {
    render(<AlphaComponent />);
  });

  it('Renders AlphaComponent text', () => {
    render(<AlphaComponent />);
    expect(screen.getByText('AlphaComponent')).toBeInTheDocument();
  });
});

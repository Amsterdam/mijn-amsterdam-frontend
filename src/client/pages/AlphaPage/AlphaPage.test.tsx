import { render, screen } from '@testing-library/react';
import React from 'react';
import AlphaPage from './AlphaPage';

describe('<AlphaPage />', () => {
  it('Renders without crashing', () => {
    render(<AlphaPage />);
    expect(screen.getByText('AlphaPage title')).toBeInTheDocument();
    expect(screen.getByText('AlphaPage body')).toBeInTheDocument();
  });
});

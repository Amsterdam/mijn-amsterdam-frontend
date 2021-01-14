import React from 'react';
import { render, screen } from '@testing-library/react';
import Heading from './Heading';

describe('<Heading/>', () => {
  it('Renders without crashing', () => {
    render(<Heading>Test</Heading>);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('Renders without crashing', () => {
    const { container } = render(<Heading el="h6">Test</Heading>);
    expect((container.firstChild as any).tagName).toBe('H6');
  });
});

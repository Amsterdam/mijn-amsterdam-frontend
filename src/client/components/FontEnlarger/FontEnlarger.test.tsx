import { render, screen } from '@testing-library/react';

import FontEnlarger from './FontEnlarger';

describe('Font enlarger information', () => {
  it('Renders without crashing', () => {
    render(<FontEnlarger />);
    expect(screen.getByLabelText('Uitleg tekst vergroten')).toBeInTheDocument();
  });
});

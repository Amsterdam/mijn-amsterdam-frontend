import { render, screen } from '@testing-library/react';

import FinancieleHulp from './FinancieleHulp';

describe('<FinancieleHulp />', () => {
  it('Renders without crashing', () => {
    render(<FinancieleHulp />);
    expect(screen.getByText('FinancieleHulp title')).toBeInTheDocument();
    expect(screen.getByText('FinancieleHulp body')).toBeInTheDocument();
  });
});

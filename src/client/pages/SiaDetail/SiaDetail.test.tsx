import { render, screen } from '@testing-library/react';

import SiaDetail from './SiaDetail';

describe('<SiaDetail />', () => {
  it('Renders without crashing', () => {
    render(<SiaDetail />);
    expect(screen.getByText('SiaDetail title')).toBeInTheDocument();
    expect(screen.getByText('SiaDetail body')).toBeInTheDocument();
  });
});

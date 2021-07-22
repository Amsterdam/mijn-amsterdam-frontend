import { render, screen } from '@testing-library/react';

import Search from './Search';

describe('<Search />', () => {
  it('Renders without crashing', () => {
    render(<Search />);
    expect(screen.getByText('Search title')).toBeInTheDocument();
    expect(screen.getByText('Search body')).toBeInTheDocument();
  });
});

import { render, screen } from '@testing-library/react';

import Sia from './Sia';

describe('<Sia />', () => {
  it('Renders without crashing', () => {
    render(<Sia />);
    expect(screen.getByText('Sia title')).toBeInTheDocument();
    expect(screen.getByText('Sia body')).toBeInTheDocument();
  });
});

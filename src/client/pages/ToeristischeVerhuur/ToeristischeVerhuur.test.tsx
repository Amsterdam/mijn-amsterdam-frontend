import { render, screen } from '@testing-library/react';

import ToeristischeVerhuur from './ToeristischeVerhuur';

describe('<ToeristischeVerhuur />', () => {
  it('Renders without crashing', () => {
    render(<ToeristischeVerhuur />);
    expect(screen.getByText('ToeristischeVerhuur title')).toBeInTheDocument();
    expect(screen.getByText('ToeristischeVerhuur body')).toBeInTheDocument();
  });
});

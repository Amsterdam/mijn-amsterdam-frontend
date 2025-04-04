import { render, screen } from '@testing-library/react';

import { ApplicationError } from './ApplicationError';

describe('ApplicationError', () => {
  it('Renders without crashing', () => {
    const error = new Error('There is an error');

    render(<ApplicationError error={error} resetErrorBoundary={vi.fn()} />);
    expect(screen.getByText(/There is an error/)).toBeInTheDocument();
  });

  it('Render without crashing when location is not home', () => {
    const location = new URL('https://mijn.amsterdam.nl/klachten/1');

    delete (window as any).location;
    window.location = location as unknown as Location;

    const error = new Error('There is a different error');

    render(<ApplicationError error={error} resetErrorBoundary={vi.fn()} />);
    expect(screen.getByText(/There is a different error/)).toBeInTheDocument();
  });
});

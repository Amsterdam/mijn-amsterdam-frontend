import { render, screen } from '@testing-library/react';

import { ApplicationError } from './ApplicationError';
import MockApp from '../MockApp';

describe('ApplicationError', () => {
  function createErrorPage(error: Error) {
    const Page = (
      <MockApp
        routeEntry="/klachten"
        routePath="/klachten"
        component={function ErrorPage() {
          return (
            <ApplicationError error={error} resetErrorBoundary={vi.fn()} />
          );
        }}
      />
    );
    return Page;
  }
  it('Renders without crashing', () => {
    const error = new Error('There is an error');

    render(createErrorPage(error));
    expect(screen.getByText(/There is an error/)).toBeInTheDocument();
  });

  it('Render without crashing when location is not home', () => {
    const location = new URL('https://mijn.amsterdam.nl/klachten/1');

    delete (window as any).location;
    globalThis.location = location as unknown as Location;

    const error = new Error('There is a different error');

    render(createErrorPage(error));
    expect(screen.getByText(/There is a different error/)).toBeInTheDocument();
  });
});

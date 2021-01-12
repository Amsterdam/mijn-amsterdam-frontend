import React from 'react';
import App from './App';
import { render, screen } from '@testing-library/react';
import { useSessionApi, useSessionValue } from './hooks/api/useSessionApi';

jest.mock('./hooks/api/useSessionApi');
jest.mock('use-media');

describe('App', () => {
  it('Renders pristine App', () => {
    (useSessionApi as jest.Mock).mockReturnValue({
      isPristine: true,
    });

    render(<App />);
    expect(screen.getByText(/Welkom/gi)).toBeInTheDocument();
  });

  it('Renders Landing Page', () => {
    (useSessionApi as jest.Mock).mockReturnValue({
      isPristine: false,
      isAuthenticated: false,
    });

    render(<App />);

    expect(screen.getByText('Mijn Amsterdam')).toBeInTheDocument();
    expect(
      screen.getByText('Voor particulieren en eenmanszaken')
    ).toBeInTheDocument();
  });

  it('Renders Dashboard', () => {
    (window as any).scrollTo = jest.fn();
    const session = {
      isPristine: false,
      isAuthenticated: true,
      isDirty: true,
    };
    (useSessionValue as jest.Mock).mockReturnValue(session);
    (useSessionApi as jest.Mock).mockReturnValue(session);

    const { container } = render(<App />);

    expect(screen.getByText('Mijn Amsterdam')).toBeInTheDocument();
    expect(container.querySelector('main h2')).toHaveTextContent('Actueel');
    expect(container.querySelector('main')).toHaveTextContent(/Mijn thema's/gi);
  });
});

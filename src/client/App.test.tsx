import App from './App';
import { render, screen } from '@testing-library/react';
import { useSessionApi, useSessionValue } from './hooks/api/useSessionApi';

jest.mock('./hooks/api/useSessionApi', () => {
  const module = jest.requireActual('./hooks/api/useSessionApi');

  return {
    __esModule: true,
    ...module,
    useSessionApi: jest.fn(),
    useSessionValue: jest.fn(),
  };
});

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
    expect(screen.getByRole('heading', { name: /actueel/i })).toHaveTextContent(
      'Actueel'
    );
    expect(
      screen.getByRole('heading', { name: /mijn thema's/i })
    ).toHaveTextContent(/Mijn thema's/gi);
  });
});

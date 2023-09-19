import { render, waitFor } from '@testing-library/react';
import App from './App';
import { vi, describe, it, expect } from 'vitest';
import { bffApi } from '../test-utils';

const mocks = vi.hoisted(() => {
  return {
    useSessionApi: vi.fn(),
    useSessionValue: vi.fn(),
  };
});

vi.mock('./hooks/api/useSessionApi', (importOriginal) => {
  const module = importOriginal();

  return {
    ...module,
    useSessionApi: mocks.useSessionApi,
    useSessionValue: mocks.useSessionValue,
  };
});

describe('App', () => {
  bffApi
    .get('/services/cms/maintenance-notifications?page=landingspagina')
    .reply(200);
  bffApi.get('/services/all').reply(200);
  bffApi.get('/services/cms').reply(200);

  it('Renders pristine App', () => {
    mocks.useSessionApi.mockReturnValue({
      isPristine: true,
    });

    const screen = render(<App />);
    expect(screen.getByText(/Welkom/i)).toBeInTheDocument();
  });

  it('Renders Landing Page', async () => {
    mocks.useSessionApi.mockReturnValue({
      isPristine: false,
      isAuthenticated: false,
    });

    const screen = render(<App />);

    expect(screen.getByText('Mijn Amsterdam')).toBeInTheDocument();
    await screen.findByText('Voor particulieren en eenmanszaken');
    expect(
      screen.getByText('Voor particulieren en eenmanszaken')
    ).toBeInTheDocument();
  });

  it('Renders Dashboard', async () => {
    const session = {
      isPristine: false,
      isAuthenticated: true,
      isDirty: true,
    };
    mocks.useSessionValue.mockReturnValue(session);
    mocks.useSessionApi.mockReturnValue(session);

    const screen = render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Mijn Amsterdam')).toBeInTheDocument();
    });

    await screen.findByRole('heading', { name: /actueel/i });

    expect(screen.getByRole('heading', { name: /actueel/i })).toHaveTextContent(
      'Actueel'
    );
    expect(
      screen.getByRole('heading', { name: /mijn thema's/i })
    ).toHaveTextContent(/Mijn thema's/gi);
  });
});

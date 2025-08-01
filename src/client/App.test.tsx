import { render } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';

import { App } from './App';
import { bffApi } from '../testing/utils';
import { MIJN_AMSTERDAM } from '../universal/config/app';
import { mockFooterRequest } from './components/MainFooter/MainFooter.test';

const mocks = vi.hoisted(() => {
  return {
    useSessionApi: vi.fn(),
    useSessionValue: vi.fn(),
  };
});

vi.mock('./hooks/api/useSessionApi', async (importOriginal) => {
  const module: object = await importOriginal();

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

  mockFooterRequest();

  it('Renders pristine App', () => {
    mocks.useSessionApi.mockReturnValue({
      isPristine: true,
    });

    const screen = render(<App />);
    expect(screen.getByText(/Welkom/i)).toBeInTheDocument();
  });

  it('Renders Landing Page', async () => {
    bffApi
      .get('/services/cms/maintenance-notifications?page=landingspagina')
      .reply(200);

    mocks.useSessionApi.mockReturnValue({
      isPristine: false,
      isAuthenticated: false,
    });

    const screen = render(<App />);

    expect(screen.getAllByText(MIJN_AMSTERDAM).length).toBe(2);
    await screen.findByText('Voor particulieren en eenmanszaken');
    expect(
      screen.getByText('Voor particulieren en eenmanszaken')
    ).toBeInTheDocument();
  });

  it('Renders Dashboard', async () => {
    bffApi.get('/services/all').reply(200);
    bffApi.get('/services/search-config').reply(200);

    const session = {
      isPristine: false,
      isAuthenticated: true,
      isDirty: true,
    };

    mocks.useSessionValue.mockReturnValue(session);
    mocks.useSessionApi.mockReturnValue(session);

    const screen = render(<App />);

    expect(screen.getAllByText(MIJN_AMSTERDAM).length).toBe(2);
    await screen.findByRole('heading', { name: /Recente berichten/i });

    expect(
      screen.getByRole('heading', { name: /Recente berichten/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /mijn thema's/i })
    ).toBeInTheDocument();
  });
});

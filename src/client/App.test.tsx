import { render } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';

import { App } from './App.tsx';
import { bffApi } from '../testing/utils.ts';
import { MIJN_AMSTERDAM } from '../universal/config/app.ts';
import { mockFooterRequest } from './components/MainFooter/MainFooter.test.tsx';

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

function mockCMSRequest() {
  bffApi
    .get('/services/cms/maintenance-notifications?page=landingspagina')
    .reply(200);
}

describe('App', () => {
  const appLoadingIndicator = new RegExp('Welkom', 'i');

  it('Renders dirty App with loading indicator', () => {
    mockFooterRequest();
    mockCMSRequest();
    mocks.useSessionApi.mockReturnValue({
      isAuthenticated: false,
      isDirty: true,
    });

    const screen = render(<App />);
    expect(screen.queryByText(appLoadingIndicator)).toBeInTheDocument();
  });

  it('Renders pristine App without loading indicator', () => {
    mockFooterRequest();
    mockCMSRequest();
    mocks.useSessionApi.mockReturnValue({
      isAuthenticated: false,
      isDirty: false,
    });

    const screen = render(<App />);
    expect(screen.queryByText(appLoadingIndicator)).not.toBeInTheDocument();
  });

  it('Renders Landing Page', async () => {
    bffApi.get('/services/cms/footer').reply(200);
    bffApi
      .get('/services/cms/maintenance-notifications?page=landingspagina')
      .reply(200);

    mocks.useSessionApi.mockReturnValue({
      isAuthenticated: false,
      isDirty: true,
    });

    const screen = render(<App />);

    expect(screen.getAllByText(MIJN_AMSTERDAM).length).toBe(2);
    await screen.findByText('Voor particulieren en eenmanszaken');
    expect(
      screen.getByText('Voor particulieren en eenmanszaken')
    ).toBeInTheDocument();
  });

  it('Renders Dashboard', async () => {
    bffApi.get('/services/cms/footer').reply(200);
    bffApi.get('/services/all').reply(200);
    bffApi.get('/services/search-config').reply(200);

    const session = {
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

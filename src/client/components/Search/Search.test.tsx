import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { BrowserRouter } from 'react-router';
import { RecoilRoot } from 'recoil';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import { Search } from './Search';
import * as remoteConfig from './search-config.json';
import { bffApi } from '../../../testing/utils';
import { AppState } from '../../../universal/types/App.types';
import { appStateAtom, appStateReadyAtom } from '../../hooks/useAppState';

const appStateMock = {
  VERGUNNINGEN: {
    status: 'OK',
    content: [
      {
        caseType: 'GPK',
        title: 'Europse gehandicaptenparkeerkaart (GPK)',
        identifier: 'Z/000/000008',
        status: 'Ontvangen',
        description: 'Amstel 1 GPK aanvraag',
        link: {
          to: '/vergunningen/gpk/1726584505',
          title: 'Bekijk hoe het met uw aanvraag staat',
        },
      },
    ],
  },
} as unknown as AppState;

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
}));

vi.mock('react-router', async (importOriginal) => {
  const actual: object = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mocks.navigate,
  };
});

describe('<Search />', () => {
  beforeEach(() => {
    bffApi.get('/services/search-config').reply(200, { content: remoteConfig });

    nock('https://api.swiftype.com')
      .defaultReplyHeaders({
        'access-control-allow-origin': '*',
        'access-control-allow-credentials': 'true',
      })
      .get(
        '/api/v1/public/engines/suggest.json?q=gehandicaptenparkeerkaart&engine_key=zw32MDuzZjzNC8VutizD&per_page=10'
      )
      .reply(200, {})
      .get(
        '/api/v1/public/engines/suggest.json?q=Dashboard&engine_key=zw32MDuzZjzNC8VutizD&per_page=10'
      )
      .reply(200, {})
      .get(
        '/api/v1/public/engines/suggest.json?q=weesperplein&engine_key=zw32MDuzZjzNC8VutizD&per_page=10'
      )
      .reply(200, {});
  });

  afterEach(() => {
    nock.cleanAll();
    mocks.navigate.mockClear();
  });

  test('Render search placeholder busy', async () => {
    const screen = render(
      <BrowserRouter>
        <RecoilRoot>
          <Search />
        </RecoilRoot>
      </BrowserRouter>
    );

    await screen.findByPlaceholderText('Zoeken voorbereiden...');
  });

  test('Render search placeholder ready', async () => {
    const screen = render(
      <BrowserRouter>
        <RecoilRoot
          initializeState={(snapshot) => {
            snapshot.set(appStateAtom, {
              VERGUNNINGEN: { status: 'OK', content: [] },
            } as unknown as AppState);
            snapshot.set(appStateReadyAtom, true);
          }}
        >
          <Search />
        </RecoilRoot>
      </BrowserRouter>
    );

    await screen.findByPlaceholderText('Zoeken naar...');
  });

  test('Enter search text and click result', async () => {
    const user = userEvent.setup();
    const onFinishCallback = vi.fn();

    const screen = render(
      <BrowserRouter>
        <RecoilRoot
          initializeState={(snapshot) => {
            snapshot.set(appStateAtom, appStateMock);
            snapshot.set(appStateReadyAtom, true);
          }}
        >
          <Search onFinish={onFinishCallback} />
        </RecoilRoot>
      </BrowserRouter>
    );

    const input = await screen.getByPlaceholderText('Zoeken naar...');

    await user.keyboard('Dashboard');

    expect(screen.getByDisplayValue('Dashboard')).toBeInTheDocument();

    expect(await screen.findByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Home -')).toBeInTheDocument();

    await user.tripleClick(input);

    await user.keyboard('gehandicaptenparkeerkaart');

    expect(input).toHaveValue('gehandicaptenparkeerkaart');

    const vergunning = await screen.findByText('Z/000/000008');
    expect(vergunning).toBeInTheDocument();

    await user.click(vergunning);
    expect(mocks.navigate).toHaveBeenCalledWith(
      '/vergunningen/gpk/1726584505',
      {
        state: {
          from: '/',
          pageType: 'none',
        },
      }
    );

    expect(onFinishCallback).toHaveBeenCalledWith('Resultaat geklikt');
  });

  test('Clear search input', async () => {
    const user = userEvent.setup();

    const screen = render(
      <BrowserRouter>
        <RecoilRoot
          initializeState={(snapshot) => {
            snapshot.set(appStateAtom, appStateMock);
            snapshot.set(appStateReadyAtom, true);
          }}
        >
          <Search />
        </RecoilRoot>
      </BrowserRouter>
    );

    const input = await screen.getByPlaceholderText('Zoeken naar...');

    await user.keyboard('gehandicaptenparkeerkaart');

    expect(input).toHaveValue('gehandicaptenparkeerkaart');

    const vergunning = await screen.findByText('Z/000/000008');
    expect(vergunning).toBeInTheDocument();

    const clearButton = screen.getByLabelText('Verwijder zoekopdracht');
    expect(clearButton).toBeInTheDocument();
    await user.click(clearButton);
    expect(input).toHaveValue('');
    expect(screen.queryByText('Z/000/000008')).not.toBeInTheDocument();
  });

  test('Navigates to search page', async () => {
    const user = userEvent.setup();

    const screen = render(
      <BrowserRouter>
        <RecoilRoot
          initializeState={(snapshot) => {
            snapshot.set(appStateAtom, appStateMock);
            snapshot.set(appStateReadyAtom, true);
          }}
        >
          <Search />
        </RecoilRoot>
      </BrowserRouter>
    );

    await screen.getByPlaceholderText('Zoeken naar...');

    await user.keyboard('gehandicaptenparkeerkaart');
    await screen.findByText('Z/000/000008');

    const submitButton = screen.getByLabelText('Verstuur zoekopdracht');
    expect(submitButton).toBeInTheDocument();
    await user.click(submitButton);

    expect(mocks.navigate).toHaveBeenCalledWith(
      '/zoeken?term=gehandicaptenparkeerkaart'
    );
  });
});

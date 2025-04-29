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

  test('Enter search text', async () => {
    const user = userEvent.setup();

    const screen = render(
      <BrowserRouter>
        <RecoilRoot
          initializeState={(snapshot) => {
            snapshot.set(appStateAtom, {
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
            } as unknown as AppState);
            snapshot.set(appStateReadyAtom, true);
          }}
        >
          <Search />
        </RecoilRoot>
      </BrowserRouter>
    );

    const input = screen.getByPlaceholderText('Zoeken naar...');

    await user.keyboard('gehandicaptenparkeerkaart');

    expect(input).toHaveValue('gehandicaptenparkeerkaart');

    expect(await screen.findByText('Z/000/000008')).toBeInTheDocument();

    await user.tripleClick(input);
    await user.keyboard('Dashboard');

    expect(screen.getByDisplayValue('Dashboard')).toBeInTheDocument();

    expect(await screen.findByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Home -')).toBeInTheDocument();
  });
});

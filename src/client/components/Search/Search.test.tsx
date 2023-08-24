import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { BrowserRouter } from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import { describe, expect, test, beforeEach, afterEach } from 'vitest';
import { bffApi } from '../../../test-utils';
import { appStateAtom } from '../../hooks';
import { Search } from './Search';
import * as bagResponse from './bag-response.json';
import * as remoteConfig from './search-config.json';

describe('<Search />', () => {
  beforeEach(() => {
    bffApi.get('/services/search-config').reply(200, { content: remoteConfig });

    nock('https://api.data.amsterdam.nl')
      .defaultReplyHeaders({
        'access-control-allow-origin': '*',
        'access-control-allow-credentials': 'true',
      })
      .get('/atlas/search/adres/?features=2&q=gehandicaptenparkeerkaart')
      .reply(200, { results: [] })
      .get('/atlas/search/adres/?features=2&q=Dashboard')
      .reply(200, { results: [] })
      .get('/atlas/search/adres/?features=2&q=weesperplein')
      .reply(200, bagResponse);

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
            } as any);
          }}
        >
          <Search />
        </RecoilRoot>
      </BrowserRouter>
    );

    await screen.findByPlaceholderText('Zoeken naar...');
  });

  test('Enter search text', async () => {
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
            } as any);
          }}
        >
          <Search />
        </RecoilRoot>
      </BrowserRouter>
    );

    userEvent.type(
      screen.getByPlaceholderText('Zoeken naar...'),
      'gehandicaptenparkeerkaart'
    );

    expect(screen.getByPlaceholderText('Zoeken naar...')).toHaveValue(
      'gehandicaptenparkeerkaart'
    );

    expect(await screen.findByText('Z/000/000008')).toBeInTheDocument();

    userEvent.type(
      screen.getByPlaceholderText('Zoeken naar...'),
      '{selectall}{del}Dashboard'
    );

    expect(screen.getByPlaceholderText('Zoeken naar...')).toHaveValue(
      'Dashboard'
    );

    expect(await screen.findByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Home -')).toBeInTheDocument();
  });

  test('Finding address', async () => {
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
            } as any);
          }}
        >
          <Search />
        </RecoilRoot>
      </BrowserRouter>
    );

    userEvent.type(
      screen.getByPlaceholderText('Zoeken naar...'),
      'weesperplein'
    );

    expect(await screen.findByText('Weesperplein')).toBeInTheDocument();
    expect(screen.queryByText('Z/000/000008')).not.toBeInTheDocument();
  });
});

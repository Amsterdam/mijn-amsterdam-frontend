import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { BrowserRouter } from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import * as bagResponse from './bag-response.json';
import { Search } from './Search';
import * as remoteConfig from './search-config.json';
import { bffApi, remoteApi } from '../../../test-utils';
import { appStateAtom } from '../../hooks/useAppState';

describe('<Search />', () => {
  beforeEach(() => {
    bffApi.get('/services/search-config').reply(200, { content: remoteConfig });

    remoteApi
      .get('/')
      .times(3)
      .query(true)
      .reply(200, {
        results: [
          {
            _links: {
              self: {
                href: 'https://api.data.amsterdam.nl/bag/v1.1/verblijfsobject/0363010001025757/',
              },
            },
            type: 'verblijfsobject',
            dataset: 'v11_nummeraanduiding',
            adres: 'Weesperplein 1',
            postcode: '',
            straatnaam: 'Weesperplein',
            straatnaam_no_ws: 'Weesperplein',
            huisnummer: 1,
            toevoeging: '1',
            bag_huisletter: '',
            bag_toevoeging: '',
            woonplaats: 'Amsterdam',
            type_adres: 'Hoofdadres',
            status: 'Naamgeving uitgegeven',
            landelijk_id: '0363200000513852',
            vbo_status: 'Verblijfsobject in gebruik',
            adresseerbaar_object_id: '0363010001025757',
            subtype: 'verblijfsobject',
            centroid: [4.907992384700699, 52.362287357287045],
            subtype_id: '0363010001025757',
            _display: 'Weesperplein 1',
          },
        ],
      });

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
            } as any);
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

  test('Finding address', async () => {
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
            } as any);
          }}
        >
          <Search />
        </RecoilRoot>
      </BrowserRouter>
    );

    await user.keyboard('weesperplein');

    expect(await screen.findByText('Weesperplein')).toBeInTheDocument();
    expect(screen.queryByText('Z/000/000008')).not.toBeInTheDocument();
  });
});

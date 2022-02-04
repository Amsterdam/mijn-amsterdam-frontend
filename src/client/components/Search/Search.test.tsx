import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { BrowserRouter } from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import { BFFApiUrls } from '../../config/api';
import { appStateAtom } from '../../hooks';
import { Search } from './Search';
import * as remoteConfig from './search-config.json';
import * as bagResponse from './bag-response.json';

describe('<Search />', () => {
  afterAll(() => {
    // Enable http requests.
    nock.enableNetConnect();
    nock.restore();
  });

  beforeAll(() => {
    // Disable real http requests.
    // All requests should be mocked.
    nock.disableNetConnect();
  });

  beforeEach(() => {
    nock('http://localhost')
      .get(BFFApiUrls.SEARCH_CONFIGURATION)
      .reply(200, { content: remoteConfig });

    nock('https://api.data.amsterdam.nl')
      .get('/atlas/search/adres/?q=gehandicaptenparkeerkaart')
      .reply(200, { results: [] })
      .get('/atlas/search/adres/?q=Dashboard')
      .reply(200, { results: [] })
      .get('/atlas/search/adres/?q=weesperplein')
      .reply(200, bagResponse);

    nock('https://api.swiftype.com')
      .get(
        '/api/v1/public/engines/suggest.json?q=gehandicaptenparkeerkaart&engine_key=zw32MDuzZjzNC8VutizD&per_page=10'
      )
      .reply(200, {});
  });

  afterEach(() => {
    nock.cleanAll();
    jest.clearAllMocks();
  });

  test('Render search placeholder busy', async () => {
    render(
      <BrowserRouter>
        <RecoilRoot>
          <Search />
        </RecoilRoot>
      </BrowserRouter>
    );

    await screen.findByPlaceholderText('Zoeken voorbereiden...');
  });

  test('Render search placeholder ready', async () => {
    render(
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
    render(
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
    render(
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

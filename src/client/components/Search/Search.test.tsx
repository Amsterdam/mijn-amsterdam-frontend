import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { afterEach, describe, expect, test } from 'vitest';

import { Search } from './Search';
import * as remoteConfig from './search-config.json';
import { bffApi } from '../../../testing/utils';
import { AppState } from '../../../universal/types/App.types';
import MockApp from '../../pages/MockApp';

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

function mockSearchConfig() {
  bffApi.get('/services/search-config').reply(200, { content: remoteConfig });
}

function mockSwiftSearch() {
  nock('https://api.swiftype.com')
    .get((uri) => uri.includes('/api/v1/public/engines/suggest.json'))
    .reply(200, {});
}

describe('<Search />', () => {
  afterEach(() => {
    mocks.navigate.mockClear();
  });

  test('Render search placeholder busy', async () => {
    const screen = render(
      <MockApp routePath="/" routeEntry="/" component={Search} />
    );

    await screen.findByPlaceholderText('Zoeken voorbereiden...');
  });

  test('Render search placeholder ready', async () => {
    const screen = render(
      <MockApp
        state={
          {
            VERGUNNINGEN: { status: 'OK', content: [] },
          } as unknown as AppState
        }
        routePath="/"
        routeEntry="/"
        component={Search}
      />
    );

    await screen.findByPlaceholderText('Zoeken naar...');
  });

  test('Enter search text and click result', async () => {
    mockSearchConfig(); // Only fetched once
    mockSwiftSearch(); // Dashboard search
    mockSwiftSearch(); // gehandicaptenparkeerkaart search

    const user = userEvent.setup();
    const onFinishCallback = vi.fn();

    const screen = render(
      <MockApp
        state={appStateMock}
        routePath="/"
        routeEntry="/"
        component={() => <Search onFinish={onFinishCallback} />}
      />
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
    mockSearchConfig(); // Only fetched once
    mockSwiftSearch(); // gehandicaptenparkeerkaart search

    const user = userEvent.setup();

    const screen = render(
      <MockApp
        state={appStateMock}
        routePath="/"
        routeEntry="/"
        component={Search}
      />
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
    mockSearchConfig(); // Only fetched once
    mockSwiftSearch(); // gehandicaptenparkeerkaart search

    const user = userEvent.setup();

    const screen = render(
      <MockApp
        state={appStateMock}
        routePath="/"
        routeEntry="/"
        component={Search}
      />
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

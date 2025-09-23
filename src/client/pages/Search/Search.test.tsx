import { render, screen } from '@testing-library/react';
import nock from 'nock';
import { generatePath } from 'react-router';
import { describe } from 'vitest';

import { SearchPage } from './Search';
import { SearchPageRoute } from './Search-routes';
import { bffApi } from '../../../testing/utils';
import { AppState } from '../../../universal/types/App.types';
import MockApp from '../../pages/MockApp';

const testState = {
  WPI_AANVRAGEN: {
    content: [],
    status: 'OK',
  },
} as unknown as AppState;

describe('<Search />', () => {
  const routeEntry = generatePath(SearchPageRoute.route);
  const routePath = SearchPageRoute.route;

  function Component() {
    return (
      <MockApp
        routeEntry={routeEntry}
        routePath={routePath}
        component={SearchPage}
        state={testState}
      />
    );
  }

  const remoteConfig = {
    staticSearchEntries: [
      {
        url: '/',
        displayTitle: 'Home - Dashboard',
        description: 'Dashboard.',
        keywords: ['Home'],
      },
    ],
    apiSearchConfigs: {
      WPI_AANVRAGEN: {
        keywordsGeneratedFromProps: ['title'],
      },
    },
  };

  test.only('Renders without crashing', async () => {
    bffApi.get('/services/search-config').reply(200, { content: remoteConfig });
    nock('https://api.swiftype.com')
      .get('/api/v1/public/engines/search.json')
      .reply(200, {
        records: { page: [] },
      });
    render(<Component />);
    expect(screen.getByPlaceholderText('Zoeken naar...')).toBeInTheDocument();
  });
});

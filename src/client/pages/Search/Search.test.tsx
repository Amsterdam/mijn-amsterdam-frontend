import React from 'react';

import { cleanup, render, screen } from '@testing-library/react';
import { generatePath } from 'react-router';
import { beforeAll, describe, it } from 'vitest';

import { SearchPage } from './Search';
import { SearchPageRoute } from './Search-routes';
import { bffApi } from '../../../testing/utils';
import { AppState } from '../../../universal/types/App.types';
import MockApp from '../../pages/MockApp';

const testState = {
  WPI_AANVRAGEN: {
    content: [],
  },
} as unknown as AppState;

describe('<Search />', () => {
  const routeEntry = generatePath(SearchPageRoute.route);
  const routePath = SearchPageRoute.route;

  function Component({
    isAppStateReady = false,
  }: {
    isAppStateReady?: boolean;
  }) {
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

  beforeAll(() => {
    bffApi.get('/services/search-config').reply(200, { content: remoteConfig });
  });

  it('Renders without crashing', async () => {
    render(<Component />);

    await screen.findByText('Zoeken voorbereiden...');
    cleanup();

    render(<Component isAppStateReady={true} />);
    await screen.findByPlaceholderText('Zoeken naar...');
  });
});

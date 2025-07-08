import React from 'react';

import { cleanup, render, screen } from '@testing-library/react';
import { generatePath } from 'react-router';
import { MutableSnapshot } from 'recoil';
import { beforeAll, describe, it } from 'vitest';

import { SearchPage } from './Search.tsx';
import { SearchPageRoute } from './Search-routes.ts';
import { bffApi } from '../../../testing/utils.ts';
import { AppState } from '../../../universal/types/App.types.ts';
import { appStateAtom, appStateReadyAtom } from '../../hooks/useAppState.ts';
import MockApp from '../../pages/MockApp.tsx';

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
        initializeState={function initializeState(snapshot: MutableSnapshot) {
          snapshot.set(appStateAtom, testState);
          snapshot.set(appStateReadyAtom, isAppStateReady);
        }}
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

    render(<Component isAppStateReady />);
    await screen.findByPlaceholderText('Zoeken naar...');
  });
});

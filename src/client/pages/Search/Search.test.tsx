import React from 'react';

import { cleanup, render, screen } from '@testing-library/react';
import { generatePath } from 'react-router-dom';
import { MutableSnapshot } from 'recoil';
import { beforeAll, describe, it } from 'vitest';

import Search from './Search';
import { bffApi } from '../../../testing/utils';
import { AppRoutes } from '../../../universal/config/routes';
import { AppState } from '../../../universal/types';
import { appStateAtom, appStateReadyAtom } from '../../hooks/useAppState';
import MockApp from '../../pages/MockApp';

const testState = {
  WPI_AANVRAGEN: {
    content: [],
  },
} as unknown as AppState;

describe('<Search />', () => {
  const routeEntry = generatePath(AppRoutes.SEARCH);
  const routePath = AppRoutes.SEARCH;

  function Component({
    isAppStateReady = false,
  }: {
    isAppStateReady?: boolean;
  }) {
    return (
      <MockApp
        routeEntry={routeEntry}
        routePath={routePath}
        component={Search}
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

    render(<Component isAppStateReady={true} />);
    await screen.findByPlaceholderText('Zoeken naar...');
  });
});

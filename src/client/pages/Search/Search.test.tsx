import { render, screen } from '@testing-library/react';
import { generatePath } from 'react-router-dom';
import { MutableSnapshot } from 'recoil';
import { beforeAll, describe, it } from 'vitest';

import Search from './Search';
import { bffApi } from '../../../testing/test-utils';
import { AppRoutes } from '../../../universal/config/routes';
import { appStateAtom } from '../../hooks/useAppState';
import MockApp from '../../pages/MockApp';

const testState: any = {
  WPI_AANVRAGEN: {
    content: [],
  },
};

function initializeState(snapshot: MutableSnapshot) {
  snapshot.set(appStateAtom, testState);
}

describe('<Search />', () => {
  const routeEntry = generatePath(AppRoutes.SEARCH);
  const routePath = AppRoutes.SEARCH;

  const Component = () => (
    <MockApp
      routeEntry={routeEntry}
      routePath={routePath}
      component={Search}
      initializeState={initializeState}
    />
  );

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

    await screen.findByPlaceholderText('Zoeken naar...');
  });
});

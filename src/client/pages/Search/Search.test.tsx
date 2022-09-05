import { render, screen } from '@testing-library/react';
import nock from 'nock';
import { generatePath } from 'react-router-dom';
import { MutableSnapshot } from 'recoil';
import { AppRoutes } from '../../../universal/config';
import { BFFApiUrls } from '../../config/api';
import { appStateAtom } from '../../hooks';
import MockApp from '../../pages/MockApp';
import Search from './Search';

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
    // Disable real http requests.
    // All requests should be mocked.
    nock.disableNetConnect();

    nock('http://localhost')
      .get(BFFApiUrls.SEARCH_CONFIGURATION)
      .reply(200, { content: remoteConfig });
  });

  it('Renders without crashing', async () => {
    render(<Component />);

    await screen.findByPlaceholderText('Zoeken naar...');
  });
});

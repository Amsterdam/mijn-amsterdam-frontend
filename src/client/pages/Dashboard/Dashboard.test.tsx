import { render } from '@testing-library/react';
import Mockdate from 'mockdate';
import { generatePath } from 'react-router';
import { MutableSnapshot, RecoilState } from 'recoil';
import { describe, expect, it } from 'vitest';

import { AppRoutes } from '../../../universal/config/routes';
import { ThemaIDs } from '../../../universal/config/thema';
import { AppState } from '../../../universal/types/App.types';
import { appStateAtom, appStateReadyAtom } from '../../hooks/useAppState';
import MockApp from '../MockApp';
import { Dashboard } from './Dashboard';
import { remoteApiHost } from '../../../testing/setup';

const testState = {
  BRP: {
    status: 'OK',
    content: {
      mokum: true,
    },
  },
  KVK: {
    status: 'OK',
    content: null,
  },
  MY_LOCATION: { status: 'OK', content: [{ latlng: { lat: 5, lng: 40 } }] },
  NOTIFICATIONS: {
    status: 'OK',
    content: [
      {
        id: 'Not1',
        title: 'Notification',
        description: 'Notificatie1',
        datePublished: '2020-07-24',
        themaID: ThemaIDs.HOME,
        link: {
          to: '/item-1',
          title: 'Linkje!',
        },
      },
      {
        id: 'Not2',
        title: 'Notification',
        description: 'Notificatie2',
        datePublished: '2020-07-24',
        themaID: ThemaIDs.HOME,
        link: {
          to: '/item-2',
          title: 'Linkje!',
        },
      },
      {
        id: 'Not3',
        title: 'Notification',
        description: 'Notificatie3',
        datePublished: '2020-07-24',
        themaID: ThemaIDs.HOME,
        isAlert: true,
        link: {
          to: '/item-3',
          title: 'Linkje!',
        },
      },
    ],
  },

  // Some themas
  BELASTINGEN: {
    content: {
      isKnown: true,
    },
  },
  MILIEUZONE: {
    content: {
      isKnown: true,
    },
  },
  VERGUNNINGEN: {
    isActive: true,
  },
  PARKEREN: {
    content: {
      isKnown: true,
      url: `${remoteApiHost}/sso/portaal/parkeren`,
    },
  },
  WPI_TOZO: {
    content: [{}],
  },
} as unknown as AppState;

function initializeState(snapshot: MutableSnapshot) {
  snapshot.set(appStateAtom as RecoilState<Partial<AppState>>, testState);
  snapshot.set(appStateReadyAtom, true);
}

describe('<Dashboard />', () => {
  const routeEntry = generatePath(AppRoutes.ROOT);
  const routePath = AppRoutes.ROOT;

  function Component() {
    return (
      <MockApp
        routeEntry={routeEntry}
        routePath={routePath}
        component={Dashboard}
        initializeState={initializeState}
      />
    );
  }

  beforeAll(() => {
    Mockdate.set('2021-09-22T14:00:00');
  });

  afterAll(() => {
    Mockdate.reset();
  });

  it('Matches the Full Page snapshot', () => {
    const { asFragment } = render(<Component />);
    expect(asFragment()).toMatchSnapshot();
  });
});

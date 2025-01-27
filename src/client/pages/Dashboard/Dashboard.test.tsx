import { render } from '@testing-library/react';
import { generatePath } from 'react-router-dom';
import { MutableSnapshot, RecoilState } from 'recoil';
import { describe, expect, it } from 'vitest';

import { AppRoutes } from '../../../universal/config/routes';
import { Themas } from '../../../universal/config/thema';
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
  MY_LOCATION: { status: 'OK', content: [{ latlng: { lat: 5, lng: 40 } }] },
  NOTIFICATIONS: {
    status: 'OK',
    content: [
      {
        id: 'Not1',
        title: 'Notification',
        description: 'Notificatie1',
        datePublished: '2020-07-24',
        thema: Themas.ROOT,
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
        thema: Themas.ROOT,
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
        thema: Themas.ROOT,
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

  it('Matches the Full Page snapshot', () => {
    const { asFragment } = render(<Component />);
    expect(asFragment()).toMatchSnapshot();
  });
});

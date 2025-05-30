import { act, render, screen } from '@testing-library/react';
import Mockdate from 'mockdate';
import { generatePath } from 'react-router';
import { MutableSnapshot, RecoilState } from 'recoil';
import { describe, it } from 'vitest';

import { AppState } from '../../../universal/types/App.types';
import { appStateAtom, appStateReadyAtom } from '../../hooks/useAppState';
import MockApp from '../MockApp';
import { Dashboard } from './Dashboard';
import { themaId } from './Dashboard-config';
import { DashboardRoute } from './Dashboard-routes';
import { remoteApiHost } from '../../../testing/setup';
import { toDateFormatted } from '../../../universal/helpers/utils';

const testState = {
  BRP: {
    status: 'OK',
    content: {
      mokum: true,
      persoon: {
        opgemaakteNaam: 'J. Jansen',
      },
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
        title: 'Notification 1',
        description: 'Notificatie1',
        datePublished: '2020-07-24',
        themaID: themaId,
        link: {
          to: '/item-1',
          title: 'Linkje!',
        },
      },
      {
        id: 'Not2',
        title: 'Notification 2',
        description: 'Notificatie2',
        datePublished: '2021-07-24',
        themaID: themaId,
        link: {
          to: '/item-2',
          title: 'Linkje!',
        },
      },
      {
        id: 'Not3',
        title: 'Notification 3',
        description: 'Notificatie3',
        datePublished: '2022-07-24',
        themaID: themaId,
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

vi.mock('axios');
// vi.mock('../../components/Search/useSearch');

function initializeState(snapshot: MutableSnapshot) {
  snapshot.set(appStateAtom as RecoilState<Partial<AppState>>, testState);
  snapshot.set(appStateReadyAtom, true);
}

describe('<Dashboard />', () => {
  const routeEntry = generatePath(DashboardRoute.route);
  const routePath = DashboardRoute.route;

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
    Mockdate.set('2021-09-22T09:00:00');
  });

  afterAll(() => {
    Mockdate.reset();
  });

  it('Renders dashboard correctly', async () => {
    await act(() => {
      render(<Component />);
    });
    expect(
      screen.getByRole('heading', { name: 'Goedemorgen, J. Jansen' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Recente berichten' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: `Mijn thema's` })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'Toon alle' })
    ).not.toBeInTheDocument();

    expect(screen.getByLabelText('Verstuur zoekopdracht')).toBeInTheDocument();
  });

  describe('Notifications', () => {
    test.each(
      testState.NOTIFICATIONS.content?.map((notification) => [
        notification.title,
        toDateFormatted(notification.datePublished),
      ]) || []
    )('Notification %s with date %s exists', (title, datePublished) => {
      render(<Component />);
      expect(screen.getByRole('heading', { name: title })).toBeInTheDocument();
      expect(screen.getByText(datePublished)).toBeInTheDocument();
    });
  });
});

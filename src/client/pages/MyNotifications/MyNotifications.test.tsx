import { render } from '@testing-library/react';
import { generatePath } from 'react-router';
import { MutableSnapshot } from 'recoil';

import { appStateAtom } from '../../hooks/useAppState.ts';
import MockApp from '../MockApp.tsx';
import { MyNotificationsPage } from './MyNotifications.tsx';
import { MyNotificationsRoute } from './MyNotifications-routes.ts';
import type { AppState } from '../../../universal/types/App.types.ts';
import { themaId as themaIdDashboard } from '../Dashboard/Dashboard-config.ts';
import { themaId as themaIdInkomen } from '../Thema/Inkomen/Inkomen-thema-config.ts';
import { themaIdBRP } from '../Thema/Profile/Profile-thema-config.ts';

const testState = {
  NOTIFICATIONS: {
    status: 'OK',
    content: [
      {
        id: 'Not1',
        title: 'Notification',
        description: 'Notificatie1',
        datePublished: '2020-07-24',
        themaID: themaIdDashboard,
        themaTitle: 'Home',
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
        themaID: themaIdBRP,
        themaTitle: 'Mijn gegevens',
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
        themaID: themaIdInkomen,
        themaTitle: 'Inkomen',
        isAlert: true,
        link: {
          to: '/item-3',
          title: 'Linkje!',
        },
      },
    ],
  },
};

function initializeState(snapshot: MutableSnapshot) {
  snapshot.set(appStateAtom, testState as AppState);
}

describe('<MyNotifications />', () => {
  const routeEntry = generatePath(MyNotificationsRoute.route);

  function Component() {
    return (
      <MockApp
        routeEntry={routeEntry}
        routePath={routeEntry}
        component={MyNotificationsPage}
        initializeState={initializeState}
      />
    );
  }

  it('Matches the Full Page snapshot', () => {
    const { asFragment } = render(<Component />);
    expect(asFragment()).toMatchSnapshot();
  });
});

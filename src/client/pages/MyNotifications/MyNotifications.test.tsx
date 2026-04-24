import { render } from '@testing-library/react';
import { generatePath } from 'react-router';

import MockApp from '../MockApp.tsx';
import { MyNotificationsRoute } from './MyNotifications-routes.ts';
import { MyNotificationsPage } from './MyNotifications.tsx';
import type { AppState } from '../../../universal/types/App.types.ts';
import { themaId as themaIdDashboard } from '../Dashboard/Dashboard-config.ts';
import { themaConfig as themaInkomen } from '../Thema/Inkomen/Inkomen-thema-config.ts';
import { themaConfig as themaParkeren } from '../Thema/Parkeren/Parkeren-thema-config.ts';
import { themaConfig as themaProfiles } from '../Thema/Profile/Profile-thema-config.ts';

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
        themaID: themaProfiles.BRP.id,
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
        themaID: themaInkomen.id,
        themaTitle: 'Inkomen',
        isAlert: true,
        link: {
          to: '/item-3',
          title: 'Linkje!',
        },
      },
      {
        id: 'Not4',
        title: 'Notification',
        description: 'Notificatie4',
        datePublished: '2020-07-24',
        themaID: themaParkeren.id,
        themaTitle: 'Parkeren',
        link: {
          to: '/item-4',
          title: 'Linkje!',
        },
      },
    ],
  },
};

describe('<MyNotifications />', () => {
  const routeEntry = generatePath(MyNotificationsRoute.route);

  function Component() {
    return (
      <MockApp
        routeEntry={routeEntry}
        routePath={routeEntry}
        component={MyNotificationsPage}
        state={testState as unknown as AppState}
      />
    );
  }

  it('Matches the Full Page snapshot', () => {
    const { asFragment } = render(<Component />);
    expect(asFragment()).toMatchSnapshot();
  });
});

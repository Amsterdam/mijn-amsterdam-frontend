import { render } from '@testing-library/react';
import { generatePath } from 'react-router';
import { MutableSnapshot } from 'recoil';

import { AppRoutes } from '../../../universal/config/routes';
import { appStateAtom } from '../../hooks/useAppState';
import MockApp from '../MockApp';
import { MyNotificationsPage } from './MyNotifications';
import { ThemaIDs } from '../../../universal/config/thema';
import { themaId as themaIdInkomen } from '../Inkomen/Inkomen-thema-config';
import { themaIdBRP } from '../Profile/Profile-thema-config';

const testState: any = {
  NOTIFICATIONS: {
    status: 'OK',
    content: [
      {
        id: 'Not1',
        title: 'Notification',
        description: 'Notificatie1',
        datePublished: '2020-07-24',
        themaID: ThemaIDs.HOME,
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
  snapshot.set(appStateAtom, testState);
}

describe('<MyNotifications />', () => {
  const routeEntry = generatePath(AppRoutes.NOTIFICATIONS);

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

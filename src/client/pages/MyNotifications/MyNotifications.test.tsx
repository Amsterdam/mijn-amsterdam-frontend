import { render } from '@testing-library/react';

import { generatePath } from 'react-router-dom';
import { MutableSnapshot } from 'recoil';
import { AppRoutes } from '../../../universal/config';
import { appStateAtom } from '../../hooks/useAppState';
import MockApp from '../MockApp';
import MyNotifications from './MyNotifications';
import { Chapters } from '../../../universal/config/chapter';

const testState: any = {
  NOTIFICATIONS: {
    status: 'OK',
    content: [
      {
        id: 'Not1',
        title: 'Notification',
        description: 'Notificatie1',
        datePublished: '2020-07-24',
        chapter: Chapters.ROOT,
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
        chapter: Chapters.BRP,
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
        chapter: Chapters.INKOMEN,
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
  beforeAll(() => {
    (window as any).scrollBy = jest.fn();
    (window.matchMedia as any) = jest.fn(() => {
      return {
        addListener: jest.fn(),
        removeListener: jest.fn(),
      };
    });
  });

  const routeEntry = generatePath(AppRoutes.NOTIFICATIONS);
  const routePath = AppRoutes.NOTIFICATIONS;

  const Component = () => (
    <MockApp
      routeEntry={routeEntry}
      routePath={routePath}
      component={MyNotifications}
      initializeState={initializeState}
    />
  );

  it('Matches the Full Page snapshot', () => {
    const { asFragment } = render(<Component />);
    expect(asFragment()).toMatchSnapshot();
  });
});

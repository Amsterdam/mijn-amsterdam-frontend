import { shallow, mount } from 'enzyme';
import React from 'react';
import { generatePath } from 'react-router-dom';
import { MutableSnapshot } from 'recoil';
import { AppRoutes } from '../../../universal/config/routing';
import { appStateAtom } from '../../hooks/useAppState';
import MockApp from '../MockApp';
import Dashboard from './Dashboard';
import { Chapters } from '../../../universal/config/chapter';

// TIPS, NOTIFICATIONS, CASES, BUURT, HOME

const testState = {
  TIPS: {
    status: 'OK',
    content: [
      {
        id: 'Tip1',
        title: 'Tip!!',
        description: 'Tip over dingen',
        datePublished: '2020-07-24',
        isPersonalized: true,
        reason: ['U ziet deze tip omdat!'],
        link: {
          to: '/lopende-zaak-1',
          title: 'Linkje!',
        },
      },
    ],
  },
  CASES: {
    status: 'OK',
    content: [
      {
        id: 'Case1',
        title: 'Lopende zaak',
        description: 'Tip over dingen',
        datePublished: '2020-07-24',
        link: {
          to: '/lopende-zaak-1',
          title: 'Linkje!',
        },
      },
    ],
  },
  HOME: { status: 'OK', content: { latlng: { lat: 5, lng: 40 } } },
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
        chapter: Chapters.ROOT,
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
        chapter: Chapters.ROOT,
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

describe('<Dashboard />', () => {
  beforeAll(() => {
    (window.scrollTo as any) = jest.fn();
    (window.matchMedia as any) = jest.fn(() => {
      return {
        addListener: jest.fn(),
        removeListener: jest.fn(),
      };
    });
  });

  const routeEntry = generatePath(AppRoutes.ROOT);
  const routePath = AppRoutes.ROOT;

  const Component = () => (
    <MockApp
      routeEntry={routeEntry}
      routePath={routePath}
      component={Dashboard}
      initializeState={initializeState}
    />
  );

  it('Renders without crashing', () => {
    shallow(<Component />);
  });

  it('Matches the Full Page snapshot', () => {
    const html = mount(<Component />).html();

    expect(html).toMatchSnapshot();
  });
});

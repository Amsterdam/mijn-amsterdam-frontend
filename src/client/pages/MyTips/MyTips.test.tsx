import { shallow, mount } from 'enzyme';
import React from 'react';
import { generatePath } from 'react-router-dom';
import { MutableSnapshot } from 'recoil';
import { AppRoutes } from '../../../universal/config/routing';
import { appStateAtom } from '../../hooks/useAppState';
import MockApp from '../MockApp';
import MyTips from './MyTips';

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
          to: '/tip-zaak-1',
          title: 'Linkje!',
        },
      },
      {
        id: 'Tip2',
        title: 'Tip2!!',
        description: 'Tip2  over dingen',
        datePublished: '2020-07-24',
        isPersonalized: false,
        reason: [],
        link: {
          to: '/tip',
          title: 'Linkje!',
        },
      },
    ],
  },
};

function initializeState(snapshot: MutableSnapshot) {
  snapshot.set(appStateAtom, testState);
}

describe('<MyTips />', () => {
  beforeAll(() => {
    (window.scrollTo as any) = jest.fn();
  });

  const routeEntry = generatePath(AppRoutes.TIPS);
  const routePath = AppRoutes.TIPS;

  const Component = () => (
    <MockApp
      routeEntry={routeEntry}
      routePath={routePath}
      component={MyTips}
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

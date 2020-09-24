import { shallow, mount } from 'enzyme';
import React from 'react';
import { generatePath } from 'react-router-dom';
import { MutableSnapshot } from 'recoil';
import { AppRoutes } from '../../../universal/config/routing';
import { appStateAtom } from '../../hooks/useAppState';
import MockApp from '../MockApp';
import StadspasDetail from './StadspasDetail';

const testState = {
  GPASS_STADSPAS: {
    content: [
      {
        id: 'xxx123123123123',
        pasnummer: '123123123123',
        datumAfloop: '2020-12-12',
        naam: 'Ramses rawjingakoli',
        budgets: [
          {
            title: 'KLEDING-EN-EDUCATIE',
            assigned: 220,
            balance: 130,
          },
          {
            title: 'SPORT-EN-SPEL',
            assigned: 220,
            balance: 80,
          },
        ],
      },
      {
        id: 'xxx89899898',
        pasnummer: '89899898',
        datumAfloop: '2021-04-23',
        naam: 'Jawh rawjingakoli',
        budgets: [
          {
            title: 'SPORT-EN-SPEL',
            assigned: 220,
            balance: 80,
          },
        ],
      },
    ],
    status: 'OK',
  },
};

function initializeState(snapshot: MutableSnapshot) {
  snapshot.set(appStateAtom, testState);
}

describe('<StadspasDetail />', () => {
  const routeEntry = generatePath(AppRoutes['INKOMEN/STADSPAS/DETAIL'], {
    id: testState.GPASS_STADSPAS.content[0].id,
  });
  const routePath = AppRoutes['INKOMEN/STADSPAS/DETAIL'];

  const Component = () => (
    <MockApp
      routeEntry={routeEntry}
      routePath={routePath}
      component={StadspasDetail}
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

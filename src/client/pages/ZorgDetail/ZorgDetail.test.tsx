import { mount, shallow } from 'enzyme';
import React from 'react';
import { generatePath } from 'react-router-dom';
import { MutableSnapshot } from 'recoil';
import { AppRoutes } from '../../../universal/config/routing';
import { appStateAtom } from '../../hooks/useAppState';
import MockApp from '../MockApp';
import ZorgDetail from './ZorgDetail';

const testState = {
  WMO: {
    status: 'OK',
    content: [
      {
        id: 'wmo-item-1',
        title: 'Wmo item 1',
        supplier: 'Mantelzorg B.V',
        supplierUrl: '',
        isActual: true,
        link: {
          to: 'http://example.org/ding',
          title: 'Linkje!! naar wmo item 1',
        },
        steps: [
          {
            id: 'wmo-step-1',
            status: 'Levering gestart',
            datePublished: '2020-07-24',
            description: 'De levering van uw thuizorg is gestart',
            documents: [],
            isActive: true,
            isChecked: true,
          },
        ],
      },
    ],
  },
};

function initializeState(snapshot: MutableSnapshot) {
  snapshot.set(appStateAtom, testState);
}

describe('<Zorg />', () => {
  const routeEntry = generatePath(AppRoutes['ZORG/VOORZIENINGEN'], {
    id: testState.WMO.content[0].id,
  });
  const routePath = AppRoutes['ZORG/VOORZIENINGEN'];

  const Component = () => (
    <MockApp
      routeEntry={routeEntry}
      routePath={routePath}
      component={ZorgDetail}
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

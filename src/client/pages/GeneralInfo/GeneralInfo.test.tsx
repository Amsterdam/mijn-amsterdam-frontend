import { shallow, mount } from 'enzyme';
import React from 'react';
import { generatePath } from 'react-router-dom';
import { MutableSnapshot } from 'recoil';
import { AppRoutes } from '../../../universal/config/routing';
import { appStateAtom } from '../../hooks/useAppState';
import MockApp from '../MockApp';
import GeneralInfo from './GeneralInfo';

const testState = {
  CMS_CONTENT: {
    status: 'OK',
    content: {
      generalInfo: {
        content: '<p>Dingen! <a href="http://example.org">Linkje</a></p>',
        title: 'Algemene info',
      },
    },
  },
};

function initializeState(snapshot: MutableSnapshot) {
  snapshot.set(appStateAtom, testState);
}

describe('<GeneralInfo />', () => {
  const routeEntry = generatePath(AppRoutes.GENERAL_INFO);
  const routePath = AppRoutes.GENERAL_INFO;

  const Component = () => (
    <MockApp
      routeEntry={routeEntry}
      routePath={routePath}
      component={GeneralInfo}
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

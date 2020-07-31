import { mount, shallow } from 'enzyme';
import React from 'react';
import { generatePath } from 'react-router-dom';
import { MutableSnapshot } from 'recoil';
import vergunningenData from '../../../server/mock-data/json/vergunningen.json';
import { transformVergunningenData } from '../../../server/services/vergunningen';
import { AppRoutes } from '../../../universal/config/routing';
import { appStateAtom } from '../../hooks/useAppState';
import MockApp from '../MockApp';
import VergunningDetail from './VergunningDetail';

const content = transformVergunningenData(vergunningenData as any);

const testState = {
  VERGUNNINGEN: {
    status: 'OK',
    content,
  },
};

const testState2 = {
  VERGUNNINGEN: {
    status: 'OK',
    content: [],
  },
};

function state(state: any) {
  function initializeState(snapshot: MutableSnapshot) {
    snapshot.set(appStateAtom, state);
  }

  return initializeState;
}

describe('<Vergunningen />', () => {
  const routeEntry = generatePath(AppRoutes['VERGUNNINGEN/DETAIL'], {
    id: content[0].id,
  });
  const routePath = AppRoutes['VERGUNNINGEN/DETAIL'];

  let Component = () => (
    <MockApp
      routeEntry={routeEntry}
      routePath={routePath}
      component={VergunningDetail}
      initializeState={state(testState)}
    />
  );

  it('Renders without crashing', () => {
    shallow(<Component />);
  });

  it('Matches the Full Page snapshot', () => {
    const html = mount(<Component />).html();

    expect(html).toMatchSnapshot();
  });

  it('Matches the Full Page snapshot', () => {
    Component = () => (
      <MockApp
        routeEntry={routeEntry}
        routePath={routePath}
        component={VergunningDetail}
        initializeState={state(testState2)}
      />
    );
    const html = mount(<Component />).html();

    expect(html).toMatchSnapshot();
  });
});

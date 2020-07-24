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

function initializeState(snapshot: MutableSnapshot) {
  snapshot.set(appStateAtom, testState);
}

describe('<Vergunningen />', () => {
  const routeEntry = generatePath(AppRoutes['VERGUNNINGEN/DETAIL'], {
    id: content[0].id,
  });
  const routePath = AppRoutes['VERGUNNINGEN/DETAIL'];

  const Component = () => (
    <MockApp
      routeEntry={routeEntry}
      routePath={routePath}
      component={VergunningDetail}
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

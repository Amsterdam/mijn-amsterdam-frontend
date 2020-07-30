import { mount, shallow } from 'enzyme';
import React from 'react';
import { generatePath } from 'react-router-dom';
import { MutableSnapshot } from 'recoil';
import { AppRoutes } from '../../../universal/config/routing';
import { appStateAtom } from '../../hooks/useAppState';
import MockApp from '../MockApp';
import Burgerzaken from './Burgerzaken';

const identiteitsbewijzen = [
  {
    datumAfloop: '2025-10-15T00:00:00Z',
    datumUitgifte: '2015-10-15T00:00:00Z',
    documentNummer: 'PP57XKG54',
    documentType: 'paspoort',
    id: 'een-hash-van-documentnummer-1',
  },
  {
    datumAfloop: '2020-09-11T00:00:00Z',
    datumUitgifte: '2010-09-11T00:00:00Z',
    documentNummer: 'IE9962819',
    documentType: 'europese identiteitskaart',
    id: 'een-hash-van-documentnummer-2',
  },
];

const testState = {
  BRP: { status: 'OK', content: { identiteitsbewijzen } },
};

function initializeState(snapshot: MutableSnapshot) {
  snapshot.set(appStateAtom, testState);
}

describe('<Burgerzaken />', () => {
  const routeEntry = generatePath(AppRoutes.BURGERZAKEN);
  const routePath = AppRoutes.BURGERZAKEN;

  const Component = () => (
    <MockApp
      routeEntry={routeEntry}
      routePath={routePath}
      component={Burgerzaken}
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

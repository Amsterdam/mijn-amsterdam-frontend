import { render } from '@testing-library/react';

import { generatePath } from 'react-router-dom';
import { MutableSnapshot } from 'recoil';
import { AppRoutes } from '../../../universal/config';
import { appStateAtom } from '../../hooks/useAppState';
import MockApp from '../MockApp';
import BurgerzakenDetail from './BurgerzakenDetail';

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

const testState: any = {
  BRP: { status: 'OK', content: { identiteitsbewijzen } },
};

function initializeState(snapshot: MutableSnapshot) {
  snapshot.set(appStateAtom, testState);
}

describe('<BurgerzakenDetail />', () => {
  const routeEntry = generatePath(AppRoutes.BURGERZAKEN_DOCUMENT, {
    id: identiteitsbewijzen[0].id,
  });
  const routePath = AppRoutes.BURGERZAKEN_DOCUMENT;

  const Component = () => (
    <MockApp
      routeEntry={routeEntry}
      routePath={routePath}
      component={BurgerzakenDetail}
      initializeState={initializeState}
    />
  );

  it('Matches the Full Page snapshot', () => {
    const { asFragment } = render(<Component />);
    expect(asFragment()).toMatchSnapshot();
  });
});

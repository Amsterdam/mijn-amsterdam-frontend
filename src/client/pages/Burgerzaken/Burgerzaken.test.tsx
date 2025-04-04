import { render } from '@testing-library/react';
import { generatePath } from 'react-router';
import { MutableSnapshot } from 'recoil';

import { AppRoutes } from '../../../universal/config/routes';
import { appStateAtom } from '../../hooks/useAppState';
import MockApp from '../MockApp';
import { Burgerzaken } from './Burgerzaken';
import { AppState, IdentiteitsbewijsFrontend } from '../../../universal/types';

const identiteitsbewijzen: IdentiteitsbewijsFrontend[] = [
  {
    datumAfloop: '2025-10-15T00:00:00Z',
    datumUitgifte: '2015-10-15T00:00:00Z',
    datumAfloopFormatted: '15 oktober 2025',
    datumUitgifteFormatted: '15 oktober 2015',
    documentNummer: 'PP57XKG54',
    documentType: 'paspoort',
    title: 'paspoort',
    steps: [],
    id: 'een-hash-van-documentnummer-1',
    link: {
      to: '/burgerzaken/paspoort/een-hash-van-documentnummer-1',
      title: 'Paspoort',
    },
  },
  {
    datumAfloop: '2020-09-11T00:00:00Z',
    datumUitgifte: '2010-09-11T00:00:00Z',
    datumAfloopFormatted: '9 november 2020',
    datumUitgifteFormatted: '9 november 2010',
    documentNummer: 'IE9962819',
    documentType: 'europese identiteitskaart',
    title: 'europese-identiteitskaart',
    steps: [],
    id: 'een-hash-van-documentnummer-2',
    link: {
      to: '/burgerzaken/europese-identiteitskaart/een-hash-van-documentnummer-2',
      title: 'ID-kaart',
    },
  },
];

const testState = {
  BRP: { status: 'OK', content: { identiteitsbewijzen } },
} as AppState;

function initializeState(snapshot: MutableSnapshot) {
  snapshot.set(appStateAtom, testState);
}

describe('<Burgerzaken />', () => {
  const routeEntry = generatePath(AppRoutes.BURGERZAKEN);
  const routePath = AppRoutes.BURGERZAKEN;

  function Component() {
    return (
      <MockApp
        routeEntry={routeEntry}
        routePath={routePath}
        component={Burgerzaken}
        initializeState={initializeState}
      />
    );
  }

  it('Renders without crashing', () => {
    const { asFragment } = render(<Component />);
    expect(asFragment()).toMatchSnapshot();
  });
});

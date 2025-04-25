import { render } from '@testing-library/react';
import { MutableSnapshot } from 'recoil';

import { routeConfig } from './Burgerzaken-thema-config';
import { BurgerzakenThema } from './BurgerzakenThema';
import type { IdentiteitsbewijsFrontend } from '../../../../server/services/profile/brp.types';
import { AppState } from '../../../../universal/types/App.types';
import { appStateAtom } from '../../../hooks/useAppState';
import MockApp from '../../MockApp';

const identiteitsbewijzen: IdentiteitsbewijsFrontend[] = [
  {
    datumAfloop: '2025-10-15T00:00:00Z',
    datumUitgifte: '2015-10-15T00:00:00Z',
    datumAfloopFormatted: '15 oktober 2025',
    datumUitgifteFormatted: '15 oktober 2015',
    documentNummer: 'PP57XKG54',
    documentType: 'paspoort',
    title: 'paspoort',
    id: 'een-hash-van-documentnummer-1',
    link: {
      to: '/burgerzaken/paspoort/een-hash-van-documentnummer-1',
      title: 'Paspoort',
    },
    displayStatus: '',
    steps: [],
  },
  {
    datumAfloop: '2020-09-11T00:00:00Z',
    datumUitgifte: '2010-09-11T00:00:00Z',
    datumAfloopFormatted: '9 november 2020',
    datumUitgifteFormatted: '9 november 2010',
    documentNummer: 'IE9962819',
    documentType: 'europese identiteitskaart',
    title: 'europese-identiteitskaart',
    id: 'een-hash-van-documentnummer-2',
    link: {
      to: '/burgerzaken/europese-identiteitskaart/een-hash-van-documentnummer-2',
      title: 'ID-kaart',
    },
    displayStatus: '',
    steps: [],
  },
];

const testState = {
  BRP: { status: 'OK', content: { identiteitsbewijzen } },
} as AppState;

function initializeState(snapshot: MutableSnapshot) {
  snapshot.set(appStateAtom, testState);
}

describe('<Burgerzaken />', () => {
  const routePath = routeConfig.themaPage.path;

  function Component() {
    return (
      <MockApp
        routeEntry={routePath}
        routePath={routePath}
        component={BurgerzakenThema}
        initializeState={initializeState}
      />
    );
  }

  it('Renders without crashing', () => {
    const { asFragment } = render(<Component />);
    expect(asFragment()).toMatchSnapshot();
  });
});

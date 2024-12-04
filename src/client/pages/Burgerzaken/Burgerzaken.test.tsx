import { render } from '@testing-library/react';
import { generatePath } from 'react-router-dom';
import { MutableSnapshot } from 'recoil';

import { AppRoutes } from '../../../universal/config/routes';
import { appStateAtom } from '../../hooks/useAppState';
import MockApp from '../MockApp';
import { Burgerzaken } from './Burgerzaken';

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

const aktes = [
  {
    registerjaar: '2015',
    aktenummer: '67YUHAK-IO',
    type: 'Huwelijksakte',
    documenten: ['/bla/bla/bla.pdf'],
    id: '70669889',
    link: { to: '/burgerzaken/akte/70669889', title: 'Huwelijksakte' },
    documents: [
      {
        id: 'document-70669889',
        datePublished: '',
        title: 'Huwelijksakte',
        url: '/bla/bla/bla.pdf',
        type: 'pdf',
      },
    ],
  },
  {
    registerjaar: '2003',
    aktenummer: '77566AS',
    type: 'Geboorteakte',
    documenten: ['/bla/bla/bla.pdf'],
    id: '4150191554',
    link: { to: '/burgerzaken/akte/4150191554', title: 'Geboorteakte' },
    documents: [
      {
        id: 'document-4150191554',
        datePublished: '',
        title: 'Geboorteakte',
        url: '/bla/bla/bla.pdf',
        type: 'pdf',
      },
    ],
  },
  {
    registerjaar: '1967',
    aktenummer: 'YHJ5567',
    type: 'Akte van geregistreerd partnerschap',
    documenten: ['/bla/bla/bla.pdf'],
    id: '1975027871',
    link: {
      to: '/burgerzaken/akte/1975027871',
      title: 'Akte van geregistreerd partnerschap',
    },
    documents: [
      {
        id: 'document-1975027871',
        datePublished: '',
        title: 'Akte van geregistreerd partnerschap',
        url: '/bla/bla/bla.pdf',
        type: 'pdf',
      },
    ],
  },
];

const testState: any = {
  BRP: { status: 'OK', content: { identiteitsbewijzen } },
  AKTES: { status: 'OK', content: aktes },
};

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

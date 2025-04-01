import { render } from '@testing-library/react';
import { generatePath } from 'react-router';
import { MutableSnapshot } from 'recoil';

import { AppRoutes } from '../../../universal/config/routes';
import { appStateAtom } from '../../hooks/useAppState';
import MockApp from '../MockApp';
import { BezwarenThemaPagina } from './Bezwaren';

const testState = {
  BEZWAREN: {
    content: [
      {
        identificatie: 'BI.21.014121.001',
        uuid: '68cdd171-b4fd-44cc-a4d3-06b77341f20a',
        startdatum: '2023-04-25',
        bezwaarnummer: 'BI.21.014121.001',
        omschrijving: 'Korte omschrijving van het bezwaar',
        toelichting:
          'Lange uitleg over het bezwaar. Kan dus veel tekst hebben want is vrije invoer.',
        status: null,
        statussen: [
          {
            uuid: 'b62fdaa9-f7ec-45d1-b23c-7f36fa00b393',
            datum: '2023-03-29T10:00:00+02:00',
            statustoelichting: 'Ontvangen',
          },
          {
            uuid: '50dcd25b-a826-422b-b51c-9049dda9600c',
            datum: '2023-03-30T02:53:00+02:00',
            statustoelichting: 'In behandeling',
          },
          {
            uuid: '00000000-0000-0000-0000-000000000000',
            datum: '',
            statustoelichting: 'Afgehandeld',
          },
        ],
        datumbesluit: '01-05-2021',
        datumIntrekking: null,
        einddatum: null,
        primairbesluit: 'F2021.0008',
        primairbesluitdatum: '01-05-2021',
        resultaat: 'Niet-ontvankelijk',
        documenten: [
          {
            id: 'e6ed38c3-a44a-4c16-97c1-89d7ebfca095',
            title: 'Constructie.pdf',
            datePublished: '23 maart 2023',
            url: '#',
          },
          {
            id: 'a9efe7c9-b2d2-4162-bb7b-00189f4c60d0',
            title: 'Test document 01.pdf',
            datePublished: '23 maart 2023',
            url: '#',
          },
          {
            id: '42034d2a-921e-4466-a205-c0356fa6be55',
            title: 'Concept besluit.pdf',
            datePublished: '23 maart 2023',
            url: '#',
          },
          {
            id: 'd5aa70d6-f54b-4bd9-a6c1-42a9fd9acf9c',
            title: 'BZ020001.pdf',
            datePublished: '23 maart 2023',
            url: '#',
          },
        ],
        link: {
          title: 'Bekijk details',
          to: '/bezwaren/68cdd171-b4fd-44cc-a4d3-06b77341f20a',
        },
      },
    ],
    status: 'OK',
  },
};

function initializeState(testState: any) {
  return (snapshot: MutableSnapshot) => snapshot.set(appStateAtom, testState);
}

function setupTestComponent(testState: any) {
  const routeEntry = generatePath(AppRoutes.BEZWAREN);
  const routePath = AppRoutes.BEZWAREN;

  return function Component() {
    return (
      <MockApp
        routeEntry={routeEntry}
        routePath={routePath}
        component={BezwarenThemaPagina}
        initializeState={initializeState(testState)}
      />
    );
  };
}

describe('Bezwaren thema pagina', () => {
  it('Matches the Full Page snapshot when there are requests', () => {
    const Component = setupTestComponent(testState);
    const { asFragment } = render(<Component />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('Matches the Full Page snapshot when there are no requests', () => {
    const Component = setupTestComponent({
      BEZWAREN: {
        status: 'OK',
        content: [],
      },
    });
    const { asFragment } = render(<Component />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('Matches the Full Page snapshot when API gives no result', () => {
    const Component = setupTestComponent({
      BEZWAREN: {
        status: 'ERROR',
        content: null,
      },
    });
    const { asFragment } = render(<Component />);
    expect(asFragment()).toMatchSnapshot();
  });
});

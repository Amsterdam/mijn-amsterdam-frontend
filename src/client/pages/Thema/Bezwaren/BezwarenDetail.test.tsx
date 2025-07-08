import { render } from '@testing-library/react';
import { generatePath } from 'react-router';
import { MutableSnapshot } from 'recoil';

import { routeConfig } from './Bezwaren-thema-config.ts';
import { BezwarenDetail } from './BezwarenDetail.tsx';
import { appStateAtom } from '../../../hooks/useAppState.ts';
import MockApp from '../../MockApp.tsx';

const testState = {
  BEZWAREN: {
    content: [
      {
        identificatie: 'BI.21.014121.001',
        uuid: '68cdd171-b4fd-44cc-a4d3-06b77341f20a',
        uuidEncrypted: 'asdasd98asd098asdjalmsndas-d9aps9dapsdja.sdasd',
        startdatum: '2023-04-25',
        bezwaarnummer: 'BI.21.014121.001',
        omschrijving: 'Korte omschrijving van het bezwaar',
        toelichting:
          'Lange uitleg over het bezwaar. Kan dus veel tekst hebben want is vrije invoer.',
        status: null,
        statusdatum: '01-05-2021',
        statussen: [],
        datumbesluit: '01-05-2021',
        einddatum: '2023-05-10',
        primairbesluit: 'F2021.0008',
        primairbesluitdatum: '01-05-2021',
        resultaat: 'Niet-ontvankelijk',
        datumResultaat: '2023-05-10',
        documenten: [],
        link: {
          title: 'Bekijk details',
          to: '/bezwaren/68cdd171-b4fd-44cc-a4d3-06b77341f20a',
        },
      },
    ],
    status: 'OK',
  },
  BEZWAREN_BAG: {
    abc: null,
    'asdasd98asd098asdjalmsndas-d9aps9dapsdja.sdasd': {
      content: {
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
        documents: [
          {
            id: 'd0fe0ace-6f53-4342-b978-1cf12f8675be',
            title: 'connector.docx',
            datePublished: '30 augustus 2023',
            url: 'http://localhost:5000/api/v1/services/bezwaren/d0fe0ace-6f53-4342-b978-1cf12f8675be/attachments',
            dossiertype: 'Online Aangeleverd',
          },
          {
            id: '736ae47e-e703-4238-a664-100cde4c90a1',
            title: 'Bezwaar_JB20230049.pdf',
            datePublished: '30 augustus 2023',
            url: 'http://localhost:5000/api/v1/services/bezwaren/736ae47e-e703-4238-a664-100cde4c90a1/attachments',
            dossiertype: 'Online Aangeleverd',
          },
          {
            id: 'd0fe0ace-6f53-4342-b978-1cf12f8675be',
            title: 'connector.docx',
            datePublished: '30 augustus 2023',
            url: 'http://localhost:5000/api/v1/services/bezwaren/d0fe0ace-6f53-4342-b978-1cf12f8675be/attachments',
            dossiertype: 'Online Besluitvorming',
          },
          {
            id: '736ae47e-e703-4238-a664-100cde4c90a1',
            title: 'Bezwaar_JB20230049.pdf',
            datePublished: '30 augustus 2023',
            url: 'http://localhost:5000/api/v1/services/bezwaren/736ae47e-e703-4238-a664-100cde4c90a1/attachments',
            dossiertype: 'Online Procesdossier',
          },
        ],
      },
    },
  },
};

function initializeState(testState: any) {
  return (snapshot: MutableSnapshot) => {
    snapshot.set(appStateAtom, testState);
  };
}

function setupTestComponent(id: string) {
  const routeEntry = generatePath(routeConfig.detailPage.path, {
    uuid: id,
  });
  const routePath = routeConfig.detailPage.path;

  return function Component() {
    return (
      <MockApp
        routeEntry={routeEntry}
        routePath={routePath}
        component={BezwarenDetail}
        initializeState={initializeState(testState)}
      />
    );
  };
}

describe('BezwarenDetail', () => {
  describe('No result', () => {
    const Component = setupTestComponent('abc');

    it('Matches the Full Page snapshot', () => {
      const { asFragment } = render(<Component />);
      expect(asFragment()).toMatchSnapshot();
    });
  });

  describe('With result', () => {
    const Component = setupTestComponent(
      '68cdd171-b4fd-44cc-a4d3-06b77341f20a'
    );

    it('Matches the Full Page snapshot', () => {
      const { asFragment } = render(<Component />);
      expect(asFragment()).toMatchSnapshot();
    });
  });
});

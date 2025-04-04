import { render } from '@testing-library/react';

import { LoodMeting } from './LoodMeting';
import { LoodMetingFrontend } from '../../../server/services/bodem/types';
import { AppRoutes } from '../../../universal/config/routes';
import { AppState } from '../../../universal/types';
import { componentCreator } from '../MockApp';

const metingen: LoodMetingFrontend[] = [
  {
    processed: false,
    adres: 'Schipluidenlaan 12A',
    datumAanvraag: '2022-12-01T09:53:11Z',
    datumAanvraagFormatted: '2022-12-01T09:53:11Z',
    decision: null,
    status: 'Ontvangen',
    kenmerk: 'OL-001478',
    aanvraagNummer: 'AV-001447',
    rapportBeschikbaar: false,
    redenAfwijzing: '',
    link: {
      to: '/lood-meting/OL-001478',
      title: 'Bekijk loodmeting',
    },
    document: null,
    steps: [
      {
        status: 'Ontvangen',
        id: '',
        datePublished: '2022-12-01T09:53:11Z',
        isActive: true,
        isChecked: true,
      },
      {
        status: 'In behandeling',
        id: '',
        datePublished: '',
        isActive: false,
        isChecked: false,
      },
      {
        status: 'Afgehandeld',
        id: '',
        datePublished: '',
        isActive: false,
        isChecked: false,
      },
    ],
    datumInbehandeling: null,
    datumAfgehandeld: null,
    datumAfgehandeldFormatted: null,
    rapportId: null,
    id: 'OL-001478',
    title: 'OL-001478',
  },
  {
    processed: true,
    adres: 'Schipluidenlaan 16A',
    datumAanvraag: '2022-11-29T09:54:22Z',
    datumAanvraagFormatted: '29 november 2022',
    datumInbehandeling: '2022-11-29T09:54:44Z',
    datumAfgehandeld: '2022-12-15T08:52:00Z',
    datumAfgehandeldFormatted: '15 december 2022',
    decision: 'Afgewezen',
    status: 'Afgewezen',
    kenmerk: 'OL-001475',
    aanvraagNummer: 'AV-001446',
    rapportBeschikbaar: false,
    rapportId: '6ec7efd6-cb6f-ed11-9561-0022489fda17',
    redenAfwijzing: '',
    link: {
      to: '/lood-meting/OL-001475',
      title: 'Bekijk loodmeting',
    },
    document: null,
    steps: [
      {
        status: 'Ontvangen',
        id: '',
        datePublished: '2022-11-29T09:53:11Z',
        isActive: false,
        isChecked: true,
      },
      {
        status: 'In behandeling',
        id: '',
        datePublished: '2022-11-29T09:54:44Z',
        isActive: false,
        isChecked: true,
      },
      {
        status: 'Afgewezen',
        id: '',
        datePublished: '2022-12-15',
        isActive: true,
        isChecked: true,
      },
    ],
    id: 'OL-001475',
    title: 'OL-001475',
  },
  {
    processed: true,
    adres: 'Schipluidenlaan 16A',
    datumAanvraag: '2022-11-28T12:14:55Z',
    datumAanvraagFormatted: '28 november 2022',
    datumInbehandeling: '2022-11-28T12:24:20Z',
    datumAfgehandeld: '2022-11-28T13:53:42Z',
    datumAfgehandeldFormatted: '28 november 2022',
    decision: 'Verleend',
    status: 'Afgehandeld',
    kenmerk: 'OL-001471',
    aanvraagNummer: 'AV-001444',
    rapportBeschikbaar: true,
    rapportId: '87464b90-176f-ed11-9561-0022489fdff7',
    redenAfwijzing: '',
    link: {
      to: '/lood-meting/OL-001471',
      title: 'Bekijk loodmeting',
    },
    document: {
      title: 'Rapport Lood in de bodem-check',
      id: '87464b90-176f-ed11-9561-0022489fdff7',
      url: 'http://localhost:5000/api/v1/services/lood/87464b90-176f-ed11-9561-0022489fdff7/attachments',
      datePublished: '2022-11-28T13:53:42Z',
    },
    steps: [
      {
        status: 'Ontvangen',
        id: '',
        datePublished: '2022-11-28T12:14:55Z',
        isActive: false,
        isChecked: true,
      },
      {
        status: 'In behandeling',
        id: '',
        datePublished: '2022-11-28T09:54:44Z',
        isActive: false,
        isChecked: true,
      },
      {
        status: 'Afgehandeld',
        id: '',
        datePublished: '2022-11-28T13:53:42Z',
        isActive: true,
        isChecked: true,
      },
    ],
    id: 'OL-001471',
    title: 'OL-001471',
  },
];

const [meting1, meting2, meting3] = metingen;

describe('LoodMeting', () => {
  const createLoodMeting = componentCreator({
    component: LoodMeting,
    routeEntry: AppRoutes['BODEM/LOOD_METING'],
    routePath: AppRoutes['BODEM/LOOD_METING'],
  });

  describe('with results', () => {
    it('should show the correct detailpage for status in behandeling', async () => {
      const Component = createLoodMeting({
        BODEM: {
          content: {
            metingen: [meting1],
          },
          status: 'OK',
        },
      } as AppState);
      const { asFragment } = render(<Component />);

      expect(asFragment()).toMatchSnapshot();
    });

    it('should show the correct detailpage for status afgewezen', async () => {
      const Component = createLoodMeting({
        BODEM: {
          content: {
            metingen: [meting2],
          },
          status: 'OK',
        },
      } as AppState);
      const { asFragment } = render(<Component />);

      expect(asFragment()).toMatchSnapshot();
    });

    it('should show the correct detailpage for status afgehandeld', async () => {
      const Component = createLoodMeting({
        BODEM: {
          content: {
            metingen: [meting3],
          },
          status: 'OK',
        },
      } as AppState);
      const { asFragment } = render(<Component />);

      expect(asFragment()).toMatchSnapshot();
    });
  });

  describe('without results', () => {
    const Component = createLoodMeting({
      BODEM: {
        content: {
          metingen: [],
        },
        status: 'OK',
      },
    } as unknown as AppState);

    it('should show the correct detailpage', async () => {
      const { asFragment } = render(<Component />);

      expect(asFragment()).toMatchSnapshot();
    });
  });
});

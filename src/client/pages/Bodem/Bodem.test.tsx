import { render, within } from '@testing-library/react';

import { AppRoutes } from '../../../universal/config/routes';
import { componentCreator } from '../MockApp';
import { Bodem } from './Bodem';
import { LoodMetingFrontend } from '../../../server/services/bodem/types';
import { AppState } from '../../../universal/types';
import { expectTableHeaders } from '../../helpers/test-utils';

const metingen = [
  {
    adres: 'Schipluidenlaan 12A',
    datumAanvraag: '2022-12-01T09:53:11Z',
    datumAanvraagFormatted: '01 december 2022',
    decision: null,
    displayStatus: 'Ontvangen',
    processed: false,
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
  },
  {
    adres: 'Schipluidenlaan 12A',
    datumAanvraag: '2022-12-01T09:53:11Z',
    datumAanvraagFormatted: '01 december 2022',
    decision: null,
    displayStatus: 'In behandeling',
    processed: false,
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
        isActive: false,
        isChecked: true,
      },
      {
        status: 'In behandeling',
        id: '',
        datePublished: '2022-12-01T09:54:11Z',
        isActive: true,
        isChecked: true,
      },
      {
        status: 'Afgehandeld',
        id: '',
        datePublished: '',
        isActive: false,
        isChecked: false,
      },
    ],
  },
  {
    adres: 'Schipluidenlaan 16A',
    datumAanvraag: '2022-11-29T09:54:22Z',
    datumAanvraagFormatted: '29 november 2022',
    datumInbehandeling: '2022-11-29T09:54:44Z',
    datumAfgehandeld: '2022-12-15T08:52:00Z',
    datumAfgehandeldFormatted: '15 december 2022',
    decision: 'Afgewezen',
    displayStatus: 'Afgewezen',
    processed: true,
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
        datePublished: '2022-12-01T09:53:11Z',
        isActive: false,
        isChecked: true,
      },
      {
        status: 'In behandeling',
        id: '',
        datePublished: '2022-12-01T09:54:11Z',
        isActive: false,
        isChecked: true,
      },
      {
        status: 'Afgehandeld',
        id: '',
        datePublished: '2022-12-01T09:55:11Z',
        isActive: true,
        isChecked: true,
      },
    ],
  },
  {
    adres: 'Schipluidenlaan 16A',
    datumAanvraag: '2022-11-28T12:14:55Z',
    datumAanvraagFormatted: '28 november 2022',
    datumInbehandeling: '2022-11-28T12:24:20Z',
    datumAfgehandeld: '2022-11-28T13:53:42Z',
    datumAfgehandeldFormatted: '28 november 2022',
    decision: 'Afgehandeld'
    status: 'Afgehandeld',
    processed: true,
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
        datePublished: '2022-12-01T09:53:11Z',
        isActive: false,
        isChecked: true,
      },
      {
        status: 'In behandeling',
        id: '',
        datePublished: '2022-12-01T09:54:11Z',
        isActive: false,
        isChecked: true,
      },
      {
        status: 'Afgewezen',
        id: '',
        datePublished: '2022-12-01T09:55:11Z',
        isActive: true,
        isChecked: true,
      },
    ],
  },
] satisfies Partial<LoodMetingFrontend>[];

const testState = {
  BODEM: {
    content: {
      metingen,
    },
    status: 'OK',
  },
} as unknown as AppState;

const createComponent = componentCreator({
  component: Bodem,
  routeEntry: AppRoutes.BODEM,
  routePath: AppRoutes.BODEM,
});

describe('Bodem', () => {
  test('Title is present', () => {
    const MockBodem = createComponent(testState);
    const screen = render(<MockBodem />);

    screen.getByRole('heading', { name: 'Bodem' });
    screen.getByText(
      /Op deze pagina vindt u informatie over uw lood in de bodem-check/
    );
  });

  describe('Tables', () => {
    test('Column headers are correct', () => {
      const MockBodem = createComponent(testState);
      const screen = render(<MockBodem />);

      expectTableHeaders(screen, 'Lopende aanvragen', [
        'Adres',
        'Aangevraagd op',
        'Status',
      ]);
      expectTableHeaders(screen, 'Afgehandelde aanvragen', [
        'Adres',
        'Afgehandeld op',
        'Resultaat',
      ]);
    });

    test('Items are sorted correctly', () => {
      const MockBodem = createComponent(testState);
      const screen = render(<MockBodem />);

      const lopendeAanvraagTableHeader = screen.getByRole('heading', {
        name: 'Lopende aanvragen',
      });

      const afgehandeldeAanvraagTableHeader = screen.getByRole('heading', {
        name: 'Afgehandelde aanvragen',
      });

      const lopendeAanvraagTable = lopendeAanvraagTableHeader.parentElement!;

      const afgehandeldeAanvraagTable =
        afgehandeldeAanvraagTableHeader.parentElement!;

      const statusPatterns = {
        ontvangen: /Ontvangen/,
        inBehandeling: /In behandeling/,
      };

      const decisionPatterns = {
        afgehandeld: /Afgehandeld/,
        afgewezen: /Afgewezen/,
      };

      // Test if the patterns we use are correct in this scope.
      // If we don't do this, we can run into the situation that these -
      // fail and that the tests afterwards always succeed while the pattern is incorrect.
      {
        within(lopendeAanvraagTable).getByRole('cell', {
          name: statusPatterns.ontvangen,
        });

        within(lopendeAanvraagTable).getByRole('cell', {
          name: statusPatterns.inBehandeling,
        });

        within(afgehandeldeAanvraagTable).getByRole('cell', {
          name: decisionPatterns.afgehandeld,
        });

        within(afgehandeldeAanvraagTable).getByRole('cell', {
          name: decisionPatterns.afgewezen,
        });
      }

      const lopendeAanvraagRows = within(
        afgehandeldeAanvraagTable
      ).queryAllByRole('cell', {
        name: `(${statusPatterns.inBehandeling})|${statusPatterns.ontvangen}`,
      });
      expect(lopendeAanvraagRows.length).toBe(0);

      const afgehandeldeAanvraagRows = within(
        lopendeAanvraagTable
      ).queryAllByRole('cell', {
        name: `(${decisionPatterns.afgehandeld})|${decisionPatterns.afgewezen}`,
      });
      expect(afgehandeldeAanvraagRows.length).toBe(0);
    });
  });

  describe('State without results', () => {
    test('No items on page', () => {
      const MockBodem = createComponent({
        BODEM: {
          content: { metingen: [] },
          status: 'OK',
        },
      } as unknown as AppState);
      const screen = render(<MockBodem />);

      screen.getByText(/U heeft geen lopende aanvragen/);
      screen.getByText(/U heeft geen afgehandelde aanvragen/);
    });
  });
});

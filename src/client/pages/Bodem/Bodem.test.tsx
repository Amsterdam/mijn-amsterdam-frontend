import { render, within } from '@testing-library/react';

import { AppRoutes } from '../../../universal/config/routes';
import { componentCreator } from '../MockApp';
import { Bodem } from './Bodem';
import { AppState } from '../../../universal/types';

const testState = {
  BODEM: {
    content: {
      metingen: [
        {
          adres: 'Schipluidenlaan 12A',
          datumAanvraag: '2022-12-01T09:53:11Z',
          datumAanvraagFormatted: '01 december 2022',
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
        },
        {
          adres: 'Schipluidenlaan 12A',
          datumAanvraag: '2022-12-01T09:53:11Z',
          datumAanvraagFormatted: '01 december 2022',
          status: 'In behandeling',
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
          datumBeoordeling: '2022-12-15T08:52:00Z',
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
          datumBeoordeling: '2022-11-28T12:24:19Z',
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
              datePublished: '2022-12-01T09:53:11Z',
              isActive: true,
              isChecked: false,
            },
            {
              status: 'In behandeling',
              id: '',
              datePublished: '2022-12-01T09:54:11Z',
              isActive: true,
              isChecked: false,
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
      ],
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
  describe('With aanvragen', () => {
    const MockBodem = createComponent(testState);

    describe('Tables', () => {
      const screen = render(<MockBodem />);

      const lopendeAanvraagTableHeader = screen.getByRole('heading', {
        name: 'Lopende aanvragen',
      });

      const afgehandeldeAanvraagTableHeader = screen.getByRole('heading', {
        name: 'Afgehandelde aanvragen',
      });

      test('Headers are found', () => {
        expect(lopendeAanvraagTableHeader).toBeInTheDocument();
        expect(afgehandeldeAanvraagTableHeader).toBeInTheDocument();
      });

      const lopendePattern = /(In behandeling)|Ontvangen/;
      const afgehandeldePattern = /Afgehandeld|Afgewezen/;

      const lopendeAanvraagTable =
        lopendeAanvraagTableHeader.nextSibling as HTMLElement;
      if (!lopendeAanvraagTable) {
        throw Error('No sibling found');
      }

      const afgehandeldeAanvraagTable =
        afgehandeldeAanvraagTableHeader.nextSibling as HTMLElement;
      if (!afgehandeldeAanvraagTable) {
        throw Error('No sibling found');
      }

      test('Table items found', () => {
        const lopendeAanvraagRows = within(lopendeAanvraagTable).getAllByRole(
          'row',
          {
            name: lopendePattern,
          }
        );
        expect(lopendeAanvraagRows.length).toBe(2);

        const afgehandeldeAanvraagRows = within(
          afgehandeldeAanvraagTable
        ).queryAllByRole('row', {
          name: afgehandeldePattern,
        });
        expect(afgehandeldeAanvraagRows.length).toBe(2);
      });

      test('Items are not in the wrong place', () => {
        const lopendeAanvraagRows = within(
          afgehandeldeAanvraagTable
        ).queryAllByRole('row', { name: lopendePattern });

        expect(lopendeAanvraagRows.length).toBe(0);

        const afgehandeldeAanvraagRows = within(
          lopendeAanvraagTable
        ).queryAllByRole('row', {
          name: afgehandeldePattern,
        });

        expect(afgehandeldeAanvraagRows.length).toBe(0);
      });
    });

    test('should show the right overviewpage', () => {
      const { asFragment } = render(<MockBodem />);

      expect(asFragment()).toMatchSnapshot();
    });
  });

  describe('without results', () => {
    const MockBodem = createComponent({
      BODEM: {
        content: { metingen: [] },
        status: 'OK',
      },
    } as unknown as AppState);

    test('should show the right overviewpage', () => {
      const { asFragment } = render(<MockBodem />);
      expect(asFragment()).toMatchSnapshot();
    });
  });
});

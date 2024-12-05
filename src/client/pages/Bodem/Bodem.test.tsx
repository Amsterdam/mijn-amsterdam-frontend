import { setupMockApp } from '../setupMockApp';
import { Bodem } from './Bodem';

const testState: any = {
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
      ],
    },
    status: 'OK',
  },
};

describe('Bodem', () => {
  describe('with results', () => {
    const renderBodem = setupMockApp(Bodem, 'BODEM', testState);

    it('should show the right overviewpage', () => {
      const { asFragment } = renderBodem();

      expect(asFragment()).toMatchSnapshot();
    });
  });

  describe('without results', () => {
    const renderBodem = setupMockApp(Bodem, 'BODEM', {
      BODEM: {
        content: {},
      },
    });

    it('should show the right overviewpage', () => {
      const { asFragment } = renderBodem();
      expect(asFragment()).toMatchSnapshot();
    });
  });
});

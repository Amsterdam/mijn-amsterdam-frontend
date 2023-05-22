import LoodMeting from './LoodMeting';
import { setupMockApp } from '../setupMockApp';

const testState: any = {
  BODEM: {
    content: {
      metingen: [
        {
          adres: {
            straat: 'Schipluidenlaan',
            huisnummer: 12,
            huisletter: 'A',
            postcode: '1062HK',
            stad: 'Amsterdam',
          },
          datumAanvraag: '2022-12-01T09:53:11Z',
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
        },
        {
          adres: {
            straat: 'Schipluidenlaan',
            huisnummer: 16,
            huisletter: 'A',
            postcode: '1062HK',
            stad: 'Amsterdam',
          },
          datumAanvraag: '2022-11-29T09:54:22Z',
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
        },
        {
          adres: {
            straat: 'Schipluidenlaan',
            huisnummer: 16,
            huisletter: 'A',
            postcode: '1062HK',
            stad: 'Amsterdam',
          },
          datumAanvraag: '2022-11-28T12:14:55Z',
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
        },
      ],
    },
    status: 'OK',
  },
};

describe('LoodMeting', () => {
  beforeAll(() => {
    (window as any).scrollTo = jest.fn();
  });

  describe('with results', () => {
    const renderLoodMeting = setupMockApp(LoodMeting, 'LOOD_METING', testState);

    it('should show the correct detailpage for status in behandeling', async () => {
      const { asFragment } = renderLoodMeting({
        id: 'OL-001478',
      });

      expect(asFragment()).toMatchSnapshot();
    });

    it('should show the correct detailpage for status afgewezen', async () => {
      const { asFragment } = renderLoodMeting({
        id: 'OL-001475',
      });

      expect(asFragment()).toMatchSnapshot();
    });

    it('should show the correct detailpage for status afgehandeld', async () => {
      const { asFragment } = renderLoodMeting({
        id: 'OL-001471',
      });

      expect(asFragment()).toMatchSnapshot();
    });
  });

  describe('without results', () => {
    const renderLoodMeting = setupMockApp(LoodMeting, 'LOOD_METING', {
      BODEM: {
        content: {},
        status: 'OK',
      },
    });

    it('should show the correct detailpage', async () => {
      const { asFragment } = renderLoodMeting({
        id: 'OL-001478',
      });

      expect(asFragment()).toMatchSnapshot();
    });
  });
});

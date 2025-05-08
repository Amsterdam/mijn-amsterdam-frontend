import MockDate from 'mockdate';

import {
  fetchLoodMetingDocument,
  fetchLoodMetingNotifications,
  fetchLoodmetingen,
} from './loodmetingen';
import document from '../../../../mocks/fixtures/loodmeting-rapport.json';
import metingen from '../../../../mocks/fixtures/loodmetingen.json';
import { getAuthProfileAndToken, remoteApi } from '../../../testing/utils';
import { AuthProfileAndToken } from '../../auth/auth-types';

vi.mock('../../routing/route-helpers.ts', async (importOriginal) => {
  return {
    ...importOriginal,
    generateFullApiUrlBFF: () => 'https://document.doc',
  };
});

describe('Loodmeting', () => {
  const profileAndToken: AuthProfileAndToken = getAuthProfileAndToken();

  afterAll(() => {
    MockDate.reset();
  });

  beforeAll(() => {
    MockDate.set('2023-06-01');
  });

  beforeEach(() => {
    remoteApi
      .post(`/lood_oauth/tenantid/oauth2/v2.0/token`)
      .twice()
      .reply(200, {
        access_token: 'xxx-jwt-xxx',
      });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('loodmenting.service', () => {
    beforeEach(() => {
      remoteApi.post('/lood365/be_getrequestdetails').reply(200, metingen);
    });

    test('All fields are correctly formatted', async () => {
      const res = await fetchLoodmetingen(profileAndToken);

      // Grab the most complete meting item, to prevent checking more then 600 lines of items for nothing.
      const mostCompleteMeting = res.content?.find(
        (meting) =>
          meting.datumAanvraag &&
          meting.datumInbehandeling &&
          meting.datumAfgehandeld &&
          meting.aanvraagNummer === 'AV-001480'
      );

      expect(mostCompleteMeting).toStrictEqual({
        aanvraagNummer: 'AV-001480',
        adres: 'Insulindeweg 26A',
        datumAanvraag: '2023-07-12T12:39:15Z',
        datumAanvraagFormatted: '12 juli 2023',
        datumAfgehandeld: '2023-07-19T12:14:20Z',
        datumAfgehandeldFormatted: '19 juli 2023',
        datumInbehandeling: '2023-07-13T11:18:42Z',
        document: {
          datePublished: '2023-07-19T12:14:20Z',
          id: '690d8303-6f21-ee11-9966-0022489fda17',
          title: 'Rapport Lood in de bodem-check',
          url: 'https://document.doc',
        },
        id: 'OL-001518',
        kenmerk: 'OL-001518',
        link: {
          title: 'Bekijk loodmeting',
          to: '/bodem/lood-meting/OL-001518',
        },
        processed: true,
        rapportBeschikbaar: true,
        rapportId: '690d8303-6f21-ee11-9966-0022489fda17',
        redenAfwijzing: '',
        decision: 'Afgehandeld',
        displayStatus: 'Afgehandeld',
        steps: [
          {
            datePublished: '2023-07-12T12:39:15Z',
            description: '',
            documents: [],
            id: 'first-item',
            isActive: false,
            isChecked: true,
            status: 'Ontvangen',
          },
          {
            datePublished: '2023-07-13T11:18:42Z',
            description: '',
            documents: [],
            id: 'second-item',
            isActive: false,
            isChecked: true,
            status: 'In behandeling',
          },
          {
            datePublished: '2023-07-19T12:14:20Z',
            description: '',
            documents: [],
            id: 'third-item',
            isActive: true,
            isChecked: true,
            status: 'Afgehandeld',
          },
        ],
        title: 'Lood in de bodem-check',
      });
    });

    test('Assigns processed status based on status', async () => {
      const res = await fetchLoodmetingen(profileAndToken);

      const metingen = res.content;
      assert(metingen, 'Test data has metingen');

      const inBehandelingMeting = metingen.find(
        (meting) => meting.displayStatus === 'In behandeling'
      )!;
      expect(inBehandelingMeting.processed).toBe(false);

      const afgewezenMeting = metingen.find(
        (meting) => meting.displayStatus === 'Afgewezen'
      )!;
      expect(afgewezenMeting.processed).toBe(true);

      const afgehandeldMeting = metingen.find(
        (meting) => meting.displayStatus === 'Afgehandeld'
      )!;
      expect(afgehandeldMeting.processed).toBe(true);

      const ontvangenMeting = metingen.find(
        (meting) => meting.displayStatus === 'Ontvangen'
      )!;
      expect(ontvangenMeting.processed).toBe(false);
    });

    it('should return the right notifications', async () => {
      const res = await fetchLoodMetingNotifications(profileAndToken);

      expect(res).toStrictEqual({
        content: {
          notifications: [
            {
              datePublished: '2023-07-19T12:16:23Z',
              description:
                'Uw aanvraag lood in de bodem-check voor Insulindeweg 26 is in behandeling genomen',
              id: 'OL-001521',
              link: {
                title: 'Bekijk details',
                to: '/bodem/lood-meting/OL-001521',
              },
              themaID: 'BODEM',
              themaTitle: 'Bodem',
              title: 'Aanvraag lood in de bodem-check in behandeling',
            },
            {
              datePublished: '2023-07-13T11:19:10Z',
              description:
                'Uw aanvraag lood in de bodem-check voor Insulindeweg 26 is afgewezen.',
              id: 'OL-001520',
              link: {
                title: 'Bekijk details',
                to: '/bodem/lood-meting/OL-001520',
              },
              themaID: 'BODEM',
              themaTitle: 'Bodem',
              title: 'Aanvraag lood in de bodem-check afgewezen',
            },
            {
              datePublished: '2023-07-19T12:14:20Z',
              description:
                'Uw aanvraag lood in de bodem-check voor Insulindeweg 26A is afgehandeld.',
              id: 'OL-001518',
              link: {
                title: 'Bekijk details',
                to: '/bodem/lood-meting/OL-001518',
              },
              themaID: 'BODEM',
              themaTitle: 'Bodem',
              title: 'Aanvraag lood in de bodem-check afgehandeld',
            },
            {
              datePublished: '2023-07-19T12:19:32Z',
              description:
                'Uw aanvraag lood in de bodem-check voor Insulindeweg 641 is in behandeling genomen',
              id: 'OL-001525',
              link: {
                title: 'Bekijk details',
                to: '/bodem/lood-meting/OL-001525',
              },
              themaID: 'BODEM',
              themaTitle: 'Bodem',
              title: 'Aanvraag lood in de bodem-check in behandeling',
            },
            {
              datePublished: '2023-07-18T12:04:57Z',
              description:
                'Uw aanvraag lood in de bodem-check voor Insulindeweg 641 is afgewezen.',
              id: 'OL-001529',
              link: {
                title: 'Bekijk details',
                to: '/bodem/lood-meting/OL-001529',
              },
              themaID: 'BODEM',
              themaTitle: 'Bodem',
              title: 'Aanvraag lood in de bodem-check afgewezen',
            },
            {
              datePublished: '2023-07-12T12:53:41Z',
              description:
                'Uw aanvraag lood in de bodem-check voor Insulindeweg 641 is ontvangen.',
              id: 'OL-001522',
              link: {
                title: 'Bekijk details',
                to: '/bodem/lood-meting/OL-001522',
              },
              themaID: 'BODEM',
              themaTitle: 'Bodem',
              title: 'Aanvraag lood in de bodem-check ontvangen',
            },
            {
              datePublished: '2023-07-18T11:57:06Z',
              description:
                'Uw aanvraag lood in de bodem-check voor Javastraat 603 is afgewezen.',
              id: 'OL-001527',
              link: {
                title: 'Bekijk details',
                to: '/bodem/lood-meting/OL-001527',
              },
              themaID: 'BODEM',
              themaTitle: 'Bodem',
              title: 'Aanvraag lood in de bodem-check afgewezen',
            },
            {
              datePublished: '2023-07-13T11:18:29Z',
              description:
                'Uw aanvraag lood in de bodem-check voor Maanzicht 5 is in behandeling genomen',
              id: 'OL-001519',
              link: {
                title: 'Bekijk details',
                to: '/bodem/lood-meting/OL-001519',
              },
              themaID: 'BODEM',
              themaTitle: 'Bodem',
              title: 'Aanvraag lood in de bodem-check in behandeling',
            },
            {
              datePublished: '2023-07-19T11:17:10Z',
              description:
                'Uw aanvraag lood in de bodem-check voor p.boorsmastraat 30 is ontvangen.',
              id: 'OL-001532',
              link: {
                title: 'Bekijk details',
                to: '/bodem/lood-meting/OL-001532',
              },
              themaID: 'BODEM',
              themaTitle: 'Bodem',
              title: 'Aanvraag lood in de bodem-check ontvangen',
            },
            {
              datePublished: '2023-07-19T12:23:22Z',
              description:
                'Uw aanvraag lood in de bodem-check voor P.Javastraat 603 is in behandeling genomen',
              id: 'OL-001528',
              link: {
                title: 'Bekijk details',
                to: '/bodem/lood-meting/OL-001528',
              },
              themaID: 'BODEM',
              themaTitle: 'Bodem',
              title: 'Aanvraag lood in de bodem-check in behandeling',
            },
            {
              datePublished: '2023-07-19T12:20:42Z',
              description:
                'Uw aanvraag lood in de bodem-check voor Tweede Ceramstraat 1 is afgehandeld.',
              id: 'OL-001526',
              link: {
                title: 'Bekijk details',
                to: '/bodem/lood-meting/OL-001526',
              },
              themaID: 'BODEM',
              themaTitle: 'Bodem',
              title: 'Aanvraag lood in de bodem-check afgehandeld',
            },
            {
              datePublished: '2023-07-24T06:03:03Z',
              description:
                'Uw aanvraag lood in de bodem-check voor Wilhelminastraat 90B is ontvangen.',
              id: 'OL-001534',
              link: {
                title: 'Bekijk details',
                to: '/bodem/lood-meting/OL-001534',
              },
              themaID: 'BODEM',
              themaTitle: 'Bodem',
              title: 'Aanvraag lood in de bodem-check ontvangen',
            },
          ],
        },
        status: 'OK',
      });
    });
  });

  describe('document', () => {
    beforeEach(() => {
      remoteApi
        .post('/lood365/be_getrequestdetails')
        .reply(200, metingen)
        .post('/lood365/be_downloadleadreport')
        .reply(200, document);
    });

    it('should send right API response when downloading a document', async () => {
      const workorderId = '10ecf307-2f26-ee11-9965-0022489fda17';
      const response = await fetchLoodMetingDocument(
        profileAndToken,
        workorderId
      );

      expect(response.content?.filename).toEqual(
        'Rapportage Lood in de bodem-check Weesperplein 8 1018XA Amsterdam.pdf'
      );
      expect(response.content?.data.length).toEqual(6597);
    });
  });
});

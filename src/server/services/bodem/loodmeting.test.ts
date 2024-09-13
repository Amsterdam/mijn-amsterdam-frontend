import nock from 'nock';
import MockDate from 'mockdate';
import { AuthProfileAndToken } from '../../auth/auth-types';
import metingen from '../../../../mocks/fixtures/loodmetingen.json';
import document from '../../../../mocks/fixtures/loodmeting-rapport.json';
import {
  fetchLoodMetingDocument,
  fetchLoodMetingNotifications,
  fetchLoodmetingen,
} from './loodmetingen';
import { remoteApi } from '../../../test-utils';

describe('Loodmeting', () => {
  const requestId = '456';

  const profileAndToken: AuthProfileAndToken = {
    profile: {
      id: '123',
      authMethod: 'digid',
      profileType: 'private',
      sid: '',
    },
    token: 'abc123',
  };

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

    it('should transform the data correctly', async () => {
      const res = await fetchLoodmetingen(requestId, profileAndToken);

      expect(res.content?.metingen.length).toEqual(12);

      // Open aanvraag
      expect(
        res.content?.metingen.find((meting) => meting.kenmerk === 'AV-001481')
      ).toMatchInlineSnapshot(`undefined`);

      // Afgewezen aanvraag
      expect(
        res.content?.metingen.find((meting) => meting.kenmerk === 'AV-001485')
      ).toMatchInlineSnapshot(`undefined`);

      // Afgehandelde aanvraag
      expect(
        res.content?.metingen.find((meting) => meting.kenmerk === 'AV-001480')
      ).toMatchInlineSnapshot(`undefined`);
    });

    it('should return the right notifications', async () => {
      const res = await fetchLoodMetingNotifications(
        requestId,
        profileAndToken
      );

      expect(res).toMatchInlineSnapshot(`
        {
          "content": {
            "notifications": [
              {
                "datePublished": "2023-07-19T12:16:23Z",
                "description": "Uw aanvraag lood in de bodem-check voor Insulindeweg 26 is in behandeling genomen",
                "id": "OL-001521",
                "link": {
                  "title": "Bekijk details",
                  "to": "/lood-meting/OL-001521",
                },
                "thema": "BODEM",
                "title": "Aanvraag lood in de bodem-check in behandeling",
              },
              {
                "datePublished": "2023-07-13T11:19:10Z",
                "description": "Uw aanvraag lood in de bodem-check voor Insulindeweg 26 is afgewezen.",
                "id": "OL-001520",
                "link": {
                  "title": "Bekijk details",
                  "to": "/lood-meting/OL-001520",
                },
                "thema": "BODEM",
                "title": "Aanvraag lood in de bodem-check afgewezen",
              },
              {
                "datePublished": "2023-07-19T12:14:20Z",
                "description": "Uw aanvraag lood in de bodem-check voor Insulindeweg 26A is afgehandeld.",
                "id": "OL-001518",
                "link": {
                  "title": "Bekijk details",
                  "to": "/lood-meting/OL-001518",
                },
                "thema": "BODEM",
                "title": "Aanvraag lood in de bodem-check afgehandeld",
              },
              {
                "datePublished": "2023-07-19T12:19:32Z",
                "description": "Uw aanvraag lood in de bodem-check voor Insulindeweg 641 is in behandeling genomen",
                "id": "OL-001525",
                "link": {
                  "title": "Bekijk details",
                  "to": "/lood-meting/OL-001525",
                },
                "thema": "BODEM",
                "title": "Aanvraag lood in de bodem-check in behandeling",
              },
              {
                "datePublished": "2023-07-18T12:04:57Z",
                "description": "Uw aanvraag lood in de bodem-check voor Insulindeweg 641 is afgewezen.",
                "id": "OL-001529",
                "link": {
                  "title": "Bekijk details",
                  "to": "/lood-meting/OL-001529",
                },
                "thema": "BODEM",
                "title": "Aanvraag lood in de bodem-check afgewezen",
              },
              {
                "datePublished": "2023-07-12T12:53:41Z",
                "description": "Uw aanvraag lood in de bodem-check voor Insulindeweg 641 is ontvangen.",
                "id": "OL-001522",
                "link": {
                  "title": "Bekijk details",
                  "to": "/lood-meting/OL-001522",
                },
                "thema": "BODEM",
                "title": "Aanvraag lood in de bodem-check ontvangen",
              },
              {
                "datePublished": "2023-07-18T11:57:06Z",
                "description": "Uw aanvraag lood in de bodem-check voor Javastraat 603 is afgewezen.",
                "id": "OL-001527",
                "link": {
                  "title": "Bekijk details",
                  "to": "/lood-meting/OL-001527",
                },
                "thema": "BODEM",
                "title": "Aanvraag lood in de bodem-check afgewezen",
              },
              {
                "datePublished": "2023-07-13T11:18:29Z",
                "description": "Uw aanvraag lood in de bodem-check voor Maanzicht 5 is in behandeling genomen",
                "id": "OL-001519",
                "link": {
                  "title": "Bekijk details",
                  "to": "/lood-meting/OL-001519",
                },
                "thema": "BODEM",
                "title": "Aanvraag lood in de bodem-check in behandeling",
              },
              {
                "datePublished": "2023-07-19T11:17:10Z",
                "description": "Uw aanvraag lood in de bodem-check voor p.boorsmastraat 30 is ontvangen.",
                "id": "OL-001532",
                "link": {
                  "title": "Bekijk details",
                  "to": "/lood-meting/OL-001532",
                },
                "thema": "BODEM",
                "title": "Aanvraag lood in de bodem-check ontvangen",
              },
              {
                "datePublished": "2023-07-19T12:23:22Z",
                "description": "Uw aanvraag lood in de bodem-check voor P.Javastraat 603 is in behandeling genomen",
                "id": "OL-001528",
                "link": {
                  "title": "Bekijk details",
                  "to": "/lood-meting/OL-001528",
                },
                "thema": "BODEM",
                "title": "Aanvraag lood in de bodem-check in behandeling",
              },
              {
                "datePublished": "2023-07-19T12:20:42Z",
                "description": "Uw aanvraag lood in de bodem-check voor Tweede Ceramstraat 1 is afgehandeld.",
                "id": "OL-001526",
                "link": {
                  "title": "Bekijk details",
                  "to": "/lood-meting/OL-001526",
                },
                "thema": "BODEM",
                "title": "Aanvraag lood in de bodem-check afgehandeld",
              },
              {
                "datePublished": "2023-07-24T06:03:03Z",
                "description": "Uw aanvraag lood in de bodem-check voor Wilhelminastraat 90B is ontvangen.",
                "id": "OL-001534",
                "link": {
                  "title": "Bekijk details",
                  "to": "/lood-meting/OL-001534",
                },
                "thema": "BODEM",
                "title": "Aanvraag lood in de bodem-check ontvangen",
              },
            ],
          },
          "status": "OK",
        }
      `);
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
        requestId,
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

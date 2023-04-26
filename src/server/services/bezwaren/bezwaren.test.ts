import nock from 'nock';
import { AuthProfileAndToken } from '../../helpers/app';
import { fetchBezwaren, fetchBezwarenNotifications } from './bezwaren';
import bezwarenApiResponse from '../../mock-data/json/bezwaren.json';
import bezwarenDocumenten from '../../mock-data/json/bezwaren-documents.json';
import bezwarenStatus from '../../mock-data/json/bezwaren-status.json';

describe('Bezwaren', () => {
  const requestId = '456';

  const profileAndToken: AuthProfileAndToken = {
    profile: {
      id: '123',
      authMethod: 'digid',
      profileType: 'private',
    },
    token: 'abc123',
  };

  afterAll(() => {
    nock.enableNetConnect();
    nock.restore();
  });

  beforeAll(() => {
    nock.disableNetConnect();
  });

  afterEach(() => {
    nock.cleanAll();
    jest.clearAllMocks();
  });

  describe('fetch bezwaren', () => {
    beforeEach(() => {
      nock('http://localhost')
        .post(`/BFF_BEZWAREN_LIST_ENDPOINT?page=1`)
        .reply(200, bezwarenApiResponse)
        .get('/BFF_BEZWAREN_DOCUMENTS_ENDPOINT')
        .times(4)
        .reply(200, bezwarenDocumenten)
        .get('/BFF_BEZWAREN_STATUS_ENDPOINT')
        .times(4)
        .reply(200, bezwarenStatus);
    });

    it('should return data in expected format', async () => {
      const res = await fetchBezwaren(requestId, profileAndToken);

      expect(bezwarenApiResponse.count).toEqual(res.content?.length);

      expect(res).toMatchInlineSnapshot(`
        Object {
          "content": Array [
            Object {
              "bezwaarnummer": "BI.21.014121.001",
              "datumIntrekking": null,
              "datumbesluit": "01-05-2021",
              "documenten": Array [],
              "einddatum": null,
              "identificatie": "BI.21.014121.001",
              "link": Object {
                "title": "Bekijk details",
                "to": "/bezwaren/68cdd171-b4fd-44cc-a4d3-06b77341f20a",
              },
              "omschrijving": "Korte omschrijving van het bezwaar",
              "ontvangstdatum": "2023-04-25",
              "primairbesluit": "F2021.0008",
              "primairbesluitdatum": "01-05-2021",
              "resultaat": "Niet-ontvankelijk",
              "status": null,
              "statussen": Array [],
              "toelichting": "Lange uitleg over het bezwaar. Kan dus veel tekst hebben want is vrije invoer.",
              "uuid": "68cdd171-b4fd-44cc-a4d3-06b77341f20a",
            },
            Object {
              "bezwaarnummer": "JB.22.000076.001",
              "datumIntrekking": null,
              "datumbesluit": "03-03-2021",
              "documenten": Array [],
              "einddatum": null,
              "identificatie": "JB.22.000076.001",
              "link": Object {
                "title": "Bekijk details",
                "to": "/bezwaren/9804b064-90a3-43b0-bc7c-924f9939888d",
              },
              "omschrijving": null,
              "ontvangstdatum": "2023-04-03",
              "primairbesluit": "TESTRB003",
              "primairbesluitdatum": "03-03-2021",
              "resultaat": "Gegrond",
              "status": null,
              "statussen": Array [],
              "toelichting": "",
              "uuid": "9804b064-90a3-43b0-bc7c-924f9939888d",
            },
            Object {
              "bezwaarnummer": "ZAAK2",
              "datumIntrekking": null,
              "datumbesluit": null,
              "documenten": Array [],
              "einddatum": null,
              "identificatie": "ZAAK2",
              "link": Object {
                "title": "Bekijk details",
                "to": "/bezwaren/cc117d91-1b00-4bae-bbdd-9ea3a6d6d185",
              },
              "omschrijving": "Online bezwaar",
              "ontvangstdatum": "2022-11-04",
              "primairbesluit": null,
              "primairbesluitdatum": null,
              "resultaat": null,
              "status": null,
              "statussen": Array [],
              "toelichting": "Met toelichting",
              "uuid": "cc117d91-1b00-4bae-bbdd-9ea3a6d6d185",
            },
            Object {
              "bezwaarnummer": "ZAAK3",
              "datumIntrekking": null,
              "datumbesluit": "2023-01-03",
              "documenten": Array [],
              "einddatum": "2023-01-04",
              "identificatie": "ZAAK3",
              "link": Object {
                "title": "Bekijk details",
                "to": "/bezwaren/956541b6-7a25-4132-9592-0a509bc7ace0",
              },
              "omschrijving": "Online bezwaar",
              "ontvangstdatum": "2022-11-04",
              "primairbesluit": null,
              "primairbesluitdatum": "2023-01-03",
              "resultaat": null,
              "status": null,
              "statussen": Array [],
              "toelichting": "Met toelichting",
              "uuid": "956541b6-7a25-4132-9592-0a509bc7ace0",
            },
          ],
          "status": "OK",
        }
      `);
    });

    it('should return the right notifications', async () => {
      const res = await fetchBezwarenNotifications(requestId, profileAndToken);

      expect(res).toMatchInlineSnapshot(`
        Object {
          "content": Object {
            "notifications": Array [
              Object {
                "chapter": "BEZWAREN",
                "datePublished": "2023-04-25",
                "description": "Wij hebben uw bezwaar BI.21.014121.001 ontvangen.",
                "id": "BI.21.014121.001",
                "link": Object {
                  "title": "Bekijk details",
                  "to": "/bezwaren/68cdd171-b4fd-44cc-a4d3-06b77341f20a",
                },
                "title": "Bezwaar ontvangen",
              },
              Object {
                "chapter": "BEZWAREN",
                "datePublished": "2023-04-03",
                "description": "Wij hebben uw bezwaar JB.22.000076.001 ontvangen.",
                "id": "JB.22.000076.001",
                "link": Object {
                  "title": "Bekijk details",
                  "to": "/bezwaren/9804b064-90a3-43b0-bc7c-924f9939888d",
                },
                "title": "Bezwaar ontvangen",
              },
              Object {
                "chapter": "BEZWAREN",
                "datePublished": "2022-11-04",
                "description": "Wij hebben uw bezwaar ZAAK2 ontvangen.",
                "id": "ZAAK2",
                "link": Object {
                  "title": "Bekijk details",
                  "to": "/bezwaren/cc117d91-1b00-4bae-bbdd-9ea3a6d6d185",
                },
                "title": "Bezwaar ontvangen",
              },
              Object {
                "chapter": "BEZWAREN",
                "datePublished": "2023-01-04",
                "description": "Er is een besluit over uw bezwaar ZAAK3.",
                "id": "ZAAK3",
                "link": Object {
                  "title": "Bekijk details",
                  "to": "/bezwaren/956541b6-7a25-4132-9592-0a509bc7ace0",
                },
                "title": "Bezwaar afgehandeld",
              },
            ],
          },
          "status": "OK",
        }
      `);
    });
  });
});

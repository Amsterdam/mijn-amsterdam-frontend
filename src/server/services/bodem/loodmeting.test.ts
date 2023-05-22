import nock from 'nock';
import { AuthProfileAndToken } from '../../helpers/app';
import metingen from '../../mock-data/json/loodmetingen.json';
import document from '../../mock-data/json/loodmeting_rapport.json';
import {
  fetchLoodMetingDocument,
  fetchLoodMetingNotifications,
  fetchLoodmetingen,
} from './loodmetingen';

describe('Loodmeting', () => {
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

  describe('service', () => {
    beforeEach(() => {
      nock('http://localhost')
        .get('/be_getrequestdetails')
        .reply(200, metingen);
    });

    describe('metingen', () => {
      it('should transform the data correctly', async () => {
        const res = await fetchLoodmetingen(requestId, profileAndToken);

        expect(res.content?.metingen.length).toEqual(20);

        // Open aanvraag
        expect(res.content?.metingen[2]).toMatchInlineSnapshot(`
          Object {
            "aanvraagNummer": "AV-001313",
            "adres": Object {
              "huisletter": "A",
              "huisnummer": 16,
              "postcode": "1062HK",
              "stad": "Amsterdam",
              "straat": "Schipluidenlaan",
            },
            "datumAanvraag": "2023-04-22T12:08:11Z",
            "datumAfgehandeld": undefined,
            "datumBeoordeling": undefined,
            "datumInbehandeling": undefined,
            "document": null,
            "kenmerk": "OL-001287",
            "link": Object {
              "title": "Bekijk loodmeting",
              "to": "/lood-meting/OL-001287",
            },
            "rapportBeschikbaar": false,
            "rapportId": undefined,
            "redenAfwijzing": "",
            "status": "Ontvangen",
          }
        `);

        // Afgewezen aanvraag
        expect(res.content?.metingen[16]).toMatchInlineSnapshot(`
          Object {
            "aanvraagNummer": "AV-001446",
            "adres": Object {
              "huisletter": "A",
              "huisnummer": 16,
              "postcode": "1062HK",
              "stad": "Amsterdam",
              "straat": "Schipluidenlaan",
            },
            "datumAanvraag": "2022-11-29T09:54:22Z",
            "datumAfgehandeld": undefined,
            "datumBeoordeling": "2022-12-15T08:52:00Z",
            "datumInbehandeling": "2022-11-29T09:54:44Z",
            "document": null,
            "kenmerk": "OL-001475",
            "link": Object {
              "title": "Bekijk loodmeting",
              "to": "/lood-meting/OL-001475",
            },
            "rapportBeschikbaar": false,
            "rapportId": "6ec7efd6-cb6f-ed11-9561-0022489fda17",
            "redenAfwijzing": "",
            "status": "Afgewezen",
          }
        `);

        // Afgehandelde aanvraag
        expect(res.content?.metingen[18]).toMatchInlineSnapshot(`
          Object {
            "aanvraagNummer": "AV-001444",
            "adres": Object {
              "huisletter": "A",
              "huisnummer": 16,
              "postcode": "1062HK",
              "stad": "Amsterdam",
              "straat": "Schipluidenlaan",
            },
            "datumAanvraag": "2022-11-28T12:14:55Z",
            "datumAfgehandeld": "2022-11-28T13:53:42Z",
            "datumBeoordeling": "2022-11-28T12:24:19Z",
            "datumInbehandeling": "2022-11-28T12:24:20Z",
            "document": Object {
              "datePublished": "2022-11-28T13:53:42Z",
              "id": "87464b90-176f-ed11-9561-0022489fdff7",
              "title": "Rapport Lood in de bodem-check",
              "url": "undefined/services/lood/87464b90-176f-ed11-9561-0022489fdff7/attachments",
            },
            "kenmerk": "OL-001471",
            "link": Object {
              "title": "Bekijk loodmeting",
              "to": "/lood-meting/OL-001471",
            },
            "rapportBeschikbaar": true,
            "rapportId": "87464b90-176f-ed11-9561-0022489fdff7",
            "redenAfwijzing": "",
            "status": "Afgehandeld",
          }
        `);
      });
    });

    describe('notifications', () => {
      it('should return the right notifications', async () => {
        const res = await fetchLoodMetingNotifications(
          requestId,
          profileAndToken
        );

        expect(res).toMatchInlineSnapshot(`
          Object {
            "content": Object {
              "notifications": Array [
                Object {
                  "chapter": "BODEM",
                  "datePublished": "2023-04-22T12:08:11Z",
                  "description": "Uw aanvraag lood in de bodem-check voor Schipluidenlaan 16A is ontvangen.",
                  "id": "OL-001287",
                  "link": Object {
                    "title": "Bekijk details",
                    "to": "/lood-meting/OL-001287",
                  },
                  "title": "Aanvraag lood in de bodem-check ontvangen",
                },
                Object {
                  "chapter": "BODEM",
                  "datePublished": "2023-04-22T12:08:11Z",
                  "description": "Uw aanvraag lood in de bodem-check voor Schipluidenlaan 12A is ontvangen.",
                  "id": "OL-001288",
                  "link": Object {
                    "title": "Bekijk details",
                    "to": "/lood-meting/OL-001288",
                  },
                  "title": "Aanvraag lood in de bodem-check ontvangen",
                },
                Object {
                  "chapter": "BODEM",
                  "datePublished": "2023-04-22T12:08:48Z",
                  "description": "Uw aanvraag lood in de bodem-check voor Schipluidenlaan 12A is ontvangen.",
                  "id": "OL-001290",
                  "link": Object {
                    "title": "Bekijk details",
                    "to": "/lood-meting/OL-001290",
                  },
                  "title": "Aanvraag lood in de bodem-check ontvangen",
                },
                Object {
                  "chapter": "BODEM",
                  "datePublished": "2023-04-22T12:08:48Z",
                  "description": "Uw aanvraag lood in de bodem-check voor Schipluidenlaan 16A is ontvangen.",
                  "id": "OL-001289",
                  "link": Object {
                    "title": "Bekijk details",
                    "to": "/lood-meting/OL-001289",
                  },
                  "title": "Aanvraag lood in de bodem-check ontvangen",
                },
                Object {
                  "chapter": "BODEM",
                  "datePublished": "2023-03-29T09:11:28Z",
                  "description": "Uw aanvraag lood in de bodem-check voor Schipluidenlaan 12A is ontvangen.",
                  "id": "OL-001282",
                  "link": Object {
                    "title": "Bekijk details",
                    "to": "/lood-meting/OL-001282",
                  },
                  "title": "Aanvraag lood in de bodem-check ontvangen",
                },
                Object {
                  "chapter": "BODEM",
                  "datePublished": "2023-03-29T09:11:28Z",
                  "description": "Uw aanvraag lood in de bodem-check voor Schipluidenlaan 16A is ontvangen.",
                  "id": "OL-001281",
                  "link": Object {
                    "title": "Bekijk details",
                    "to": "/lood-meting/OL-001281",
                  },
                  "title": "Aanvraag lood in de bodem-check ontvangen",
                },
                Object {
                  "chapter": "BODEM",
                  "datePublished": "2023-03-17T19:48:32Z",
                  "description": "Uw aanvraag lood in de bodem-check voor Schipluidenlaan 12A is ontvangen.",
                  "id": "OL-001274",
                  "link": Object {
                    "title": "Bekijk details",
                    "to": "/lood-meting/OL-001274",
                  },
                  "title": "Aanvraag lood in de bodem-check ontvangen",
                },
                Object {
                  "chapter": "BODEM",
                  "datePublished": "2023-03-17T19:48:32Z",
                  "description": "Uw aanvraag lood in de bodem-check voor Schipluidenlaan 16A is ontvangen.",
                  "id": "OL-001273",
                  "link": Object {
                    "title": "Bekijk details",
                    "to": "/lood-meting/OL-001273",
                  },
                  "title": "Aanvraag lood in de bodem-check ontvangen",
                },
                Object {
                  "chapter": "BODEM",
                  "datePublished": "2023-03-29T09:11:43Z",
                  "description": "Uw aanvraag lood in de bodem-check voor Schipluidenlaan 16A is ontvangen.",
                  "id": "OL-001283",
                  "link": Object {
                    "title": "Bekijk details",
                    "to": "/lood-meting/OL-001283",
                  },
                  "title": "Aanvraag lood in de bodem-check ontvangen",
                },
                Object {
                  "chapter": "BODEM",
                  "datePublished": "2023-03-29T09:11:43Z",
                  "description": "Uw aanvraag lood in de bodem-check voor Schipluidenlaan 12A is ontvangen.",
                  "id": "OL-001284",
                  "link": Object {
                    "title": "Bekijk details",
                    "to": "/lood-meting/OL-001284",
                  },
                  "title": "Aanvraag lood in de bodem-check ontvangen",
                },
                Object {
                  "chapter": "BODEM",
                  "datePublished": "2023-03-29T09:11:50Z",
                  "description": "Uw aanvraag lood in de bodem-check voor Schipluidenlaan 16A is ontvangen.",
                  "id": "OL-001285",
                  "link": Object {
                    "title": "Bekijk details",
                    "to": "/lood-meting/OL-001285",
                  },
                  "title": "Aanvraag lood in de bodem-check ontvangen",
                },
                Object {
                  "chapter": "BODEM",
                  "datePublished": "2023-03-29T09:11:50Z",
                  "description": "Uw aanvraag lood in de bodem-check voor Schipluidenlaan 12A is ontvangen.",
                  "id": "OL-001286",
                  "link": Object {
                    "title": "Bekijk details",
                    "to": "/lood-meting/OL-001286",
                  },
                  "title": "Aanvraag lood in de bodem-check ontvangen",
                },
              ],
            },
            "status": "OK",
          }
        `);
      });
    });
  });

  describe('document', () => {
    beforeEach(() => {
      nock('http://localhost')
        .get('/be_getrequestdetails')
        .reply(200, metingen)
        .post('/be_downloadleadreport')
        .reply(200, document);
    });

    it('should send right API response when downloading a document', async () => {
      const workorderId = '3dc59570-bf6f-ed11-9561-0022489fda17';
      const response = await fetchLoodMetingDocument(
        requestId,
        profileAndToken,
        workorderId
      );

      expect(response.content?.filename).toEqual(
        'Rapportage Lood in de bodem-check Admiraal De Ruijterweg 457 1055MG Amsterdam.pdf'
      );
      expect(response.content?.documentbody.length).toEqual(8796);
    });
  });
});

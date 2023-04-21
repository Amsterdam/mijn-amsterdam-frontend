import nock from 'nock';
import { AuthProfileAndToken } from '../../helpers/app';
import { fetchAVG, fetchAVGNotifications, transformAVGResponse } from './avg';
import apiResponse from '../../mock-data/json/avg.json';

describe('AVG', () => {
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

  describe('transformKlachtenResponse', () => {
    beforeEach(() => {
      nock('http://localhost').post('/smile').reply(200, apiResponse);
    });

    it('should transform the data correctly', () => {
      const res = transformAVGResponse(apiResponse);

      expect(res.verzoeken.length).toEqual(apiResponse.List.length);

      expect(res.verzoeken[2]).toEqual({
        onderwerp: 'Iets over vergunningen',
        datumAfhandeling: '2023-03-19T00:00:00.000Z',
        datumInBehandeling: '2023-03-16T00:00:00.000Z',
        ontvangstDatum: '2022-03-09T00:00:00.000Z',
        opschortenGestartOp: '',
        registratieDatum: '2023-03-16T00:00:00.000Z',
        resultaat: '',
        status: 'Afgehandeld',
        thema: 'Vergunningen',
        type: 'Verwijderen gegevens',
        id: '223',
        link: {
          title: 'AVG verzoek 223',
          to: '/avg/verzoek/223',
        },
      });
    });

    it('should return data in expected format', async () => {
      const res = await fetchAVG(requestId, profileAndToken);

      expect(res).toMatchInlineSnapshot(`
        Object {
          "content": Object {
            "aantal": 2,
            "verzoeken": Array [
              Object {
                "datumAfhandeling": "",
                "datumInBehandeling": "",
                "id": "1",
                "link": Object {
                  "title": "AVG verzoek 1",
                  "to": "/avg/verzoek/1",
                },
                "onderwerp": "Iets met parkeren",
                "ontvangstDatum": "2023-03-06T00:00:00.000Z",
                "opschortenGestartOp": "2023-03-16T00:00:00.000Z",
                "registratieDatum": "",
                "resultaat": "",
                "status": "Open",
                "thema": "Parkeren",
                "type": "Inzage",
              },
              Object {
                "datumAfhandeling": "",
                "datumInBehandeling": "2023-03-30T00:00:00.000Z",
                "id": "2",
                "link": Object {
                  "title": "AVG verzoek 2",
                  "to": "/avg/verzoek/2",
                },
                "onderwerp": "Iets over vergunningen",
                "ontvangstDatum": "2023-03-08T00:00:00.000Z",
                "opschortenGestartOp": "",
                "registratieDatum": "2023-03-30T00:00:00.000Z",
                "resultaat": "",
                "status": "Open",
                "thema": "Vergunningen",
                "type": "Verwijderen gegevens",
              },
              Object {
                "datumAfhandeling": "2023-03-19T00:00:00.000Z",
                "datumInBehandeling": "2023-03-16T00:00:00.000Z",
                "id": "223",
                "link": Object {
                  "title": "AVG verzoek 223",
                  "to": "/avg/verzoek/223",
                },
                "onderwerp": "Iets over vergunningen",
                "ontvangstDatum": "2022-03-09T00:00:00.000Z",
                "opschortenGestartOp": "",
                "registratieDatum": "2023-03-16T00:00:00.000Z",
                "resultaat": "",
                "status": "Afgehandeld",
                "thema": "Vergunningen",
                "type": "Verwijderen gegevens",
              },
              Object {
                "datumAfhandeling": "2023-03-25T00:00:00.000Z",
                "datumInBehandeling": "2023-03-20T00:00:00.000Z",
                "id": "425",
                "link": Object {
                  "title": "AVG verzoek 425",
                  "to": "/avg/verzoek/425",
                },
                "onderwerp": "Iets over vergunningen",
                "ontvangstDatum": "2022-03-10T00:00:00.000Z",
                "opschortenGestartOp": "2022-03-12T00:00:00.000Z",
                "registratieDatum": "2023-03-20T00:00:00.000Z",
                "resultaat": "",
                "status": "Afgehandeld",
                "thema": "Vergunningen",
                "type": "Verwijderen gegevens",
              },
              Object {
                "datumAfhandeling": "",
                "datumInBehandeling": "2023-03-30T00:00:00.000Z",
                "id": "561",
                "link": Object {
                  "title": "AVG verzoek 561",
                  "to": "/avg/verzoek/561",
                },
                "onderwerp": "Iets over mileu",
                "ontvangstDatum": "2023-03-18T00:00:00.000Z",
                "opschortenGestartOp": "2023-04-03T00:00:00.000Z",
                "registratieDatum": "2023-03-30T00:00:00.000Z",
                "resultaat": "",
                "status": "Open",
                "thema": "Mileuzone",
                "type": "Aanpassen gegevens",
              },
            ],
          },
          "status": "OK",
        }
      `);
    });

    it('should return the right notifications', async () => {
      const res = await fetchAVGNotifications(requestId, profileAndToken);

      expect(res).toMatchInlineSnapshot(`
        Object {
          "content": Object {
            "notifications": Array [
              Object {
                "chapter": "AVG",
                "datePublished": "2023-03-16T00:00:00.000Z",
                "description": "Wij hebben meer informatie en tijd nodig om uw AVG verzoek te behandelen.",
                "id": "avg-1-notification",
                "link": Object {
                  "title": "Bekijk details",
                  "to": "/avg/verzoek/1",
                },
                "title": "AVG verzoek meer informatie nodig",
              },
              Object {
                "chapter": "AVG",
                "datePublished": "2023-03-30T00:00:00.000Z",
                "description": "Uw AVG verzoek is in behandeling genomen.",
                "id": "avg-2-notification",
                "link": Object {
                  "title": "Bekijk details",
                  "to": "/avg/verzoek/2",
                },
                "title": "AVG verzoek in behandeling",
              },
              Object {
                "chapter": "AVG",
                "datePublished": "2023-03-19T00:00:00.000Z",
                "description": "Uw AVG verzoek is afgehandeld.",
                "id": "avg-223-notification",
                "link": Object {
                  "title": "Bekijk details",
                  "to": "/avg/verzoek/223",
                },
                "title": "AVG verzoek afgehandeld",
              },
              Object {
                "chapter": "AVG",
                "datePublished": "2023-03-25T00:00:00.000Z",
                "description": "Uw AVG verzoek is afgehandeld.",
                "id": "avg-425-notification",
                "link": Object {
                  "title": "Bekijk details",
                  "to": "/avg/verzoek/425",
                },
                "title": "AVG verzoek afgehandeld",
              },
              Object {
                "chapter": "AVG",
                "datePublished": "2023-03-30T00:00:00.000Z",
                "description": "Uw AVG verzoek is in behandeling genomen.",
                "id": "avg-561-notification",
                "link": Object {
                  "title": "Bekijk details",
                  "to": "/avg/verzoek/561",
                },
                "title": "AVG verzoek in behandeling",
              },
            ],
          },
          "status": "OK",
        }
      `);
    });
  });
});

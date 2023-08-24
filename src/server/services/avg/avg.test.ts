import { describe, expect, beforeEach, afterEach, vi, it } from 'vitest';
import { AuthProfileAndToken } from '../../helpers/app';
import { fetchAVG, fetchAVGNotifications, transformAVGResponse } from './avg';
import apiResponse from '../../mock-data/json/avg.json';
import avgThemasResponse from '../../mock-data/json/avg-themas.json';
import { remoteApi } from '../../../test-utils';

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

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('transformKlachtenResponse', () => {
    beforeEach(() => {
      remoteApi
        .post('/smile', /readavgverzoek/gi)
        .reply(200, apiResponse)
        .post('/smile', /readthemaperavgverzoek/gi)
        .reply(200, avgThemasResponse);
    });

    it('should transform the data correctly', () => {
      const res = transformAVGResponse(apiResponse);

      expect(res.verzoeken.length).toEqual(apiResponse.List.length);

      expect(res.verzoeken[2]).toEqual({
        datumAfhandeling: '2023-03-19T00:00:00.000Z',
        datumInBehandeling: '2023-03-16T00:00:00.000Z',
        ontvangstDatum: '2022-03-09T00:00:00.000Z',
        opschortenGestartOp: '',
        registratieDatum: '2023-03-16T00:00:00.000Z',
        resultaat: '',
        status: 'Afgehandeld',
        themas: [],
        toelichting: 'Iets over vergunningen',
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
        {
          "content": {
            "verzoeken": [
              {
                "datumAfhandeling": "",
                "datumInBehandeling": "",
                "id": "1",
                "link": {
                  "title": "AVG verzoek 1",
                  "to": "/avg/verzoek/1",
                },
                "ontvangstDatum": "2023-03-06T00:00:00.000Z",
                "opschortenGestartOp": "2023-03-16T00:00:00.000Z",
                "registratieDatum": "",
                "resultaat": "",
                "status": "Open",
                "themas": [
                  "avg thema 2",
                ],
                "toelichting": "Iets met parkeren",
                "type": "Inzage",
              },
              {
                "datumAfhandeling": "",
                "datumInBehandeling": "2023-03-30T00:00:00.000Z",
                "id": "2",
                "link": {
                  "title": "AVG verzoek 2",
                  "to": "/avg/verzoek/2",
                },
                "ontvangstDatum": "2023-03-08T00:00:00.000Z",
                "opschortenGestartOp": "",
                "registratieDatum": "2023-03-30T00:00:00.000Z",
                "resultaat": "",
                "status": "Open",
                "themas": [
                  "avg thema 3",
                ],
                "toelichting": "Iets over vergunningen",
                "type": "Verwijderen gegevens",
              },
              {
                "datumAfhandeling": "2023-03-19T00:00:00.000Z",
                "datumInBehandeling": "2023-03-16T00:00:00.000Z",
                "id": "223",
                "link": {
                  "title": "AVG verzoek 223",
                  "to": "/avg/verzoek/223",
                },
                "ontvangstDatum": "2022-03-09T00:00:00.000Z",
                "opschortenGestartOp": "",
                "registratieDatum": "2023-03-16T00:00:00.000Z",
                "resultaat": "",
                "status": "Afgehandeld",
                "themas": [
                  "avg thema 3",
                ],
                "toelichting": "Iets over vergunningen",
                "type": "Verwijderen gegevens",
              },
              {
                "datumAfhandeling": "2023-03-25T00:00:00.000Z",
                "datumInBehandeling": "2023-03-20T00:00:00.000Z",
                "id": "425",
                "link": {
                  "title": "AVG verzoek 425",
                  "to": "/avg/verzoek/425",
                },
                "ontvangstDatum": "2022-03-10T00:00:00.000Z",
                "opschortenGestartOp": "2022-03-12T00:00:00.000Z",
                "registratieDatum": "2023-03-20T00:00:00.000Z",
                "resultaat": "",
                "status": "Afgehandeld",
                "themas": [
                  "avg thema 2",
                ],
                "toelichting": "Iets over vergunningen",
                "type": "Verwijderen gegevens",
              },
              {
                "datumAfhandeling": "",
                "datumInBehandeling": "2023-05-30T00:00:00.000Z",
                "id": "561",
                "link": {
                  "title": "AVG verzoek 561",
                  "to": "/avg/verzoek/561",
                },
                "ontvangstDatum": "2023-03-18T00:00:00.000Z",
                "opschortenGestartOp": "2023-06-03T00:00:00.000Z",
                "registratieDatum": "2023-05-30T00:00:00.000Z",
                "resultaat": "",
                "status": "Open",
                "themas": [
                  "avg thema 1",
                  "avg thema 2",
                  "avg thema 3",
                  "avg thema 4",
                ],
                "toelichting": "Iets over mileu",
                "type": "Aanpassen gegevens",
              },
              {
                "datumAfhandeling": "",
                "datumInBehandeling": "",
                "id": "156",
                "link": {
                  "title": "AVG verzoek 156",
                  "to": "/avg/verzoek/156",
                },
                "ontvangstDatum": "2023-03-18T00:00:00.000Z",
                "opschortenGestartOp": "",
                "registratieDatum": "",
                "resultaat": "",
                "status": "Open",
                "themas": [
                  "avg thema 1",
                ],
                "toelichting": "Iets over mileu",
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
        {
          "content": {
            "notifications": [
              {
                "chapter": "AVG",
                "datePublished": "2023-03-16T00:00:00.000Z",
                "description": "Wij hebben meer informatie en tijd nodig om uw AVG verzoek te behandelen.",
                "id": "avg-1-notification",
                "link": {
                  "title": "Bekijk details",
                  "to": "/avg/verzoek/1",
                },
                "title": "AVG verzoek meer informatie nodig",
              },
              {
                "chapter": "AVG",
                "datePublished": "2023-03-30T00:00:00.000Z",
                "description": "Uw AVG verzoek is in behandeling genomen.",
                "id": "avg-2-notification",
                "link": {
                  "title": "Bekijk details",
                  "to": "/avg/verzoek/2",
                },
                "title": "AVG verzoek in behandeling",
              },
              {
                "chapter": "AVG",
                "datePublished": "2023-03-19T00:00:00.000Z",
                "description": "Uw AVG verzoek is afgehandeld.",
                "id": "avg-223-notification",
                "link": {
                  "title": "Bekijk details",
                  "to": "/avg/verzoek/223",
                },
                "title": "AVG verzoek afgehandeld",
              },
              {
                "chapter": "AVG",
                "datePublished": "2023-03-25T00:00:00.000Z",
                "description": "Uw AVG verzoek is afgehandeld.",
                "id": "avg-425-notification",
                "link": {
                  "title": "Bekijk details",
                  "to": "/avg/verzoek/425",
                },
                "title": "AVG verzoek afgehandeld",
              },
              {
                "chapter": "AVG",
                "datePublished": "2023-06-03T00:00:00.000Z",
                "description": "Wij hebben meer informatie en tijd nodig om uw AVG verzoek te behandelen.",
                "id": "avg-561-notification",
                "link": {
                  "title": "Bekijk details",
                  "to": "/avg/verzoek/561",
                },
                "title": "AVG verzoek meer informatie nodig",
              },
              {
                "chapter": "AVG",
                "datePublished": "2023-03-18T00:00:00.000Z",
                "description": "Uw AVG verzoek is ontvangen.",
                "id": "avg-156-notification",
                "link": {
                  "title": "Bekijk details",
                  "to": "/avg/verzoek/156",
                },
                "title": "AVG verzoek ontvangen",
              },
            ],
          },
          "status": "OK",
        }
      `);
    });
  });
});

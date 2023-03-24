import nock from 'nock';
import vergunningenMockData from '../mock-data/json/vergunningen.json';
import { BFF_MS_API_BASE_URL } from '../config';
import { AuthProfileAndToken } from '../helpers/app';
import { fetchHorecaNotifications, fetchHorecaVergunningen } from './horeca';

describe('Horeca service', () => {
  const authProfileAndToken: AuthProfileAndToken = {
    profile: { authMethod: 'digid', profileType: 'private' },
    token: 'xxxxxx',
  };

  afterAll(() => {
    nock.enableNetConnect();
    nock.restore();
  });

  beforeAll(() => {
    nock.disableNetConnect();
  });

  beforeEach(() => {
    nock(BFF_MS_API_BASE_URL)
      .get(`/decosjoin/getvergunningen`)
      .reply(200, vergunningenMockData);
  });

  it('should return only horeca vergunningen', async () => {
    const result = await fetchHorecaVergunningen('x', authProfileAndToken);

    expect(result.content.length).toEqual(1);
    expect(result.content).toMatchInlineSnapshot(`
      Array [
        Object {
          "caseType": "Horeca vergunning exploitatie Horecabedrijf",
          "dateEnd": "2024-01-02T00:00:00",
          "dateProcessed": "2022-11-01T00:00:00",
          "dateRequest": "2022-10-20T00:00:00",
          "dateStart": "2022-11-01T00:00:00",
          "dateStartPermit": "2022-11-02T00:00:00",
          "dateWorkflowActive": null,
          "decision": null,
          "id": "3209922248",
          "identifier": "Z/23/1808826",
          "link": Object {
            "title": "Bekijk hoe het met uw aanvraag staat",
            "to": "/horeca/horeca-vergunning-exploitatie-horecabedrijf/3209922248",
          },
          "location": "J.J. Cremerplein 54I 1054 TM Amsterdam",
          "numberOfPermits": 10,
          "processed": false,
          "status": "Ontvangen",
          "title": "Horeca vergunning exploitatie Horecabedrijf",
        },
      ]
    `);
  });

  it('should return the expected notifications', async () => {
    const result = await fetchHorecaNotifications('x', authProfileAndToken);

    expect(result.content).toMatchInlineSnapshot(`
      Object {
        "notifications": Array [
          Object {
            "chapter": "VERGUNNINGEN",
            "datePublished": "2022-10-20T00:00:00",
            "description": "Uw aanvraag voor een horeca vergunning exploitatie horecabedrijf is in behandeling genomen.",
            "id": "vergunning-3209922248-notification",
            "link": Object {
              "title": "Bekijk details",
              "to": "/horeca/horeca-vergunning-exploitatie-horecabedrijf/3209922248",
            },
            "subject": "3209922248",
            "title": "Aanvraag horeca vergunning exploitatie horecabedrijf in behandeling",
          },
        ],
      }
    `);
  });
});

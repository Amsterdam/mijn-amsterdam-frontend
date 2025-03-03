import MockDate from 'mockdate';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { fetchHorecaNotifications, fetchHorecaVergunning } from './horeca';
import vergunningenMockData from '../../../mocks/fixtures/vergunningen.json';
import { remoteApi } from '../../testing/utils';
import { AuthProfileAndToken } from '../auth/auth-types';

describe('Horeca service', () => {
  const authProfileAndToken: AuthProfileAndToken = {
    profile: { authMethod: 'digid', profileType: 'private', id: '', sid: '' },
    token: 'xxxxxx',
  };

  beforeAll(() => {
    MockDate.set('2022-06-14');
  });

  afterAll(() => {
    MockDate.reset();
  });

  it('should return only horeca vergunningen', async () => {
    remoteApi
      .get(`/decosjoin/getvergunningen`)
      .reply(200, vergunningenMockData);

    const result = await fetchHorecaVergunning('x', authProfileAndToken);

    expect(result.content.length).toEqual(3);
    expect(result.content).toMatchInlineSnapshot(`
      [
        {
          "caseType": "Horeca vergunning exploitatie Horecabedrijf",
          "dateDecision": "2023-04-28",
          "dateEnd": "2023-06-21",
          "dateRequest": "2023-04-26",
          "dateRequestFormatted": "26 april 2023",
          "dateStart": null,
          "dateWorkflowActive": "2023-04-27",
          "decision": "Verleend",
          "description": "Nieuwe aanvraag, alcohol vrij, Het restotje, Berkelstraat  1",
          "documentsUrl": "http://bff-api-host/api/v1/services/vergunningen/documents/list/gAAAAABkWjUO7A9AhzlW9X40GruHXP-NVljBzvfRd5xoYu06JeI8_-6iU1x-YbZylG9r1IrOPkcIYboFSaN44tZ-frbPjndv-cOVYN18x5uwswBfJsWCYnz1NRrvV22dWHKLR9qAsE6J",
          "id": "1234418712",
          "identifier": "Z/23/1984708",
          "link": {
            "title": "Bekijk hoe het met uw aanvraag staat",
            "to": "/horeca/horeca-vergunning-exploitatie-horecabedrijf/1234418712",
          },
          "location": "Berkelstraat 1 1078CT",
          "processed": true,
          "status": "Afgehandeld",
          "title": "Horeca vergunning exploitatie Horecabedrijf",
        },
        {
          "caseType": "Horeca vergunning exploitatie Horecabedrijf",
          "dateDecision": "2022-12-01T00:00:00",
          "dateEnd": "2025-01-02T00:00:00",
          "dateRequest": "2022-11-20T00:00:00",
          "dateRequestFormatted": "20 november 2022",
          "dateStart": "2023-11-01T00:00:00",
          "dateStartPermit": "2023-11-02T00:00:00",
          "dateWorkflowActive": "2022-11-25T00:00:00",
          "decision": null,
          "documentsUrl": null,
          "id": "334568232",
          "identifier": "Z/23/1808827",
          "link": {
            "title": "Bekijk hoe het met uw aanvraag staat",
            "to": "/horeca/horeca-vergunning-exploitatie-horecabedrijf/334568232",
          },
          "location": "J.J. Cremerplein 54-1 1054 TM Amsterdam",
          "numberOfPermits": 10,
          "processed": false,
          "status": "Ontvangen",
          "title": "Horeca vergunning exploitatie Horecabedrijf",
        },
        {
          "caseType": "Horeca vergunning exploitatie Horecabedrijf",
          "dateDecision": "2022-11-01T00:00:00",
          "dateEnd": "2024-01-02T00:00:00",
          "dateRequest": "2022-10-20T00:00:00",
          "dateRequestFormatted": "20 oktober 2022",
          "dateStart": "2022-11-01T00:00:00",
          "dateStartPermit": "2022-11-02T00:00:00",
          "dateWorkflowActive": null,
          "decision": null,
          "documentsUrl": null,
          "id": "3209922248",
          "identifier": "Z/23/1808826",
          "link": {
            "title": "Bekijk hoe het met uw aanvraag staat",
            "to": "/horeca/horeca-vergunning-exploitatie-horecabedrijf/3209922248",
          },
          "location": "J.J. Cremerplein 54-1 1054 TM Amsterdam",
          "numberOfPermits": 10,
          "processed": false,
          "status": "Ontvangen",
          "title": "Horeca vergunning exploitatie Horecabedrijf",
        },
      ]
    `);
  });

  it('should return the expected notifications', async () => {
    remoteApi
      .get(`/decosjoin/getvergunningen`)
      .reply(200, vergunningenMockData);

    const result = await fetchHorecaNotifications('x', authProfileAndToken);

    expect(result.content).toMatchInlineSnapshot(`
      {
        "notifications": [
          {
            "datePublished": "2022-11-25T00:00:00",
            "description": "Wij hebben uw aanvraag voor een horeca vergunning exploitatie horecabedrijf in behandeling genomen.",
            "id": "vergunning-334568232-notification",
            "link": {
              "title": "Bekijk details",
              "to": "/horeca/horeca-vergunning-exploitatie-horecabedrijf/334568232",
            },
            "subject": "334568232",
            "thema": "VERGUNNINGEN",
            "title": "Aanvraag horeca vergunning exploitatie horecabedrijf in behandeling",
          },
          {
            "datePublished": "2022-10-20T00:00:00",
            "description": "Wij hebben uw aanvraag voor een horeca vergunning exploitatie horecabedrijf ontvangen.",
            "id": "vergunning-3209922248-notification",
            "link": {
              "title": "Bekijk details",
              "to": "/horeca/horeca-vergunning-exploitatie-horecabedrijf/3209922248",
            },
            "subject": "3209922248",
            "thema": "VERGUNNINGEN",
            "title": "Aanvraag horeca vergunning exploitatie horecabedrijf ontvangen",
          },
        ],
      }
    `);
  });
});

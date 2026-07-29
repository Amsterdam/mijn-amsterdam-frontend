import { describe, expect, test } from 'vitest';

import type {
  ZaakInfoResponseSource,
  ZaakStatussenResponseSource,
} from './erfpacht-zaken-types.ts';
import {
  fetchErfpachtZaakDetail,
  fetchErfpachtZaakInfo,
  forTesting,
} from './erfpacht-zaken.ts';
import ERFPACHT_ZAAK_DETAIL from '../../../mocks-server/fixtures/erfpacht/erfpacht-zaak-detail.json' with { type: 'json' };
import ERFPACHT_ZAAK_INFO from '../../../mocks-server/fixtures/erfpacht/erfpacht-zaak-info.json' with { type: 'json' };
import { getAuthProfileAndToken, remoteApi } from '../../../testing/utils.ts';
import type { AuthProfileAndToken } from '../../auth/auth-types.ts';

describe('erfpacht-zaken', () => {
  const authProfileAndToken: AuthProfileAndToken = getAuthProfileAndToken();

  test('transformErfpachtZakenResponse', () => {
    const source: ZaakInfoResponseSource = {
      ...(ERFPACHT_ZAAK_INFO as ZaakInfoResponseSource),
      content: [
        {
          ...(ERFPACHT_ZAAK_INFO as ZaakInfoResponseSource).content[0],
          statusOmschrijving: 'Informatie opgevraagd',
          formattedStatusDatum: '15-07-2026',
          zaakUrl: 'https://example.invalid/zaak/1234-5678-9012-9999',
          zaakDossiers: ['EW123/456', 'AB/345/678'],
        },
      ],
    };

    const transformedResponse =
      forTesting.transformErfpachtZakenResponse(source);

    expect(transformedResponse).toMatchInlineSnapshot(`
      [
        {
          "datePublished": "2026-07-15T00:00:00.000Z",
          "datePublishedFormatted": "15 juli 2026",
          "displayStatus": "Meer informatie nodig",
          "dossierLinks": [
            "EW123/456",
            "AB/345/678",
          ],
          "fetchZaakDetailUrl": "http://bff-api-host/api/v1/services/erfpacht/zaak/1234-5678-9012-9999",
          "formattedStatusDatum": "15-07-2026",
          "link": {
            "title": "Wijzigen Erfpachtrecht",
            "to": "/erfpacht/zaak/1234-5678-9012-9999",
          },
          "statusOmschrijving": "Informatie opgevraagd",
          "titelFormattedStatusDatum": "Datum status",
          "titelStatusOmschrijving": "Status",
          "titelZaakNummer": "Zaak nummer",
          "titelZaakOmschrijving": "Zaak onderwerp",
          "zaakDossiers": [
            "EW123/456",
            "AB/345/678",
          ],
          "zaakNummer": "ZAAK-2025-0000011488",
          "zaakOmschrijving": "Wijzigen Erfpachtrecht",
          "zaakUrl": "https://example.invalid/zaak/1234-5678-9012-9999",
          "zaakUuid": "1234-5678-9012-9999",
        },
      ]
    `);
  });

  describe('transformErfpachtZaakDetailResponse', () => {
    test('should transform zaak detail response correctly', () => {
      const transformedResponse =
        forTesting.transformErfpachtZaakDetailResponse(
          ERFPACHT_ZAAK_DETAIL as ZaakStatussenResponseSource
        );
      expect(transformedResponse).toMatchInlineSnapshot(`
        {
          "result": "Aangegaan",
          "steps": [
            {
              "datePublished": "2026-02-25T14:12:22.808Z",
              "description": "",
              "id": "392366984",
              "isActive": false,
              "isChecked": true,
              "isVisible": true,
              "status": "Aanvraag",
            },
            {
              "datePublished": "",
              "description": "",
              "id": "444832057",
              "isActive": false,
              "isChecked": false,
              "isVisible": false,
              "status": "Meer informatie nodig",
            },
            {
              "datePublished": "2026-02-25T14:14:55.89Z",
              "description": "Wij hebben uw aanvraag in behandeling genomen.",
              "id": "1078733647",
              "isActive": false,
              "isChecked": true,
              "isVisible": true,
              "status": "In behandeling",
            },
            {
              "datePublished": "2026-02-25T14:22:42.057Z",
              "description": "Wij hebben uw aanvraag afgerond en hebben u hierover bericht gestuurd.",
              "id": "508338350",
              "isActive": true,
              "isChecked": true,
              "isVisible": true,
              "status": "Afgehandeld",
            },
          ],
        }
      `);
    });

    test('should set first step active when there are no matching statuses', () => {
      const transformedResponse =
        forTesting.transformErfpachtZaakDetailResponse({
          zaakStatussen: [],
          zaakResultaat: '',
        });

      expect(transformedResponse).toMatchInlineSnapshot(`
        {
          "result": "",
          "steps": [
            {
              "datePublished": "",
              "description": "",
              "id": "392366984",
              "isActive": true,
              "isChecked": false,
              "isVisible": true,
              "status": "Aanvraag",
            },
            {
              "datePublished": "",
              "description": "",
              "id": "444832057",
              "isActive": false,
              "isChecked": false,
              "isVisible": false,
              "status": "Meer informatie nodig",
            },
            {
              "datePublished": "",
              "description": "",
              "id": "1078733647",
              "isActive": false,
              "isChecked": false,
              "isVisible": true,
              "status": "In behandeling",
            },
            {
              "datePublished": "",
              "description": "",
              "id": "508338350",
              "isActive": false,
              "isChecked": false,
              "isVisible": true,
              "status": "Afgehandeld",
            },
          ],
        }
      `);
    });
  });

  test('fetchErfpachtZaakInfo', async () => {
    remoteApi
      .get('/erfpacht/vernise/api/zaakinfo')
      .query(true)
      .reply(200, ERFPACHT_ZAAK_INFO);

    const response = await fetchErfpachtZaakInfo(authProfileAndToken);

    expect(response).toMatchSnapshot();
  });

  test('fetchErfpachtZaakStatussen via forTesting', async () => {
    const uuid = '1234-5678-9012-9999';

    remoteApi
      .get(`/erfpacht/vernise/api/zaak/${uuid}/status`)
      .reply(200, ERFPACHT_ZAAK_DETAIL);

    const response = await forTesting.fetchErfpachtZaakStatussen(
      authProfileAndToken,
      uuid
    );

    expect(response).toMatchInlineSnapshot(`
      {
        "content": {
          "result": "Aangegaan",
          "steps": [
            {
              "datePublished": "2026-02-25T14:12:22.808Z",
              "description": "",
              "id": "392366984",
              "isActive": false,
              "isChecked": true,
              "isVisible": true,
              "status": "Aanvraag",
            },
            {
              "datePublished": "",
              "description": "",
              "id": "444832057",
              "isActive": false,
              "isChecked": false,
              "isVisible": false,
              "status": "Meer informatie nodig",
            },
            {
              "datePublished": "2026-02-25T14:14:55.89Z",
              "description": "Wij hebben uw aanvraag in behandeling genomen.",
              "id": "1078733647",
              "isActive": false,
              "isChecked": true,
              "isVisible": true,
              "status": "In behandeling",
            },
            {
              "datePublished": "2026-02-25T14:22:42.057Z",
              "description": "Wij hebben uw aanvraag afgerond en hebben u hierover bericht gestuurd.",
              "id": "508338350",
              "isActive": true,
              "isChecked": true,
              "isVisible": true,
              "status": "Afgehandeld",
            },
          ],
        },
        "status": "OK",
      }
    `);
  });

  test('fetchErfpachtZaakDetail', async () => {
    const uuid = '1234-5678-9012-9999';

    remoteApi
      .get('/erfpacht/vernise/api/zaakinfo')
      .query(true)
      .reply(200, ERFPACHT_ZAAK_INFO);
    remoteApi
      .get(`/erfpacht/vernise/api/zaak/${uuid}/status`)
      .reply(200, ERFPACHT_ZAAK_DETAIL);

    const response = await fetchErfpachtZaakDetail(authProfileAndToken, uuid);

    expect(response.content?.dossierLinks).toEqual(['EW123/456', 'AB/345/678']);
    expect(response.content?.steps).toMatchInlineSnapshot(`
      [
        {
          "datePublished": "2026-02-25T14:12:22.808Z",
          "description": "",
          "id": "392366984",
          "isActive": false,
          "isChecked": true,
          "isVisible": true,
          "status": "Aanvraag",
        },
        {
          "datePublished": "",
          "description": "",
          "id": "444832057",
          "isActive": false,
          "isChecked": false,
          "isVisible": false,
          "status": "Meer informatie nodig",
        },
        {
          "datePublished": "2026-02-25T14:14:55.89Z",
          "description": "Wij hebben uw aanvraag in behandeling genomen.",
          "id": "1078733647",
          "isActive": false,
          "isChecked": true,
          "isVisible": true,
          "status": "In behandeling",
        },
        {
          "datePublished": "2026-02-25T14:22:42.057Z",
          "description": "Wij hebben uw aanvraag afgerond en hebben u hierover bericht gestuurd.",
          "id": "508338350",
          "isActive": true,
          "isChecked": true,
          "isVisible": true,
          "status": "Afgehandeld",
        },
      ]
    `);
    expect(response.content?.resultaat).toEqual('Aangegaan');
    expect(response.content?.displayStatus).toEqual('Aangegaan');
  });

  test('fetchErfpachtZaakDetail: zaak not found', async () => {
    const uuid = 'non-existing-uuid';
    const emptyZaakInfo = {};

    remoteApi
      .get('/erfpacht/vernise/api/zaakinfo')
      .query(true)
      .reply(200, emptyZaakInfo);
    remoteApi
      .get(`/erfpacht/vernise/api/zaak/${uuid}/status`)
      .reply(200, ERFPACHT_ZAAK_DETAIL);

    const response = await fetchErfpachtZaakDetail(authProfileAndToken, uuid);

    expect(response).toMatchInlineSnapshot(`
      {
        "content": null,
        "message": "Zaak not found",
        "status": "ERROR",
      }
    `);
  });

  test('fetchErfpachtZaakDetail: dependency failure', async () => {
    const uuid = '1234-5678-9012-9999';

    remoteApi.get('/erfpacht/vernise/api/zaakinfo').reply(500, {
      message: 'Internal server error',
    });
    remoteApi
      .get(`/erfpacht/vernise/api/zaak/${uuid}/status`)
      .reply(200, ERFPACHT_ZAAK_DETAIL);

    const response = await fetchErfpachtZaakDetail(authProfileAndToken, uuid);

    expect(response).toMatchInlineSnapshot(`
      {
        "content": null,
        "message": "Failed to fetch zaak details",
        "status": "ERROR",
      }
    `);
  });
});

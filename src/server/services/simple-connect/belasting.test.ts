import { describe, expect, test } from 'vitest';

import { fetchBelasting, fetchBelastingNotifications } from './belasting';
import { remoteApi } from '../../../testing/utils';
import { AuthProfileAndToken } from '../../auth/auth-types';

const REQUEST_ID = 'test-x-999';
const authProfileAndToken: AuthProfileAndToken = {
  profile: { authMethod: 'digid', profileType: 'private', id: '', sid: '' },
  token: 'xxxxxx',
};

describe('simple-connect/belasting', () => {
  test('fetchBelasting: no content', async () => {
    remoteApi.get('/belastingen').reply(200, null as any);

    expect(await fetchBelasting(REQUEST_ID, authProfileAndToken))
      .toMatchInlineSnapshot(`
      {
        "content": {
          "isKnown": false,
        },
        "status": "OK",
      }
    `);
  });

  test('fetchBelasting: bsn known', async () => {
    remoteApi.get('/belastingen').reply(200, {
      status: 'BSN known',
    });

    expect(await fetchBelasting(REQUEST_ID, authProfileAndToken))
      .toMatchInlineSnapshot(`
      {
        "content": {
          "isKnown": true,
        },
        "status": "OK",
      }
    `);
  });

  test('fetchBelasting: bsn known + tips + notifications', async () => {
    remoteApi
      .get('/belastingen')
      .times(2)
      .reply(200, {
        status: 'BSN known',
        data: [
          {
            thema: 'Belastingen',
            categorie: 'M1',
            nummer: 4,
            prioriteit: 1,
            datum: '2022-05-30T09:00:34Z',
            titel: 'Betaal uw aanslagen',
            omschrijving:
              'Er staan nog aanslagen open waarvoor u een dwangbevel hebt ontvangen. Deze aanslagen zijn nog niet (geheel) voldaan. Voorkom een bezoek van de deurwaarder aan u. Betaal direct.',
            url: 'https://belastingbalie-acc.amsterdam.nl/aanslagen.php',
            url_naam: 'Betaal direct',
            informatie: '.',
          },
          {
            thema: 'Belastingen',
            categorie: 'M2',
            nummer: 5,
            prioriteit: 10,
            datum: '2022-05-30T09:00:34Z',
            titel: 'Automatische incasso',
            omschrijving:
              'Betaal gemakkelijk de gecombineerde belastingaanslag. Regel vandaag nog uw automatische incasso, dan hebt u er straks geen omkijken meer naar.',
            url: 'https://belastingbalie-acc.amsterdam.nl/subject.gegevens.php',
            url_naam: 'Vraag direct aan',
            informatie:
              'U krijgt deze tip omdat u nog niet via automatische incasso betaalt',
          },
        ],
      });

    expect(await fetchBelasting(REQUEST_ID, authProfileAndToken))
      .toMatchInlineSnapshot(`
      {
        "content": {
          "isKnown": true,
        },
        "status": "OK",
      }
    `);

    expect(await fetchBelastingNotifications(REQUEST_ID, authProfileAndToken))
      .toMatchInlineSnapshot(`
        {
          "content": {
            "notifications": [
              {
                "datePublished": "2022-05-30T09:00:34Z",
                "description": "Er staan nog aanslagen open waarvoor u een dwangbevel hebt ontvangen. Deze aanslagen zijn nog niet (geheel) voldaan. Voorkom een bezoek van de deurwaarder aan u. Betaal direct.",
                "id": "belasting-4",
                "link": {
                  "title": "Betaal direct",
                  "to": "https://belastingbalie-acc.amsterdam.nl/aanslagen.php",
                },
                "thema": "BELASTINGEN",
                "title": "Betaal uw aanslagen",
              },
            ],
            "tips": [
              {
                "datePublished": "2022-05-30T09:00:34Z",
                "description": "Betaal gemakkelijk de gecombineerde belastingaanslag. Regel vandaag nog uw automatische incasso, dan hebt u er straks geen omkijken meer naar.",
                "id": "belasting-5",
                "isTip": true,
                "link": {
                  "title": "Vraag direct aan",
                  "to": "https://belastingbalie-acc.amsterdam.nl/subject.gegevens.php",
                },
                "thema": "BELASTINGEN",
                "tipReason": "U krijgt deze tip omdat u nog niet via automatische incasso betaalt",
                "title": "Automatische incasso",
              },
            ],
          },
          "status": "OK",
        }
      `);
  });
});

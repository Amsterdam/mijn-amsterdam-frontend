import { describe, expect, test } from 'vitest';

import { fetchBelasting, fetchBelastingNotifications } from './belasting.ts';
import { getAuthProfileAndToken, remoteApi } from '../../../testing/utils.ts';

const authProfileAndToken = getAuthProfileAndToken();

describe('simple-connect/belasting', () => {
  test('fetchBelasting: no content', async () => {
    remoteApi.get('/belastingen').reply(200, null as any);

    expect(await fetchBelasting(authProfileAndToken)).toMatchInlineSnapshot(`
        {
          "content": {
            "isKnown": false,
            "url": "http://localhost:3100/mocks-api/sso/portaal/belastingen",
          },
          "status": "OK",
        }
      `);
  });

  test('fetchBelasting: bsn known', async () => {
    remoteApi.get('/belastingen').reply(200, {
      status: 'BSN known',
    });

    expect(await fetchBelasting(authProfileAndToken)).toMatchInlineSnapshot(`
        {
          "content": {
            "isKnown": true,
            "url": "http://localhost:3100/mocks-api/sso/portaal/belastingen",
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
            themaID: 'Belastingen',
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
            themaID: 'Belastingen',
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

    expect(await fetchBelasting(authProfileAndToken)).toMatchInlineSnapshot(`
        {
          "content": {
            "isKnown": true,
            "url": "http://localhost:3100/mocks-api/sso/portaal/belastingen",
          },
          "status": "OK",
        }
      `);

    expect(
      await fetchBelastingNotifications(authProfileAndToken)
    ).toStrictEqual({
      content: {
        notifications: [
          {
            datePublished: '2022-05-30T09:00:34Z',
            description:
              'Er staan nog aanslagen open waarvoor u een dwangbevel hebt ontvangen. Deze aanslagen zijn nog niet (geheel) voldaan. Voorkom een bezoek van de deurwaarder aan u. Betaal direct.',
            id: 'belasting-4',
            link: {
              title: 'Betaal direct',
              to: 'https://belastingbalie-acc.amsterdam.nl/aanslagen.php',
            },
            themaID: 'BELASTINGEN',
            themaTitle: 'Belastingen',
            title: 'Betaal uw aanslagen',
          },
        ],
        tips: [
          {
            datePublished: '2022-05-30T09:00:34Z',
            description:
              'Betaal gemakkelijk de gecombineerde belastingaanslag. Regel vandaag nog uw automatische incasso, dan hebt u er straks geen omkijken meer naar.',
            id: 'belasting-5',
            isTip: true,
            link: {
              title: 'Vraag direct aan',
              to: 'https://belastingbalie-acc.amsterdam.nl/subject.gegevens.php',
            },
            themaID: 'BELASTINGEN',
            themaTitle: 'Belastingen',
            tipReason:
              'U krijgt deze tip omdat u nog niet via automatische incasso betaalt',
            title: 'Automatische incasso',
          },
        ],
      },
      status: 'OK',
    });
  });
});

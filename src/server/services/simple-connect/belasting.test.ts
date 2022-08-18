import nock from 'nock';
import { ApiConfig } from '../../config';
import { AuthProfileAndToken } from '../../helpers/app';
import { fetchBelasting, fetchBelastingNotifications } from './belasting';

const REQUEST_ID = 'test-x-999';
const authProfileAndToken: AuthProfileAndToken = {
  profile: { authMethod: 'digid', profileType: 'private' },
  token: 'xxxxxx',
};

describe('simple-connect/belasting', () => {
  const url = ApiConfig.BELASTINGEN.url;

  ApiConfig.BELASTINGEN.url = 'http://localhost/belastingen/remote/api';

  afterAll(() => {
    // Enable http requests.
    nock.enableNetConnect();
    nock.restore();

    ApiConfig.BELASTINGEN.url = url;
  });

  beforeAll(() => {
    nock.disableNetConnect();
  });

  test('fetchBelasting: no content', async () => {
    nock('http://localhost')
      .get('/belastingen/remote/api')
      .reply(200, null as any);

    expect(await fetchBelasting(REQUEST_ID, authProfileAndToken))
      .toMatchInlineSnapshot(`
      Object {
        "content": Object {
          "isKnown": false,
        },
        "status": "OK",
      }
    `);
  });

  test('fetchBelasting: bsn known', async () => {
    nock('http://localhost').get('/belastingen/remote/api').reply(200, {
      status: 'BSN known',
    });

    expect(await fetchBelasting(REQUEST_ID, authProfileAndToken))
      .toMatchInlineSnapshot(`
      Object {
        "content": Object {
          "isKnown": true,
        },
        "status": "OK",
      }
    `);
  });

  test('fetchBelasting: bsn known + tips + notifications', async () => {
    nock('http://localhost')
      .get('/belastingen/remote/api')
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
      Object {
        "content": Object {
          "isKnown": true,
        },
        "status": "OK",
      }
    `);

    expect(await fetchBelastingNotifications(REQUEST_ID, authProfileAndToken))
      .toMatchInlineSnapshot(`
      Object {
        "content": Object {
          "notifications": Array [
            Object {
              "chapter": "BELASTINGEN",
              "datePublished": "2022-05-30T09:00:34Z",
              "description": "Er staan nog aanslagen open waarvoor u een dwangbevel hebt ontvangen. Deze aanslagen zijn nog niet (geheel) voldaan. Voorkom een bezoek van de deurwaarder aan u. Betaal direct.",
              "id": "belasting-4",
              "link": Object {
                "title": "Betaal direct",
                "to": "https://belastingbalie-acc.amsterdam.nl/aanslagen.php",
              },
              "title": "Betaal uw aanslagen",
            },
          ],
          "tips": Array [
            Object {
              "datePublished": "2022-05-30T09:00:34Z",
              "description": "Betaal gemakkelijk de gecombineerde belastingaanslag. Regel vandaag nog uw automatische incasso, dan hebt u er straks geen omkijken meer naar.",
              "id": "belasting-5",
              "isPersonalized": true,
              "link": Object {
                "title": "Vraag direct aan",
                "to": "https://belastingbalie-acc.amsterdam.nl/subject.gegevens.php",
              },
              "priority": 10,
              "reason": Array [
                "U krijgt deze tip omdat u nog niet via automatische incasso betaalt",
              ],
              "title": "Automatische incasso",
            },
          ],
        },
        "status": "OK",
      }
    `);
  });
});

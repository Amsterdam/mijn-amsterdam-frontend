import nock from 'nock';
import { AuthProfileAndToken } from '../../helpers/app';
import { fetchErfpacht, fetchErfpachtNotifications } from './erfpacht';

describe('simple-connect/erfpacht', () => {
  const REQUEST_ID = 'test-x-789';
  const authProfileAndToken: AuthProfileAndToken = {
    profile: { authMethod: 'digid', profileType: 'private' },
    token: 'xxxxxx',
  };

  const penv = process.env;

  afterAll(() => {
    // Enable http requests.
    nock.enableNetConnect();
    nock.restore();
  });

  beforeAll(() => {
    process.env = {
      ...penv,
      BFF_MIJN_ERFPACHT_ENCRYPTION_KEY_V2: 'xxxxxxxxxxxxxxxx',
      BFF_MIJN_ERFPACHT_API_URL: 'http://localhost/erfpacht',
    };
    nock.disableNetConnect();
  });

  test('fetchErfpacht:  null', async () => {
    nock('http://localhost')
      .get(new RegExp('/api/v2/check/groundlease/user/*'))
      .reply(200, null as any);

    const responseContent = await fetchErfpacht(
      REQUEST_ID,
      authProfileAndToken
    );

    expect(responseContent).toMatchInlineSnapshot(`
      Object {
        "content": Object {
          "isKnown": false,
        },
        "status": "OK",
      }
    `);
  });

  test('fetchErfpacht: known=true', async () => {
    nock('http://localhost')
      .get(new RegExp('/api/v2/check/groundlease/user/*'))
      .reply(200, '"true"');

    const responseContent = await fetchErfpacht(
      REQUEST_ID,
      authProfileAndToken
    );

    expect(responseContent).toMatchInlineSnapshot(`
      Object {
        "content": Object {
          "isKnown": true,
        },
        "status": "OK",
      }
    `);
  });

  test('fetchErfpacht: known=false', async () => {
    nock('http://localhost')
      .get(new RegExp('/api/v2/check/groundlease/user/*'))
      .reply(200, '"false"');

    const responseContent = await fetchErfpacht(
      REQUEST_ID,
      authProfileAndToken
    );

    expect(responseContent).toMatchInlineSnapshot(`
      Object {
        "content": Object {
          "isKnown": false,
        },
        "status": "OK",
      }
    `);
  });

  test('fetchErfpachtGenerated: no content', async () => {
    nock('http://localhost')
      .get(new RegExp('/api/v2/notifications/bsn/*'))
      .reply(200, null as any);

    const responseContent = await fetchErfpachtNotifications(
      REQUEST_ID,
      authProfileAndToken
    );

    expect(responseContent).toMatchInlineSnapshot(`
      Object {
        "content": Object {
          "notifications": Array [],
        },
        "status": "OK",
      }
    `);
  });

  test('fetchErfpachtGenerated: with notifications', async () => {
    nock('http://localhost')
      .get(new RegExp('/api/v2/notifications/bsn/*'))
      .reply(200, [
        {
          title: 'Automatische incasso erfpacht goedgekeurd',
          description:
            'Uw aanvraag voor automatische incasso voor erfpacht is goedgekeurd en verwerkt. Uw eerstvolgende betaling van erfpacht zal middels automatische incasso plaatsvinden',
          datePublished: '2022-04-22',
          link: {
            title: 'Bekijk hier uw automatische incasso-aanvraag',
            to: 'https: //mijnerfpacht.acc.amsterdam.nl/saml/login/alias/mijnErfpachtBurger/target/5cGv/JO0bYFwcogNaliQj3783Lag1VbCps15b5sdk6c=',
          },
          id: 0,
          read: 'False',
        },
      ]);

    const responseContent = await fetchErfpachtNotifications(
      REQUEST_ID,
      authProfileAndToken
    );

    expect(responseContent).toMatchInlineSnapshot(`
      Object {
        "content": Object {
          "notifications": Array [
            Object {
              "chapter": "ERFPACHT",
              "datePublished": "2022-04-22",
              "description": "Uw aanvraag voor automatische incasso voor erfpacht is goedgekeurd en verwerkt. Uw eerstvolgende betaling van erfpacht zal middels automatische incasso plaatsvinden",
              "id": 0,
              "link": Object {
                "title": "Bekijk hier uw automatische incasso-aanvraag",
                "to": "https: //mijnerfpacht.acc.amsterdam.nl/saml/login/alias/mijnErfpachtBurger/target/5cGv/JO0bYFwcogNaliQj3783Lag1VbCps15b5sdk6c=",
              },
              "read": "False",
              "title": "Automatische incasso erfpacht goedgekeurd",
            },
          ],
        },
        "status": "OK",
      }
    `);
  });
});

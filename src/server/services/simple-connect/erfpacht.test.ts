import { createDecipheriv } from 'crypto';
import { describe, expect, test } from 'vitest';
import { remoteApi } from '../../../test-utils';
import { AuthProfileAndToken } from '../../helpers/app';
import {
  fetchErfpacht,
  fetchErfpachtNotifications,
  getConfigMain,
} from './erfpacht';

describe('simple-connect/erfpacht', () => {
  const REQUEST_ID = 'test-x-789';
  const authProfileAndToken: AuthProfileAndToken = {
    profile: {
      authMethod: 'digid',
      profileType: 'private',
      id: 'TEST-DIGID-BSN',
      sid: '',
    },
    token: 'xxxxxx',
  };

  test('fetchErfpacht:  null', async () => {
    remoteApi
      .get(new RegExp('/erfpacht/api/v2/check/groundlease/user/*'))
      .reply(200, null as any);

    const responseContent = await fetchErfpacht(
      REQUEST_ID,
      authProfileAndToken
    );

    expect(responseContent).toMatchInlineSnapshot(`
      {
        "content": {
          "isKnown": false,
        },
        "status": "OK",
      }
    `);
  });

  test('fetchErfpacht: known=true', async () => {
    remoteApi
      .get(new RegExp('/erfpacht/api/v2/check/groundlease/user/*'))
      .reply(200, 'true');

    const responseContent = await fetchErfpacht(
      REQUEST_ID,
      authProfileAndToken
    );

    expect(responseContent).toMatchInlineSnapshot(`
      {
        "content": {
          "isKnown": true,
        },
        "status": "OK",
      }
    `);
  });

  test('fetchErfpacht: known=false', async () => {
    remoteApi
      .get(new RegExp('/erfpacht/api/v2/check/groundlease/user/*'))
      .reply(200, 'false');

    const responseContent = await fetchErfpacht(
      REQUEST_ID,
      authProfileAndToken
    );

    expect(responseContent).toMatchInlineSnapshot(`
      {
        "content": {
          "isKnown": false,
        },
        "status": "OK",
      }
    `);
  });

  test('fetchErfpachtGenerated: no content', async () => {
    remoteApi
      .get(new RegExp('/erfpacht/api/v2/notifications/bsn/*'))
      .reply(200, null as any);

    const responseContent = await fetchErfpachtNotifications(
      REQUEST_ID,
      authProfileAndToken
    );

    expect(responseContent).toMatchInlineSnapshot(`
      {
        "content": {
          "notifications": [],
        },
        "status": "OK",
      }
    `);
  });

  test('fetchErfpachtGenerated: with notifications', async () => {
    remoteApi
      .get(new RegExp('/erfpacht/api/v2/notifications/bsn/*'))
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
      {
        "content": {
          "notifications": [
            {
              "datePublished": "2022-04-22",
              "description": "Uw aanvraag voor automatische incasso voor erfpacht is goedgekeurd en verwerkt. Uw eerstvolgende betaling van erfpacht zal middels automatische incasso plaatsvinden",
              "id": 0,
              "link": {
                "title": "Bekijk hier uw automatische incasso-aanvraag",
                "to": "https: //mijnerfpacht.acc.amsterdam.nl/saml/login/alias/mijnErfpachtBurger/target/5cGv/JO0bYFwcogNaliQj3783Lag1VbCps15b5sdk6c=",
              },
              "read": "False",
              "thema": "ERFPACHT",
              "title": "Automatische incasso erfpacht goedgekeurd",
            },
          ],
        },
        "status": "OK",
      }
    `);
  });

  test('getConfigMain', () => {
    const authProfileAndToken: AuthProfileAndToken = {
      profile: {
        authMethod: 'digid',
        profileType: 'private',
        id: 'DIGID-BSN',
        sid: '',
      },
      token: '123abc',
    };

    const cfg = getConfigMain(authProfileAndToken, REQUEST_ID);
    const ivBuffer = Buffer.from(cfg.headers!['X-RANDOM-IV']!);

    expect(cfg.headers!['X-API-KEY']).toBeDefined();
    expect(ivBuffer.length).toBe(16);

    const lastSegment = cfg.url?.split('/').pop();

    const keyBuffer = Buffer.from(
      process.env.BFF_MIJN_ERFPACHT_ENCRYPTION_KEY_V2!
    );
    const dataBuffer = Buffer.from(lastSegment!, 'base64');

    const decipheriv = createDecipheriv('aes-128-cbc', keyBuffer, ivBuffer);
    const decodedUserId =
      decipheriv.update(dataBuffer).toString() + decipheriv.final('utf-8');

    expect(decodedUserId).toBe('DIGID-BSN');
  });
});

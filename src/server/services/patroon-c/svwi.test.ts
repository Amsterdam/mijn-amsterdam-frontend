import { describe, expect, test } from 'vitest';

import { fetchSVWI } from './svwi';
import SVWI from '../../../../mocks/fixtures/svwi.json';
import { featureToggle } from '../../../client/pages/Thema/Svwi/Svwi-thema-config';
import { getAuthProfileAndToken, remoteApi } from '../../../testing/utils';

describe('simple-connect/svwi', () => {
  const authProfileAndToken = getAuthProfileAndToken();
  featureToggle.svwiActive = true;

  test('fetchSvwi should give isKnown equals true', async () => {
    remoteApi
      .get('/autorisatie/tegel')
      .matchHeader('Authorization', `Bearer ${authProfileAndToken.token}`)
      .matchHeader('Ocp-Apim-Subscription-Key', 'xxx')
      .reply(200, SVWI);

    const responseContent = await fetchSVWI(authProfileAndToken);

    expect(responseContent).toMatchInlineSnapshot(`
      {
        "content": {
          "isKnown": true,
          "url": "http://localhost:3100/mocks-api/sso/portaal/svwi",
        },
        "status": "OK",
      }
    `);
  });

  test('fetchSvwi should give isKnown equals false', async () => {
    const SVWIWithUnknown = { ...SVWI, gebruikerBekend: false };

    remoteApi
      .get('/autorisatie/tegel')
      .matchHeader('Authorization', `Bearer ${authProfileAndToken.token}`)
      .matchHeader('Ocp-Apim-Subscription-Key', 'xxx')
      .reply(200, SVWIWithUnknown);

    const responseContent = await fetchSVWI(authProfileAndToken);

    expect(responseContent).toMatchInlineSnapshot(`
      {
        "content": {
          "isKnown": false,
          "url": "http://localhost:3100/mocks-api/sso/portaal/svwi",
        },
        "status": "OK",
      }
    `);
  });
});

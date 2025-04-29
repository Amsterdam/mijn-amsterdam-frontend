import { describe, expect, test } from 'vitest';

import { fetchSVWI } from './svwi';
import SVWI from '../../../../mocks/fixtures/svwi.json';
import { getAuthProfileAndToken, remoteApi } from '../../../testing/utils';

vi.mock(
  '../../../client/pages/Thema/Svwi-thema-config',
  async (importOriginal) => {
    const module: { featureToggle: object; [key: string]: unknown } =
      await importOriginal();

    return {
      ...module,
      featureToggle: {
        ...module.featureToggle,
        svwiActive: true,
      },
    };
  }
);

describe('simple-connect/svwi', () => {
  const REQUEST_ID = 'test-x-789';
  const authProfileAndToken = getAuthProfileAndToken();

  test('fetchSvwi should give isknow equals true', async () => {
    remoteApi
      .get('/mijnamsterdam/v1/autorisatie/tegel')
      .matchHeader('Authorization', `Bearer ${authProfileAndToken.token}`)
      .matchHeader('Ocp-Apim-Subscription-Key', 'xxx')
      .reply(200, SVWI);

    const responseContent = await fetchSVWI(REQUEST_ID, authProfileAndToken);

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
      .get('/mijnamsterdam/v1/autorisatie/tegel')
      .matchHeader('Authorization', `Bearer ${authProfileAndToken.token}`)
      .matchHeader('Ocp-Apim-Subscription-Key', 'xxx')
      .reply(200, SVWIWithUnknown);

    const responseContent = await fetchSVWI(REQUEST_ID, authProfileAndToken);

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

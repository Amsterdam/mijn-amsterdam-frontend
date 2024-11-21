import { describe, expect, test } from 'vitest';

import { fetchSVWI } from './svwi';
import SVWI from '../../../../mocks/fixtures/svwi.json';
import { remoteApi } from '../../../testing/utils';
import { AuthProfileAndToken } from '../../auth/auth-types';

vi.mock('../../../universal/config/app', async (importOriginal) => {
  const module = (await importOriginal()) as any;

  return {
    ...module,
    FeatureToggle: {
      ...module.FeatureToggle,
      svwiLinkActive: true,
    },
  };
});

describe('simple-connect/svwi', () => {
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
    },
    "status": "OK",
  }
  `);
  });
});

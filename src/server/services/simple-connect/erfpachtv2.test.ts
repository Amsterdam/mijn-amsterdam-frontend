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
    },
    token: 'xxxxxx',
  };

  test('fetchErfpachtV2', async () => {
    // remoteApi
    //   .get(new RegExp('/erfpacht/api/v2/check/groundlease/user/*'))
    //   .reply(200, null as any);
    // const responseContent = await fetchErfpacht(
    //   REQUEST_ID,
    //   authProfileAndToken
    // );
    // expect(responseContent).toMatchInlineSnapshot(`
    //   {
    //     "content": {
    //       "isKnown": false,
    //     },
    //     "status": "OK",
    //   }
    // `);
  });
});

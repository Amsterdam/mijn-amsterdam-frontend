import { describe, expect, test } from 'vitest';

import { fetchErfpacht, fetchErfpachtDossiersDetail } from './erfpacht';
import ERFPACHT_DOSSIERINFO_DETAILS from '../../../../mocks/fixtures/erfpacht-v2-dossierinfo-bsn.json';
import ERFPACHT_DOSSIERS from '../../../../mocks/fixtures/erfpacht-v2-dossiers.json';
import ERFPACHT_ERFPACHTER from '../../../../mocks/fixtures/erfpacht-v2-erfpachter.json';
import { getAuthProfileAndToken, remoteApi } from '../../../testing/utils';
import { AuthProfileAndToken } from '../../auth/auth-types';

describe('simple-connect/erfpacht', () => {
  const REQUEST_ID = 'test-x-789';
  const authProfileAndToken: AuthProfileAndToken = getAuthProfileAndToken();

  test('fetchErfpacht: null', async () => {
    remoteApi.get('/erfpacht/vernise/api/erfpachter').reply(200, undefined);
    remoteApi.get('/erfpacht/vernise/api/dossierinfo').reply(200, undefined);

    const responseContent = await fetchErfpacht(
      REQUEST_ID,
      authProfileAndToken
    );
    expect(responseContent).toMatchInlineSnapshot(`
      {
        "content": {
          "isKnown": false,
          "profileType": "private",
          "relatieCode": undefined,
        },
        "status": "OK",
      }
    `);
  });

  test('fetchErfpacht: dossiers', async () => {
    remoteApi
      .get('/erfpacht/vernise/api/erfpachter')
      .reply(200, { erfpachter: true, relationCode: '123-abc' });
    remoteApi
      .get('/erfpacht/vernise/api/dossierinfo')
      .reply(200, ERFPACHT_DOSSIERS);

    const responseContent = await fetchErfpacht(
      REQUEST_ID,
      authProfileAndToken
    );
    expect(responseContent).toMatchSnapshot();
  });

  test('fetchErfpacht: dossier detail', async () => {
    remoteApi
      .get('/erfpacht/vernise/api/dossierinfo/E.477.46')
      .reply(200, ERFPACHT_DOSSIERINFO_DETAILS);

    const responseContent = await fetchErfpachtDossiersDetail(
      REQUEST_ID,
      authProfileAndToken,
      'E.477.46'
    );
    expect(responseContent).toMatchSnapshot();
  });

  test('fetchErfpacht zakelijk', async () => {
    remoteApi
      .get('/erfpacht/vernise/api/erfpachter')
      .reply(200, ERFPACHT_ERFPACHTER);

    authProfileAndToken.profile.profileType = 'commercial';

    const responseContent = await fetchErfpacht(
      REQUEST_ID,
      authProfileAndToken
    );
    expect(responseContent).toMatchInlineSnapshot(`
      {
        "content": {
          "isKnown": true,
          "profileType": "commercial",
          "relatieCode": "123-abc",
          "url": "http://localhost:3100/mocks-api/sso/portaal/erfpachtzakelijk",
        },
        "status": "OK",
      }
    `);
  });
});

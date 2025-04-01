import { describe, expect, test } from 'vitest';

import { fetchErfpachtV2, fetchErfpachtV2DossiersDetail } from './erfpacht';
import ERFPACHT_DOSSIERINFO_DETAILS from '../../../../mocks/fixtures/erfpacht-v2-dossierinfo-bsn.json';
import ERFPACHT_DOSSIERS from '../../../../mocks/fixtures/erfpacht-v2-dossiers.json';
import ERFPACHT_ERFPACHTER from '../../../../mocks/fixtures/erfpacht-v2-erfpachter.json';
import { remoteApi } from '../../../testing/utils';
import { AuthProfileAndToken } from '../../auth/auth-types';

// const mocks = vi.hoisted(() => {
//   return {
//     useSessionApi: vi.fn(),
//     useSessionValue: vi.fn(),
//   };
// });

vi.mock('../../../universal/config/app', async (importOriginal) => {
  const module = (await importOriginal()) as any;

  return {
    ...module,
    FeatureToggle: {
      ...module.FeatureToggle,
      erfpachtV2EndpointActive: true,
    },
  };
});

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

  test('fetchErfpachtV2: null', async () => {
    remoteApi.get('/erfpacht/vernise/api/erfpachter').reply(200, null as any);
    remoteApi.get('/erfpacht/vernise/api/dossierinfo').reply(200, null as any);

    const responseContent = await fetchErfpachtV2(
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

  test('fetchErfpachtV2: dossiers', async () => {
    remoteApi
      .get('/erfpacht/vernise/api/erfpachter')
      .reply(200, { erfpachter: true, relationCode: '123-abc' } as any);
    remoteApi
      .get('/erfpacht/vernise/api/dossierinfo')
      .reply(200, ERFPACHT_DOSSIERS);

    const responseContent = await fetchErfpachtV2(
      REQUEST_ID,
      authProfileAndToken
    );
    expect(responseContent).toMatchSnapshot();
  });

  test('fetchErfpachtV2: dossier detail', async () => {
    remoteApi
      .get('/erfpacht/vernise/api/dossierinfo/E.477.46')
      .reply(200, ERFPACHT_DOSSIERINFO_DETAILS);

    const responseContent = await fetchErfpachtV2DossiersDetail(
      REQUEST_ID,
      authProfileAndToken,
      'E.477.46'
    );
    expect(responseContent).toMatchSnapshot();
  });

  test('fetchErfpachtV2 zakelijk', async () => {
    remoteApi
      .get('/erfpacht/vernise/api/erfpachter')
      .reply(200, ERFPACHT_ERFPACHTER);

    authProfileAndToken.profile.profileType = 'commercial';

    const responseContent = await fetchErfpachtV2(
      REQUEST_ID,
      authProfileAndToken
    );
    expect(responseContent).toMatchInlineSnapshot(`
      {
        "content": {
          "isKnown": true,
          "profileType": "commercial",
          "relatieCode": "123-abc",
        },
        "status": "OK",
      }
    `);
  });
});

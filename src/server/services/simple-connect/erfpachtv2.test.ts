import { describe, expect, test } from 'vitest';
import { remoteApi } from '../../../test-utils';
import { AuthProfileAndToken } from '../../helpers/app';
import ERFPACHTv2_DOSSIERINFO_DETAILS from '../../mock-data/json/erfpacht-v2-dossierinfo-bsn.json';
import ERFPACHTv2_DOSSIERS from '../../mock-data/json/erfpacht-v2-dossiers.json';
import ERFPACHTv2_ERFPACHTER from '../../mock-data/json/erfpacht-v2-erfpachter.json';
import { fetchErfpachtV2 } from './erfpacht';

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
    },
    token: 'xxxxxx',
  };

  test('fetchErfpachtV2: null', async () => {
    remoteApi
      .get('/erfpachtv2/vernise/api/dossierinfo')
      .reply(200, null as any);

    const responseContent = await fetchErfpachtV2(
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

  test('fetchErfpachtV2: dossiers', async () => {
    remoteApi
      .get('/erfpachtv2/vernise/api/dossierinfo')
      .reply(200, ERFPACHTv2_DOSSIERS);

    const responseContent = await fetchErfpachtV2(
      REQUEST_ID,
      authProfileAndToken
    );
    expect(responseContent).toMatchSnapshot();
  });

  test('fetchErfpachtV2: dossier detail', async () => {
    remoteApi
      .get('/erfpachtv2/vernise/api/dossierinfo/E.477.46')
      .reply(200, ERFPACHTv2_DOSSIERINFO_DETAILS);

    const responseContent = await fetchErfpachtV2(
      REQUEST_ID,
      authProfileAndToken
    );
    expect(responseContent).toMatchSnapshot();
  });

  test('fetchErfpachtV2 zakelijk', async () => {
    remoteApi
      .get('/erfpachtv2/vernise/api/erfpachter')
      .reply(200, ERFPACHTv2_ERFPACHTER);

    authProfileAndToken.profile.profileType = 'commercial';

    const responseContent = await fetchErfpachtV2(
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
});

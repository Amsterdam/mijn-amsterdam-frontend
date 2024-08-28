import '@testing-library/jest-dom';
import * as matchers from '@testing-library/jest-dom/matchers';
import { cleanup } from '@testing-library/react';
import nock from 'nock';
import { vi, afterEach, expect, afterAll } from 'vitest';
import {
  IS_AP,
  IS_DEVELOPMENT,
  IS_OT,
  IS_PRODUCTION,
} from './universal/config/env';

vi.mock('./server/helpers/env.ts', async (importOriginal) => {
  const envModule = (await importOriginal()) as any;
  return {
    ...envModule,
    // Prevent isRequired from spamming logs or throwing errors by ignoring it.
    getFromEnv: (key: string) => process.env[key],
  };
});

vi.mock('./universal/config/feature-toggles.ts', async (importOriginal) => {
  const featureToggleModule = (await importOriginal()) as any;

  let featureTogglesOn = Object.entries(featureToggleModule.FeatureToggle).map(
    ([keyName]) => {
      return [keyName, true];
    }
  );
  featureTogglesOn = Object.fromEntries(featureTogglesOn);

  return {
    ...featureToggleModule,
    featureTogglesOn,
  };
});

global.matchMedia =
  global.matchMedia ||
  function () {
    return {
      matches: false,
      addEventListener: function () {},
      removeEventListener: function () {},
    };
  };

global.window && ((global.window as any).scrollTo = vi.fn());
global.window && ((global.window as any).scrollBy = vi.fn());

nock.disableNetConnect();

// extends Vitest's expect method with methods from react-testing-library
expect.extend(matchers);

// runs a cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  nock.cleanAll();
  cleanup();
});

afterAll(() => {
  // Enable http requests.
  nock.cleanAll();
  nock.restore();
  nock.enableNetConnect();
});

export const bffApiHost = 'http://bff-api-host';
export const frontentHost = 'http://frontend-host';
export const remoteApiHost = 'http://remote-api-host';

process.env.BFF_DB_FILE = ':memory:';
process.env.REACT_APP_BFF_API_URL = bffApiHost;
process.env.BFF_API_BASE_URL = `${bffApiHost}/api/v1`;

process.env.BFF_DISABLE_MOCK_ADAPTER = 'true';
process.env.BFF_REQUEST_CACHE_ENABLED = 'false';

process.env.MA_FRONTEND_URL = frontentHost;
process.env.BFF_ENABLEU_2_SMILE_ENDPOINT = `${remoteApiHost}/smile`;
process.env.BFF_OIDC_BASE_URL = bffApiHost;
process.env.BFF_OIDC_USERINFO_ENDPOINT = `${bffApiHost}/oidc/userinfo`;
process.env.BFF_OIDC_CLIENT_ID_DIGID = 'mijnamsterdam';
process.env.BFF_OIDC_CLIENT_ID_EHERKENNING = 'mijnamsterdam1';
process.env.BFF_MIJN_ERFPACHT_API_KEY = 'foo-bar-123';
process.env.BFF_MIJN_ERFPACHT_ENCRYPTION_KEY_V2 = 'xxxxxxxxxxxxxxxx';
process.env.BFF_MIJN_ERFPACHT_API_URL = `${remoteApiHost}/erfpacht`;

//AFIS
process.env.BFF_AFIS_API_BASE_URL = `${remoteApiHost}/afis/RESTAdapter`;
process.env.BFF_AFIS_OAUTH_CLIENT_ID = 'mijnamsterdam';
process.env.BFF_AFIS_OAUTH_CLIENT_SECRET =
  'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';

process.env.BFF_PARKEREN_API_BASE_URL = `${remoteApiHost}/parkeren`;
process.env.BFF_PARKEREN_EXTERNAL_FALLBACK_URL = `${remoteApiHost}/parkeren/fallback`;

// V2
process.env.BFF_DECOS_API_BASE_URL = `${remoteApiHost}/decos`;
process.env.BFF_DECOS_API_ADRES_BOEKEN_BSN =
  'bookKeyA,BookKeyB,bookKeyC,bookKeyD';
process.env.BFF_DECOS_API_ADRES_BOEKEN_KVK = 'bookKey1';

process.env.BFF_ERFPACHT_API_URL = `${remoteApiHost}/erfpachtv2`;

process.env.BFF_LVV_API_URL = `${remoteApiHost}/lvv`;
process.env.BFF_SMILE_USERNAME = 'test2';
process.env.BFF_SMILE_PASSWORD = 'testpwd2';
process.env.BFF_SISA_ENCRYPTION_KEY = 'FaKeKeYtT9jQBEGYCvS?H2rEh3hukwDz';

process.env.BFF_SISA_CLIENT_SECRET = 'xxxxxxxxxxxxxxxx';
process.env.BFF_SISA_API_ENDPOINT = `${remoteApiHost}/subsidies/`;
process.env.BFF_CLEOPATRA_API_ENDPOINT = `${remoteApiHost}/cleopatra`;
process.env.BFF_POWERBROWSER_API_URL = `${remoteApiHost}/powerbrowser`;

// Koppel api base urls
process.env.BFF_MKS_API_BASE_URL = `${remoteApiHost}`;
process.env.BFF_KREFIA_API_BASE_URL = `${remoteApiHost}`;
process.env.BFF_VERGUNNINGEN_API_BASE_URL = `${remoteApiHost}`;
process.env.BFF_WPI_API_BASE_URL = `${remoteApiHost}`;

process.env.BFF_ZORGNED_API_BASE_URL = `${remoteApiHost}/zorgned`;
process.env.BFF_ZORGNED_API_TOKEN = 'xxxx22xxxx';

process.env.BFF_GPASS_API_BASE_URL = `${remoteApiHost}/stadspas`;
process.env.BFF_GPASS_API_TOKEN = '22222xx22222';

process.env.BFF_SVWI_API_BASE_URL = `${remoteApiHost}`;
process.env.BFF_SVWI_API_KEY = 'xxx';

process.env.BFF_GENERAL_ENCRYPTION_KEY = 'FaKeKeYtT9jQBEGYCvS?H2rEh3hukwDz';

process.env.BFF_BEZWAREN_API = `${remoteApiHost}/bezwaren`;
process.env.BFF_BEZWAREN_USER = 'BEZWAREN_USER';
process.env.BFF_BEZWAREN_EMAIL = 'BEZWAREN_EMAIL';
process.env.BFF_BEZWAREN_EMPLOYEE_ID = '1';
process.env.BFF_BEZWAREN_TOKEN_KEY = 'BEZWAREN_JWT_KEY';

process.env.BFF_LOOD_OAUTH = `${remoteApiHost}/lood_oauth`;
process.env.BFF_LOOD_API_URL = `${remoteApiHost}/lood365`;
process.env.BFF_LOOD_USERNAME = 'username';
process.env.BFF_LOOD_PWD = 'pwd';
process.env.BFF_LOOD_TENANT = 'tenantid';
process.env.BFF_BELASTINGEN_ENDPOINT = `${remoteApiHost}/belastingen`;

process.env.REACT_APP_SSO_URL_BELASTINGEN = `${remoteApiHost}/sso/portaal/belastingen`;
process.env.REACT_APP_SSO_URL_MILIEUZONE = `${remoteApiHost}/sso/portaal/milieuzone`;
process.env.REACT_APP_SSO_URL_PARKEREN = `${remoteApiHost}/sso/portaal/parkeren`;

process.env.BFF_AMSAPP_ADMINISTRATIENUMMER_DELIVERY_ENDPOINT = `${remoteApiHost}/amsapp/session/credentials`;

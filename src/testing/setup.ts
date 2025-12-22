import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';
import nock from 'nock';
import { afterAll, afterEach, vi } from 'vitest';

const ENV_FILE = '.env.local.template';
const envConfig = dotenv.config({ path: ENV_FILE });
dotenvExpand.expand(envConfig);

nock.disableNetConnect();

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

vi.mock('zustand');

// Turn off memoization to make tests more stateless.
// Often tests pass or fail without a clear reason because of this caching.
vi.mock('memoizee', async (importOriginal) => {
  const actual: object = await importOriginal();
  return {
    ...actual,
    default: (fn: { clear: () => undefined; delete: () => undefined }) => {
      fn.clear = () => undefined;
      fn.delete = () => undefined;
      return fn;
    },
  };
});

vi.mock('../server/helpers/env.ts', async (importOriginal) => {
  const envModule: object = await importOriginal();
  return {
    ...envModule,
    // Prevent isRequired from spamming logs or throwing errors by ignoring it.
    getFromEnv: (key: string) => process.env[key],
  };
});

// Set every BFF Featuretoggle to true.
vi.mock('../client/helpers/env.ts', async (importOriginal) => {
  const envModule: object = await importOriginal();
  return {
    ...envModule,
    useIsBffToggleEnabled: (key: string) => true,
  };
});

// Set every Featuretoggle to true.
vi.mock('../universal/config/feature-toggles.ts', async (importOriginal) => {
  const featureToggleModule: {
    FeatureToggle: Record<string, string>;
  } = await importOriginal();

  const featureTogglesOn = Object.entries(
    featureToggleModule.FeatureToggle
  ).map(([keyName]) => {
    return [keyName, true];
  });
  const FeatureToggle = Object.fromEntries(featureTogglesOn);

  return {
    ...featureToggleModule,
    FeatureToggle,
  };
});

export const bffApiHost = 'http://bff-api-host';
export const frontentHost = 'http://frontend-host';
export const remoteApiHost = 'http://remote-api-host';

// Prevent logging in tests.
process.env.LOG_LEVEL = '';

process.env.BFF_DB_FILE = ':memory:';
process.env.REACT_APP_BFF_API_URL = bffApiHost;
process.env.BFF_API_BASE_URL = `${bffApiHost}/api/v1`;
process.env.BFF_DATA_AMSTERDAM_API_KEY = '';

process.env.BFF_DISABLE_MOCK_ADAPTER = 'true';
process.env.BFF_REQUEST_CACHE_ENABLED = 'false';

process.env.MA_FRONTEND_URL = frontentHost;
process.env.BFF_ENABLEU_2_SMILE_ENDPOINT = `${remoteApiHost}/smile`;
process.env.BFF_OIDC_BASE_URL = bffApiHost;
process.env.BFF_OIDC_USERINFO_ENDPOINT = `${bffApiHost}/oidc/userinfo`;
process.env.BFF_OIDC_CLIENT_ID_DIGID = 'mijnamsterdam';
process.env.BFF_OIDC_CLIENT_ID_EHERKENNING = 'mijnamsterdam1';

//AFIS
process.env.BFF_AFIS_API_BASE_URL = `${remoteApiHost}/afis/RESTAdapter`;
process.env.BFF_AFIS_OAUTH_CLIENT_ID = 'mijnamsterdam';
process.env.BFF_AFIS_OAUTH_CLIENT_SECRET =
  'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
process.env.BFF_AFIS_ENABLEU_ACTIVE = 'true';

process.env.BFF_PARKEREN_FRONTOFFICE_API_BASE_URL = `${remoteApiHost}/parkeren`;
process.env.BFF_PARKEREN_API_BASE_URL = `${remoteApiHost}/parkeren`;
process.env.BFF_PARKEREN_PORTAAL_URL = `${remoteApiHost}/parkeren/fallback`;
process.env.BFF_PARKEREN_API_TOKEN = 'xxxclientsecretxxx';

// V2
process.env.BFF_DECOS_API_BASE_URL = `${remoteApiHost}/decos`;
process.env.BFF_DECOS_API_ADRES_BOEKEN_BSN =
  'bookKeyA,BookKeyB,bookKeyC,bookKeyD';
process.env.BFF_DECOS_API_ADRES_BOEKEN_KVK = 'bookKey1';

process.env.BFF_ERFPACHT_API_URL = `${remoteApiHost}/erfpacht`;

process.env.BFF_LVV_API_URL = `${remoteApiHost}/lvv`;
process.env.BFF_SMILE_USERNAME = 'test2';
process.env.BFF_SMILE_PASSWORD = 'testpwd2';
process.env.BFF_SISA_ENCRYPTION_KEY = 'FaKeKeYtT9jQBEGYCvS?H2rEh3hukwDz';

process.env.BFF_SISA_CLIENT_SECRET = 'xxxxxxxxxxxxxxxx';
process.env.BFF_SISA_API_ENDPOINT = `${remoteApiHost}/subsidies/`;
process.env.BFF_CLEOPATRA_API_ENDPOINT = `${remoteApiHost}/cleopatra`;
process.env.BFF_POWERBROWSER_API_URL = `${remoteApiHost}/powerbrowser`;

// Koppel api base urls
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

process.env.BFF_AMSAPP_ADMINISTRATIENUMMER_DELIVERY_ENDPOINT = `${remoteApiHost}/amsapp/session/credentials`;
process.env.BFF_AMSAPP_NONCE = '123456789123456789123456';
process.env.DEBUG_RESPONSE_DATA = '';

process.env.BFF_CONTACTMOMENTEN_BASE_URL = `${remoteApiHost}/salesforce/contactmomenten`;

process.env.BFF_POM_API_BASE_URL = `${remoteApiHost}/pom`;

process.env.BFF_BENK_BRP_CLIENT_ID = 'test-client-id';
process.env.BFF_BENK_BRP_CLIENT_SECRET = 'test-client-secret';
process.env.BFF_BENK_BRP_TENANT = 'test-tenant';
process.env.BFF_BENK_BRP_APPLICATION_ID = 'test-app-id';
process.env.BFF_BENK_BRP_API_BASE_URL = `${remoteApiHost}/benk_brp`;

process.env.BFF_DATAPUNT_IAM_API_BASE_URL = `${remoteApiHost}/datapunt/iam`;
process.env.BFF_HR_KVK_API_BASE_URL = `${remoteApiHost}/hr_kvk`;
process.env.BFF_CMS_BASE_URL = `${remoteApiHost}/cms`;

process.env.REACT_APP_COBROWSE_LICENSE_KEY = 'test';

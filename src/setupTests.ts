import '@testing-library/jest-dom';
import * as matchers from '@testing-library/jest-dom/matchers';
import { cleanup } from '@testing-library/react';
import nock from 'nock';
import { vi, afterEach, expect, afterAll } from 'vitest';

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

process.env.BFF_DISABLE_MOCK_ADAPTER = 'true';
process.env.BFF_REQUEST_CACHE_ENABLED = 'false';

process.env.MA_FRONTEND_URL = frontentHost;
process.env.BFF_ENABLEU_2_SMILE_ENDPOINT = `${remoteApiHost}/smile`;
process.env.BFF_OIDC_BASE_URL = bffApiHost;
process.env.BFF_OIDC_USERINFO_ENDPOINT = `${bffApiHost}/oidc/userinfo`;
process.env.BFF_MIJN_ERFPACHT_API_KEY = 'foo-bar-123';
process.env.BFF_MIJN_ERFPACHT_ENCRYPTION_KEY_V2 = 'xxxxxxxxxxxxxxxx';
process.env.BFF_MIJN_ERFPACHT_API_URL = `${remoteApiHost}/erfpacht`;

// V2
process.env.BFF_ERFPACHT_API_URL = `${remoteApiHost}/erfpachtv2`;

process.env.BFF_LVV_API_URL = `${remoteApiHost}/lvv`;
process.env.BFF_SMILE_USERNAME = 'test2';
process.env.BFF_SMILE_PASSWORD = 'testpwd2';
process.env.BFF_SISA_ENCRYPTION_KEY = 'xxxxxxxxxxxxxxxx';
process.env.BFF_SISA_CLIENT_SECRET = 'xxxxxxxxxxxxxxxx';
process.env.BFF_SISA_API_ENDPOINT = `${remoteApiHost}/subsidies/`;
process.env.BFF_CLEOPATRA_API_ENDPOINT = `${remoteApiHost}/cleopatra`;

// Koppel api base urls
process.env.BFF_MKS_API_BASE_URL = `${remoteApiHost}`;
process.env.BFF_KREFIA_API_BASE_URL = `${remoteApiHost}`;
process.env.BFF_VERGUNNINGEN_API_BASE_URL = `${remoteApiHost}`;
process.env.BFF_WPI_API_BASE_URL = `${remoteApiHost}`;
process.env.BFF_WMO_API_BASE_URL = `${remoteApiHost}`;

process.env.BFF_SVWI_API_BASE_URL = `${remoteApiHost}`;
process.env.BFF_SVWI_API_KEY = 'xxx';

process.env.BFF_GENERAL_ENCRYPTION_KEY = 'eA.6WMdq$BTgTHuJ';
process.env.BFF_SIA_BASE_URL = `${remoteApiHost}/sia`;
process.env.BFF_SIA_IAM_TOKEN_ENDPOINT = `${remoteApiHost}/sia-iam-token`;

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

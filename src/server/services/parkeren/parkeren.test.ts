import { fetchParkeren } from './parkeren';
import { hasPermitsOrPermitRequests } from './parkeren-egis-service';
import { getAuthProfileAndToken, remoteApi } from '../../../testing/utils';
import { AuthProfileAndToken } from '../../auth/auth-types';
import { HttpStatusCode } from 'axios';

const mocks = vi.hoisted(() => {
  return {
    JWETokenCreationActive: false,
  };
});

vi.mock(
  '../../../client/pages/Thema/Parkeren/Parkeren-thema-config.ts',
  async (importOriginal) => {
    return {
      ...(await importOriginal()),
      featureToggle: {
        parkerenActive: true,
        parkerenCheckForProductAndPermitsActive: true,
        parkerenJWETokenCreationActive: mocks.JWETokenCreationActive,
      },
    };
  }
);

const SUCCESS_URL = 'https://parkeren.nl/sso-login';

const BASE_ROUTE = '/parkeren';
const PRIVATE_CLIENT_PRODUCT_DETAIL_ROUTE = `${BASE_ROUTE}/v1/private/client_product_details`;
const PRIVATE_ACTIVE_PERMIT_REQUEST_ROUTE = `${BASE_ROUTE}/v1/private/active_permit_request`;
const JWE_CREATE_ROUTE = `${BASE_ROUTE}/v1/jwe/create`;

const setupSuccessMocks = (
  authmethod: AuthProfileAndToken['profile']['authMethod'],
  mockDataClientProductDetails: { data: unknown[] },
  mockDataActivePermitRequest: { data: unknown[] },
  brpData: unknown = BRP_DATA.mokumTrue
) => {
  // Not the same as profile type in AuthProfileAndToken.
  const profileType = authmethod === 'digid' ? 'private' : 'eherkenning';

  remoteApi.get('/brp/brp').reply(HttpStatusCode.Ok, brpData!); // brpData is a default argument.

  remoteApi
    .get(`${BASE_ROUTE}/sso/get_authentication_url?service=${authmethod}`)
    .reply(200, { url: SUCCESS_URL });

  remoteApi.post(JWE_CREATE_ROUTE).reply(HttpStatusCode.Ok, {
    token: 'xxxtokenxxx',
  });

  remoteApi
    .post(`${BASE_ROUTE}/v1/${profileType}/client_product_details`)
    .reply(HttpStatusCode.Ok, mockDataClientProductDetails);

  remoteApi
    .post(`${BASE_ROUTE}/v1/${profileType}/active_permit_request`)
    .reply(HttpStatusCode.Ok, mockDataActivePermitRequest);
};

describe('fetchParkeren', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Returns SSO URL', () => {
    test('With digid', async () => {
      setupSuccessMocks('digid', { data: [] }, { data: [] });
      const authProfileAndToken = getAuthProfileAndToken('private');

      const response = await fetchParkeren(authProfileAndToken);
      expect(response.content.url).toBe(SUCCESS_URL);
    });

    test('With eherkenning', async () => {
      setupSuccessMocks('eherkenning', { data: [] }, { data: [] });
      const authProfileAndToken = getAuthProfileAndToken('commercial');

      const response = await fetchParkeren(authProfileAndToken);
      expect(response.content.url).toBe(SUCCESS_URL);
    });

    test('When sso parkeren endpoint returns nothing', async () => {
      remoteApi
        .get(`${BASE_ROUTE}/sso/get_authentication_url?service=digid`)
        .reply(400);
      remoteApi.post(JWE_CREATE_ROUTE).reply(HttpStatusCode.Ok, {
        token: 'xxxtokenxxx',
      });
      remoteApi
        .post(PRIVATE_CLIENT_PRODUCT_DETAIL_ROUTE)
        .reply(HttpStatusCode.Ok, MOCK_CLIENT_PRODUCT_DETAILS);
      remoteApi
        .post(PRIVATE_ACTIVE_PERMIT_REQUEST_ROUTE)
        .reply(HttpStatusCode.Ok, MOCK_CLIENT_PRODUCT_DETAILS);

      const authProfileAndToken = getAuthProfileAndToken('private');
      const response = await fetchParkeren(authProfileAndToken);
      expect(response.content.url).toBeDefined();
    });
  });

  describe('IsKnown is true when...', () => {
    test('Parkeren has data in product details endpoint', async () => {
      setupSuccessMocks(
        'digid',
        { data: [MOCK_CLIENT_PRODUCT_DETAILS] },
        { data: [] }
      );
      const authProfileAndToken = getAuthProfileAndToken('private');

      const response = await fetchParkeren(authProfileAndToken);
      expect(response.content.isKnown).toBe(true);
    });

    test('Parkeren has data in parking permits endpoint', async () => {
      setupSuccessMocks(
        'digid',
        { data: [] },
        { data: [MOCK_PARKING_PERMIT_REQUEST] }
      );
      const authProfileAndToken = getAuthProfileAndToken('private');

      const response = await fetchParkeren(authProfileAndToken);
      expect(response.content.isKnown).toBe(true);
    });

    test('Parkeren has data in product details endpoint', async () => {
      const authProfileAndToken = getAuthProfileAndToken('private');
      remoteApi.post(JWE_CREATE_ROUTE).reply(400);
      remoteApi
        .post(PRIVATE_CLIENT_PRODUCT_DETAIL_ROUTE)
        .reply(200, [MOCK_CLIENT_PRODUCT_DETAILS]);
      remoteApi.post(PRIVATE_ACTIVE_PERMIT_REQUEST_ROUTE).reply(404);

      const response = await fetchParkeren(authProfileAndToken);
      expect(response.content.isKnown).toBe(true);
    });

    test('JWEtoken endpoint returns an error', async () => {
      const authProfileAndToken = getAuthProfileAndToken('private');
      remoteApi.post(JWE_CREATE_ROUTE).reply(400);

      const response = await fetchParkeren(authProfileAndToken);
      expect(response.content.isKnown).toBe(true);
    });

    test('Parkeren endpoint returns an error', async () => {
      const authProfileAndToken = getAuthProfileAndToken('private');
      remoteApi
        .post(JWE_CREATE_ROUTE)
        .reply(HttpStatusCode.Ok, { token: 'xxx1234xxx' });
      remoteApi.post(PRIVATE_CLIENT_PRODUCT_DETAIL_ROUTE).reply(400);
      remoteApi.post(PRIVATE_ACTIVE_PERMIT_REQUEST_ROUTE).reply(400);

      const response = await fetchParkeren(authProfileAndToken);
      expect(response.content.isKnown).toBe(true);
    });

    test('Living in Amsterdam with digid login', async () => {
      const authProfileAndToken = getAuthProfileAndToken('private');
      const response = await fetchParkeren(authProfileAndToken);

      expect(response.content.isKnown).toBe(true);
    });

    test('From eherkenning user', async () => {
      const authProfileAndToken = getAuthProfileAndToken('commercial');

      const response = await fetchParkeren(authProfileAndToken);
      expect(response.content.isKnown).toBe(true);
    });
  });

  describe('isKnown is false when...', () => {
    test('User not found in both APIs', async () => {
      const authProfileAndToken = getAuthProfileAndToken('private');
      remoteApi
        .post(JWE_CREATE_ROUTE)
        .reply(HttpStatusCode.Ok, { token: 'xxx1234xxx' });
      remoteApi.post(PRIVATE_CLIENT_PRODUCT_DETAIL_ROUTE).reply(404);
      remoteApi.post(PRIVATE_ACTIVE_PERMIT_REQUEST_ROUTE).reply(404);

      const response = await fetchParkeren(authProfileAndToken);
      expect(response.content.isKnown).toBe(false);
    });

    test('When person does not live in Amsterdam, is logged in with Digid and gets no data', async () => {
      setupSuccessMocks(
        'digid',
        { data: [] },
        { data: [] },
        BRP_DATA.mokumFalse
      );
      const authProfileAndToken = getAuthProfileAndToken('private');

      const response = await fetchParkeren(authProfileAndToken);
      expect(response.content.isKnown).toBe(false);
    });
  });
});

describe('hasPermitsOrPermitRequests', () => {
  const authProfileAndToken = getAuthProfileAndToken('private');

  afterEach(() => {
    mocks.JWETokenCreationActive = true;
  });

  test('Doing a request with a created JWE token', async () => {
    mocks.JWETokenCreationActive = true;
    const response = await hasPermitsOrPermitRequests(authProfileAndToken);
    expect(response).toBe(true);
  });

  test('Doing a request while fetching a JWT', async () => {
    mocks.JWETokenCreationActive = false;
    const response = await hasPermitsOrPermitRequests(authProfileAndToken);
    expect(response).toBe(true);
  });
});

const BRP_DATA = {
  mokumTrue: { status: 'OK', content: { persoon: { mokum: true } } },
  mokumFalse: { status: 'OK', content: { persoon: { mokum: false } } },
};

const MOCK_PARKING_PERMIT_REQUEST = {
  data: [
    {
      link: 'example.org/permits',
      id: 8702,
      client_id: 8702,
      status: 'in_progress',
      permit_name: 'Bewonersvergunning',
      permit_zone: 'CE02C Centrum-2c',
    },
  ],
};

const MOCK_CLIENT_PRODUCT_DETAILS = {
  data: [
    {
      client_product_id: 8703,
      object: 'client_product',
      client_id: 8703,
      status: 'ACTIVE',
      started_at: '2024-10-01T12:00:00+00:00',
      ended_at: '2025-04-30T23:59:59+00:00',
      zone: 'WM55 Oost-5a',
      link: 'example.org/permit/8703',
      vrns: '999123',
    },
  ],
};

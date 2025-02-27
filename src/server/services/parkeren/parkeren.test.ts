import { fetchParkeren } from './parkeren';
import { getAuthProfileAndToken, remoteApi } from '../../../testing/utils';
import { AuthProfileAndToken } from '../../auth/auth-types';

const REQUEST_ID = '123';
const STATUS_OK_200 = 200;
const SUCCESS_URL = 'https://parkeren.nl/sso-login';

const BASE_ROUTE = '/parkeren';
const PRIVATE_CLIENT_PRODUCT_DETAIL_ROUTE = `${BASE_ROUTE}/v1/private/client_product_details`;
const PRIVATE_ACTIVE_PERMIT_REQUEST_ROUTE = `${BASE_ROUTE}/v1/private/active_permit_request`;
const JWE_CREATE_ROUTE = `${BASE_ROUTE}/v1/jwe/create`;

const setupMocks = (
  authmethod: AuthProfileAndToken['profile']['authMethod'],
  mockDataClientProductDetails: { data: unknown[] },
  mockDataActivePermitRequest: { data: unknown[] },
  brpData: unknown = BRP_DATA.mokumTrue
) => {
  // Not the same as profile type in AuthProfileAndToken.
  const profileType = authmethod === 'digid' ? 'private' : 'eherkenning';

  remoteApi.get('/brp/brp').reply(STATUS_OK_200, brpData!); // brpData is a default argument.

  remoteApi
    .get(`${BASE_ROUTE}/sso/get_authentication_url?service=${authmethod}`)
    .reply(200, { url: SUCCESS_URL });

  remoteApi.post(JWE_CREATE_ROUTE).reply(STATUS_OK_200, {
    token: 'xxxtokenxxx',
  });

  remoteApi
    .post(`${BASE_ROUTE}/v1/${profileType}/client_product_details`)
    .reply(STATUS_OK_200, mockDataClientProductDetails);

  remoteApi
    .post(`${BASE_ROUTE}/v1/${profileType}/active_permit_request`)
    .reply(STATUS_OK_200, mockDataActivePermitRequest);
};

describe('fetchParkeren', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Returns SSO URL', () => {
    test('With digid', async () => {
      setupMocks('digid', { data: [] }, { data: [] });
      const authProfileAndToken = getAuthProfileAndToken('private');

      const response = await fetchParkeren(REQUEST_ID, authProfileAndToken);
      expect(response.content.url).toBe(SUCCESS_URL);
    });

    test('With eherkenning', async () => {
      setupMocks('eherkenning', { data: [] }, { data: [] });
      const authProfileAndToken = getAuthProfileAndToken('commercial');

      const response = await fetchParkeren(REQUEST_ID, authProfileAndToken);
      expect(response.content.url).toBe(SUCCESS_URL);
    });

    test('When sso parkeren endpoint returns nothing', async () => {
      remoteApi
        .get(`${BASE_ROUTE}/sso/get_authentication_url?service=digid`)
        .reply(400);
      remoteApi.post(JWE_CREATE_ROUTE).reply(STATUS_OK_200, {
        token: 'xxxtokenxxx',
      });
      remoteApi
        .post(PRIVATE_CLIENT_PRODUCT_DETAIL_ROUTE)
        .reply(STATUS_OK_200, MOCK_CLIENT_PRODUCT_DETAILS);
      remoteApi
        .post(PRIVATE_ACTIVE_PERMIT_REQUEST_ROUTE)
        .reply(STATUS_OK_200, MOCK_CLIENT_PRODUCT_DETAILS);

      const authProfileAndToken = getAuthProfileAndToken('private');
      const response = await fetchParkeren(REQUEST_ID, authProfileAndToken);
      expect(response.content.url).toBeDefined();
    });
  });

  describe('IsKnown is true when...', () => {
    test('Parkeren has data in product details endpoint', async () => {
      setupMocks(
        'digid',
        { data: [MOCK_CLIENT_PRODUCT_DETAILS] },
        { data: [] }
      );
      const authProfileAndToken = getAuthProfileAndToken('private');

      const response = await fetchParkeren(REQUEST_ID, authProfileAndToken);
      expect(response.content.isKnown).toBe(true);
    });

    test('Parkeren has data in parking permits endpoint', async () => {
      setupMocks(
        'digid',
        { data: [] },
        { data: [MOCK_PARKING_PERMIT_REQUEST] }
      );
      const authProfileAndToken = getAuthProfileAndToken('private');

      const response = await fetchParkeren(REQUEST_ID, authProfileAndToken);
      expect(response.content.isKnown).toBe(true);
    });

    test('JWEtoken endpoint returns an error', async () => {
      const authProfileAndToken = getAuthProfileAndToken('private');
      remoteApi.post(JWE_CREATE_ROUTE).reply(400);
      remoteApi
        .post(PRIVATE_CLIENT_PRODUCT_DETAIL_ROUTE)
        .reply(200, [MOCK_CLIENT_PRODUCT_DETAILS]);
      remoteApi
        .post(PRIVATE_ACTIVE_PERMIT_REQUEST_ROUTE)
        .reply(200, [MOCK_PARKING_PERMIT_REQUEST]);

      const response = await fetchParkeren(REQUEST_ID, authProfileAndToken);
      expect(response.content.isKnown).toBe(true);
    });

    test('Parkeren endpoint returns an error', async () => {
      const authProfileAndToken = getAuthProfileAndToken('private');
      remoteApi
        .post(JWE_CREATE_ROUTE)
        .reply(STATUS_OK_200, { token: 'xxx1234xxx' });
      remoteApi.post(PRIVATE_CLIENT_PRODUCT_DETAIL_ROUTE).reply(400);
      remoteApi.post(PRIVATE_ACTIVE_PERMIT_REQUEST_ROUTE).reply(400);

      const response = await fetchParkeren(REQUEST_ID, authProfileAndToken);
      expect(response.content.isKnown).toBe(true);
    });

    test('Liven in Amsterdam with digid login', async () => {
      setupMocks('digid', { data: [] }, { data: [] });
      const authProfileAndToken = getAuthProfileAndToken('private');

      const response = await fetchParkeren(REQUEST_ID, authProfileAndToken);
      expect(response.content.isKnown).toBe(true);
    });

    test('From eherkenning user', async () => {
      setupMocks('eherkenning', { data: [] }, { data: [] });
      const authProfileAndToken = getAuthProfileAndToken('private');

      const response = await fetchParkeren(REQUEST_ID, authProfileAndToken);
      expect(response.content.isKnown).toBe(true);
    });
  });

  test('Is Known is false when person does not live in Amsterdam and is logged in with Digid', async () => {
    setupMocks('digid', { data: [] }, { data: [] }, BRP_DATA.mokumFalse);
    const authProfileAndToken = getAuthProfileAndToken('private');

    const response = await fetchParkeren(REQUEST_ID, authProfileAndToken);
    expect(response.content.isKnown).toBe(false);
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

import { fetchSSOParkerenURL, hasPermitsOrPermitRequests } from './parkeren';
import { getAuthProfileAndToken, remoteApi } from '../../../testing/utils';
import { getFromEnv } from '../../helpers/env';
import { AuthProfileAndToken } from '../../auth/auth-types';

const REQUEST_ID = '123';
const STATUS_OK_200 = 200;
const SUCCESS_URL = 'https://parkeren.nl/sso-login';
const FALLBACK_URL = getFromEnv('BFF_PARKEREN_EXTERNAL_FALLBACK_URL');

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

const setupMocks = (
  profileType: AuthProfileAndToken['profile']['profileType'],
  mockDataClientProductDetails: { data: unknown[] },
  mockDataActivePermitRequest: { data: unknown[] }
) => {
  vi.clearAllMocks();
  remoteApi
    .post(`/parkeren/v1/${profileType}/client_product_details`)
    .reply(STATUS_OK_200, mockDataClientProductDetails);
  remoteApi
    .post(`/parkeren/v1/${profileType}/active_permit_request`)
    .reply(STATUS_OK_200, mockDataActivePermitRequest);
};

describe('fetchSSOParkerenURL', () => {
  describe('with permit or permit requests', () => {
    test('Calls with digid', async () => {
      const authProfileAndToken = getAuthProfileAndToken('private');

      remoteApi
        .get('/parkeren/sso/get_authentication_url?service=digid')
        .reply(STATUS_OK_200, {
          url: SUCCESS_URL,
        });

      const response = await fetchSSOParkerenURL(
        REQUEST_ID,
        authProfileAndToken,
        async () => true
      );

      expect(response).toStrictEqual({
        content: {
          isKnown: true,
          url: SUCCESS_URL,
        },
        status: 'OK',
      });
      vi.restoreAllMocks();
    });

    test('Calls with eherkenning', async () => {
      setupMocks(
        'commercial',
        MOCK_CLIENT_PRODUCT_DETAILS,
        MOCK_PARKING_PERMIT_REQUEST
      );
      const authProfileAndToken = getAuthProfileAndToken('commercial');

      remoteApi
        .get('/parkeren/sso/get_authentication_url?service=eherkenning')
        .reply(STATUS_OK_200, {
          url: SUCCESS_URL,
        });

      const response = await fetchSSOParkerenURL(
        REQUEST_ID,
        authProfileAndToken,
        async () => true
      );

      expect(response).toStrictEqual({
        content: {
          isKnown: true,
          url: SUCCESS_URL,
        },
        status: 'OK',
      });
    });
  });

  describe('when data is empty array but profileType is commercial', () => {
    beforeEach(() => {
      vi.clearAllMocks();
      setupMocks('company', { data: [] }, { data: [] });
    });

    test('Calls with eherkenning', async () => {
      const authProfileAndToken = getAuthProfileAndToken('commercial');

      const response = await fetchSSOParkerenURL(
        REQUEST_ID,
        authProfileAndToken
      );

      expect(response).toStrictEqual({
        content: {
          isKnown: false,
          url: FALLBACK_URL,
        },
        status: 'OK',
      });
    });

    test('Calls with digid', async () => {
      const authProfileAndToken = getAuthProfileAndToken('commercial');

      const response = await fetchSSOParkerenURL(
        REQUEST_ID,
        authProfileAndToken
      );

      expect(response).toStrictEqual({
        content: {
          isKnown: false,
          url: FALLBACK_URL,
        },
        status: 'OK',
      });
    });
  });

  describe('Fallback url given', async () => {
    beforeEach(() => {
      vi.clearAllMocks();

      setupMocks(
        'private',
        MOCK_CLIENT_PRODUCT_DETAILS,
        MOCK_PARKING_PERMIT_REQUEST
      );
    });

    const ERROR_TRANSFORMED_RESPONSE = {
      content: {
        isKnown: false,
        url: FALLBACK_URL,
      },
      status: 'OK',
    };

    test('When URL is null', async () => {
      const authProfileAndToken = getAuthProfileAndToken('private');

      remoteApi
        .get('/parkeren/sso/get_authentication_url?service=digid')
        .reply(STATUS_OK_200, {
          url: null,
        });

      const response = await fetchSSOParkerenURL(
        REQUEST_ID,
        authProfileAndToken
      );

      expect(response).toStrictEqual(ERROR_TRANSFORMED_RESPONSE);
    });

    test('When no url in response', async () => {
      const authProfileAndToken = getAuthProfileAndToken('private');

      remoteApi
        .get('/parkeren/sso/get_authentication_url?service=digid')
        .reply(200, { url: undefined });

      const response = await fetchSSOParkerenURL(
        REQUEST_ID,
        authProfileAndToken
      );

      expect(response).toStrictEqual(ERROR_TRANSFORMED_RESPONSE);
    });

    test('When status errors', async () => {
      const authProfileAndToken = getAuthProfileAndToken('private');

      remoteApi
        .get('/parkeren/sso/get_authentication_url?service=digid')
        .reply(404);

      const response = await fetchSSOParkerenURL(
        REQUEST_ID,
        authProfileAndToken
      );

      expect(response).toStrictEqual(ERROR_TRANSFORMED_RESPONSE);
    });
  });
});

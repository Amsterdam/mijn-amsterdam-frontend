import {
  fetchParkerenActivePermitRequests,
  fetchParkerenClientProductDetails,
  fetchSSOParkerenURL,
} from './parkeren';
import { getAuthProfileAndToken, remoteApi } from '../../../test-utils';
import { getFromEnv } from '../../helpers/env';

const REQUEST_ID = '123';
const STATUS_OK_200 = 200;
const SUCCESS_URL = 'https://parkeren.nl/sso-login';
const FALLBACK_URL = getFromEnv('BFF_PARKEREN_EXTERNAL_FALLBACK_URL');

const MOCK_PARKING_PERMIT_REQUEST = {
  data: [
    {
      link: 'demo01.ams.fo.geodeci.fr/permits',
      id: 8702,
      client_id: 8702,
      status: 'in_progress',
      permit_name: 'Bewonersvergunning',
      permit_zone: 'CE02C Centrum-2c',
    },
  ],
} as const;

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
      link: 'demo01.ams.fo.geodeci.frpermit/8703',
      vrns: '999123',
    },
  ],
} as const;

describe('parkeren', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchSSOParkerenURL', () => {
    test('Calls with digid', async () => {
      const authProfileAndToken = getAuthProfileAndToken('private');

      remoteApi
        .get('/parkeren/sso/get_authentication_url?service=digid')
        .reply(STATUS_OK_200, {
          url: SUCCESS_URL,
        });

      const response = await fetchSSOParkerenURL(
        REQUEST_ID,
        authProfileAndToken
      );

      expect(response).toStrictEqual({
        content: {
          isKnown: true,
          url: SUCCESS_URL,
        },
        status: 'OK',
      });
    });

    test('Calls with eherkenning', async () => {
      const authProfileAndToken = getAuthProfileAndToken('commercial');

      remoteApi
        .get('/parkeren/sso/get_authentication_url?service=eherkenning')
        .reply(STATUS_OK_200, {
          url: SUCCESS_URL,
        });

      const response = await fetchSSOParkerenURL(
        REQUEST_ID,
        authProfileAndToken
      );

      expect(response).toStrictEqual({
        content: {
          isKnown: true,
          url: SUCCESS_URL,
        },
        status: 'OK',
      });
    });

    describe('Fallback url given', async () => {
      const ERROR_TRANSFORMED_RESPONSE = {
        content: {
          isKnown: true,
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

  describe('fetchParkerenClientProductDetails', () => {
    test('Calls with digid', async () => {
      const authProfileAndToken = getAuthProfileAndToken('private');

      remoteApi
        .get('/parkeren/private/client_product_details')
        .reply(STATUS_OK_200, MOCK_CLIENT_PRODUCT_DETAILS);

      const response = await fetchParkerenClientProductDetails(
        REQUEST_ID,
        authProfileAndToken
      );

      expect(response).toStrictEqual({
        content: MOCK_CLIENT_PRODUCT_DETAILS,
        status: 'OK',
      });
    });

    test('Calls with eherkenning', async () => {
      const authProfileAndToken = getAuthProfileAndToken('commercial');

      remoteApi
        .get('/parkeren/company/client_product_details')
        .reply(STATUS_OK_200, MOCK_CLIENT_PRODUCT_DETAILS);

      const response = await fetchParkerenClientProductDetails(
        REQUEST_ID,
        authProfileAndToken
      );

      expect(response).toStrictEqual({
        content: MOCK_CLIENT_PRODUCT_DETAILS,
        status: 'OK',
      });
    });

    describe('fetchParkerenActivePermits', () => {
      test('Calls with digid', async () => {
        const authProfileAndToken = getAuthProfileAndToken('private');

        remoteApi
          .get('/parkeren/private/active_permit_request')
          .reply(STATUS_OK_200, MOCK_PARKING_PERMIT_REQUEST);

        const response = await fetchParkerenActivePermitRequests(
          REQUEST_ID,
          authProfileAndToken
        );

        expect(response).toStrictEqual({
          content: MOCK_PARKING_PERMIT_REQUEST,
          status: 'OK',
        });
      });

      test('Calls with eherkenning', async () => {
        const authProfileAndToken = getAuthProfileAndToken('commercial');

        remoteApi
          .get('/parkeren/company/active_permit_request')
          .reply(STATUS_OK_200, MOCK_PARKING_PERMIT_REQUEST);

        const response = await fetchParkerenActivePermitRequests(
          REQUEST_ID,
          authProfileAndToken
        );

        expect(response).toStrictEqual({
          content: MOCK_PARKING_PERMIT_REQUEST,
          status: 'OK',
        });
      });
    });
  });
});

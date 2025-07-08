import { MOCK_BASE_PATH, MOCK_API_BASE_URL } from '../settings.js';

const NO_DATA_VARIANT = {
  id: 'no-data',
  type: 'json',
  options: {
    status: 200,
    body: {
      result: 'success',
      count: 0,
      data: [],
    },
  },
};

export default [
  {
    id: 'get-parkeren-external-sso-url',
    url: `${MOCK_BASE_PATH}/parkeren-frontoffice/sso/get_authentication_url`,
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: { url: `${MOCK_API_BASE_URL}/sso/portaal/parkeren` },
        },
      },
    ],
  },
  {
    id: 'get-parkeren-create-jwe-token',
    url: `${MOCK_BASE_PATH}/parkeren-api/v1/jwe/create`,
    method: 'POST',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: {
            token: 'xxxjwetokenxxx',
          },
        },
      },
    ],
  },
  {
    id: 'get-parkeren-active-permit-request',
    url: `${MOCK_BASE_PATH}/parkeren-api/v1/:profileType/active_permit_request`,
    method: 'POST',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: {
            result: 'success',
            count: 1,
            data: [
              {
                link: 'example.org/permits',
                id: 9999,
                client_id: 9999,
                status: 'in_progress',
                permit_name: 'Bewonersvergunning',
                permit_zone: 'XX02X Centrum-1x',
              },
            ],
          },
        },
      },
      NO_DATA_VARIANT,
    ],
  },
  {
    id: 'get-parkeren-client-product-details',
    url: `${MOCK_BASE_PATH}/parkeren-api/v1/:profileType/client_product_details`,
    method: 'POST',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: {
            result: 'success',
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
          },
        },
      },
      NO_DATA_VARIANT,
    ],
  },
];

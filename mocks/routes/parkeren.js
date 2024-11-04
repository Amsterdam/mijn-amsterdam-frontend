const settings = require('../settings');

module.exports = [
  {
    id: 'get-parkeren-external-sso-url',
    url: `${settings.MOCK_BASE_PATH}/parkeren/sso/get_authentication_url`,
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: { url: `${settings.MOCK_API_BASE_URL}/sso/portaal/parkeren` },
        },
      },
    ],
  },
  {
    id: 'get-private-active-permit-request',
    url: `${settings.MOCK_API_BASE_URL}/private/active_permit_request`,
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: {
            data: {
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
          },
        },
      },
    ],
  },
  {
    id: 'get-company-active-permit-request',
    url: `${settings.MOCK_API_BASE_URL}/company/active_permit_request`,
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: {
            data: {
              link: 'demo01.ams.fo.geodeci.fr/permits',
              id: 8702,
              client_id: 8702,
              status: 'in_progress',
              permit_name: 'Bewonersvergunning',
              permit_zone: 'CE02C Centrum-2c',
            },
          },
        },
      },
    ],
  },
];

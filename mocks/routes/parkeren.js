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
];

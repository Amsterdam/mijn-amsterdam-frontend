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
          body: { url: process.env.REACT_APP_SSO_URL_PARKEREN },
        },
      },
    ],
  },
];

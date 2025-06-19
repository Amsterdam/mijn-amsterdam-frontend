const settings = require('../settings');
//http://localhost:3100/mocks-api/ms-oauth/tenant123/oauth2/v2.0/token
module.exports = [
  {
    id: 'post-ms-oauth',
    url: `${settings.MOCK_BASE_PATH}/ms-oauth/:tenant/oauth2/v2.0/token`,
    method: 'POST',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: { access_token: 'foo-bar' },
        },
      },
    ],
  },
];

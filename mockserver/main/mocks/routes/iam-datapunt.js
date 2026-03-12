const settings = require('../settings');

module.exports = [
  {
    id: 'post-datapunt-iam-oauth',
    url: `${settings.MOCK_BASE_PATH}/datapunt-iam/openid-connect/token`,
    method: 'POST',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: { access_token: 'hello-world' },
        },
      },
    ],
  },
];

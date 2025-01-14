const settings = require('../settings');

module.exports = [
  {
    id: 'post-pom-emandate-sign-request-url',
    url: `${settings.MOCK_BASE_PATH}/pom/sign-request-url`,
    method: 'POST',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: {
            url: `${settings.MOCK_API_BASE_URL}/sso/portaal/pom-emandates`,
          },
        },
      },
    ],
  },
  {
    id: 'post-pom-emandate-sign-request-status',
    url: `${settings.MOCK_BASE_PATH}/pom/sign-request-status`,
    method: 'POST',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: {
            status: 'OK',
          },
        },
      },
    ],
  },
];

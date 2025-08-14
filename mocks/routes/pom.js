const settings = require('../settings');

module.exports = [
  {
    id: 'post-pom-emandate-sign-request-url',
    url: `${settings.MOCK_BASE_PATH}/pom/paylinks`,
    method: 'POST',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: {
            paylink: `${settings.MOCK_API_BASE_URL}/sso/portaal/pom-emandates`,
            mpid: '1234567890',
          },
        },
      },
    ],
  },
  {
    id: 'post-pom-emandate-sign-request-status',
    url: `${settings.MOCK_BASE_PATH}/pom/paylinks/:mpid`,
    method: 'POST',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: {
            status_code: 900,
          },
        },
      },
    ],
  },
];

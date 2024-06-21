const settings = require('../settings');
const LOODMETINGEN_RESPONSE = require('../fixtures/loodmetingen.json');
const LOODMETINGEN_RAPPORT_RESPONSE = require('../fixtures/loodmeting-rapport.json');

module.exports = [
  {
    id: 'get-loodmetingen-details',
    url: `${settings.MOCK_BASE_PATH}/loodmetingen/be_getrequestdetails`,
    method: 'POST',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: LOODMETINGEN_RESPONSE,
        },
      },
    ],
  },
  {
    id: 'get-loodmetingen-rapport',
    url: `${settings.MOCK_BASE_PATH}/loodmetingen/be_downloadleadreport`,
    method: 'POST',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: LOODMETINGEN_RAPPORT_RESPONSE,
        },
      },
    ],
  },
  {
    id: 'get-loodmetingen-auth',
    url: `${settings.MOCK_BASE_PATH}/loodmetingen/auth/tenant123/oauth2/v2.0/token`,
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

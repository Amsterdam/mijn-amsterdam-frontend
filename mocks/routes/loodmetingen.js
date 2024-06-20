const LOODMETINGEN_RESPONSE = require('../fixtures/loodmetingen.json');
const LOODMETINGEN_RAPPORT_RESPONSE = require('../fixtures/loodmeting-rapport.json');

module.exports = [
  {
    id: 'get-loodmetingen-details',
    url: '/be_getrequestdetails',
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
    url: '/be_downloadleadreport',
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
    url: '/tenant123/oauth2/v2.0/token',
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

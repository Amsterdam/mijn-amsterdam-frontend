const SALESFORCE_RESPONSE = require('../fixtures/salesforce-contactmomenten.json');
const settings = require('../settings.js');

module.exports = [
  {
    id: 'get-salesforce',
    url: `${settings.MOCK_BASE_PATH}/salesforce/contactmomenten/services/apexrest/klantinteracties/v1.0/klantcontacten/`,
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: SALESFORCE_RESPONSE,
        },
      },
    ],
  },
];

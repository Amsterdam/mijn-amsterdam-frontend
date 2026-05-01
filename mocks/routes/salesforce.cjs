const AFSPRAKEN_RESPONSE = require('../fixtures/salesforce-appointments-stadsloket.json');
const CONTACTMOMENTEN_RESPONSE = require('../fixtures/salesforce-contactmomenten.json');
const settings = require('../settings.cjs');

module.exports = [
  {
    id: 'get-salesforce-contactmomenten',
    url: `${settings.MOCK_BASE_PATH}/salesforce/contactmomenten/services/apexrest/klantinteracties/v1.0/klantcontacten/`,
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: CONTACTMOMENTEN_RESPONSE,
        },
      },
    ],
  },
  {
    id: 'get-salesforce-afspraken-stadsloket',
    url: `${settings.MOCK_BASE_PATH}/salesforce/contactmomenten/services/apexrest/klantinteracties/v1.0/appointments`,
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: AFSPRAKEN_RESPONSE,
        },
      },
    ],
  },
];

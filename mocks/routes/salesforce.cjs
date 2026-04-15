const KLANTCONTACTEN_RESPONSE = require('../fixtures/salesforce-contactmomenten.json');
const AFSPRAKEN_STADSLOKET_RESPONSE = require('../fixtures/salesforce-afspraken-stadsloken.json');
const settings = require('../settings.cjs');

module.exports = [
  {
    id: 'get-salesforce-klantcontacten',
    url: `${settings.MOCK_BASE_PATH}/salesforce/contactmomenten/services/apexrest/klantinteracties/v1.0/klantcontacten/`,
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: KLANTCONTACTEN_RESPONSE,
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
          body: AFSPRAKEN_STADSLOKET_RESPONSE,
        },
      },
    ],
  },
];

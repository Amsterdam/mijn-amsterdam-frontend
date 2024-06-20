const BRP_RESPONSE = require('../fixtures/brp.json');
const settings = require('../settings.js');

module.exports = [
  {
    id: 'get-brp',
    url: `${settings.MOCK_BASE_PATH}/brp/brp`,
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: BRP_RESPONSE,
        },
      },
    ],
  },
  {
    id: 'get-brp-aantal-bewoners',
    url: `/brp/aantal_bewoners`,
    method: 'POST',
    variants: [
      {
        id: 'standard',
        type: 'text',
        options: {
          status: 200,
          body: 'MOCK DATA RESPONSE',
        },
      },
    ],
  },
];

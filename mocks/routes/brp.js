const BRP_RESPONSE = require('../fixtures/brp.json');
const settings = require('../settings.js');

module.exports = [
  {
    id: 'get-brp',
    url: `${settings.MOCK_BASE_PATH}/mks-koppel-api/brp/brp`,
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'json',
        // delay: 4000,
        options: {
          status: 200,
          body: BRP_RESPONSE,
        },
      },
    ],
  },
  {
    id: 'post-brp-aantal-bewoners',
    url: `${settings.MOCK_BASE_PATH}/mks-koppel-api/brp/aantal_bewoners`,
    method: 'POST',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: {
            content: { residentCount: Math.round(Math.random() * 6) },
            status: 'OK',
          },
        },
      },
    ],
  },
];

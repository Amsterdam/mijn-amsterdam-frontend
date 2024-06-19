const KREFIA_RESPONSE = require('../fixtures/krefia.json');
const settings = require('../settings');

module.exports = [
  {
    id: 'get-krefia',
    url: `${settings.MOCK_BASE_PATH}/krefia/all`,
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: KREFIA_RESPONSE,
        },
      },
    ],
  },
];

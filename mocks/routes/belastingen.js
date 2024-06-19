const settings = require('../settings');
const BELASTINGEN = require('../fixtures/belastingen.json');

module.exports = [
  {
    id: 'get-belastingen',
    url: `${settings.MOCK_BASE_PATH}/belastingen`,
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: BELASTINGEN,
        },
      },
    ],
  },
];

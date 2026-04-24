const BELASTINGEN = require('../fixtures/belastingen.json');
const settings = require('../settings.cjs');

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

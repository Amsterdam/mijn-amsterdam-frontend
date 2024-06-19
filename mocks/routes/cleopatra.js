const settings = require('../settings');
const CLEOPATRA_RESPONSE = require('../fixtures/cleopatra.json');

module.exports = [
  {
    id: 'get-cleopatra',
    url: `${settings.MOCK_BASE_PATH}/milieuzone`,
    method: 'POST',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: CLEOPATRA_RESPONSE,
        },
      },
    ],
  },
];

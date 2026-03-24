const settings = require('../settings.cjs');
const CLEOPATRA_RESPONSE = require('../fixtures/cleopatra.json');

module.exports = [
  {
    id: 'post-cleopatra',
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

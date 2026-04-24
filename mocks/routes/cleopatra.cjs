const CLEOPATRA_RESPONSE = require('../fixtures/cleopatra.json');
const settings = require('../settings.cjs');

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

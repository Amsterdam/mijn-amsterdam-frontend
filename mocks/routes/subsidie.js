const settings = require('../settings');
const SUBSIDIE_RESPONSE = require('../fixtures/subsidie.json');

module.exports = [
  {
    id: 'get-subsidie',
    url: `${settings.MOCK_BASE_PATH}/subsidies(citizen|company)/*`,
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: SUBSIDIE_RESPONSE,
        },
      },
    ],
  },
];

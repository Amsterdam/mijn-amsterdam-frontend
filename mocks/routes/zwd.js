const ZWD_VVE = require('../fixtures/zwd-vve.json');
const settings = require('../settings');

module.exports = [
  {
    id: 'get-zwd-vve',
    url: `${settings.MOCK_BASE_PATH}/api/v1/address/0363010000801904/mijn-amsterdam/`,
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: ZWD_VVE,
        },
      },
    ],
  },
];

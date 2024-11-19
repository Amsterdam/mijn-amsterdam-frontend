/* eslint-disable @typescript-eslint/no-require-imports */
const settings = require('../settings');
const BASE = `${settings.MOCK_BASE_PATH}/amsterdam/data/v1`;

module.exports = [
  {
    id: 'get-huishoudelijk-afval',
    url: `${BASE}/wfs/huishoudelijkafval`,
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: require('../fixtures/huishoudelijk-afval.json'),
        },
      },
    ],
  },
];

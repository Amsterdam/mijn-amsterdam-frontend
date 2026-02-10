const SEARCH_CONFIG = require('../../src/client/components/Search/search-config.json');
const settings = require('../settings');

module.exports = [
  {
    id: 'get-search-config',
    url: `${settings.MOCK_BASE_PATH}/search-config`,
    method: 'get',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: SEARCH_CONFIG,
        },
      },
    ],
  },
];

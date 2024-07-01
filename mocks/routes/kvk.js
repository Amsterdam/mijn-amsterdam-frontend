const KVK_PRIVATE_RESPONSE = require('../fixtures/kvk-handelsregister.json');
const KVK_COMMERCIAL_RESPONSE = require('../fixtures/kvk-handelsregister2.json');
const settings = require('../settings.js');

module.exports = [
  {
    id: 'get-kvk',
    url: `${settings.MOCK_BASE_PATH}/mks-koppel-api/brp/hr`,
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'profile-type-handler',
        options: {
          privateUser: {
            status: 200,
            body: KVK_PRIVATE_RESPONSE,
          },
          commercialUser: {
            status: 200,
            body: KVK_COMMERCIAL_RESPONSE,
          },
        },
      },
    ],
  },
];

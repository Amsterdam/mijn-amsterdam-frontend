import KVK_PRIVATE_RESPONSE from '../fixtures/kvk-handelsregister.json' with { type: 'json' };
import KVK_COMMERCIAL_RESPONSE from '../fixtures/kvk-handelsregister2.json' with { type: 'json' };
import { MOCK_BASE_PATH } from '../settings.js';

export default [
  {
    id: 'get-kvk',
    url: `${MOCK_BASE_PATH}/mks-koppel-api/brp/hr`,
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

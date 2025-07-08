import KREFIA_RESPONSE from '../fixtures/krefia.json' with { type: 'json' };
import { MOCK_BASE_PATH } from '../settings.js';

export default [
  {
    id: 'get-krefia',
    url: `${MOCK_BASE_PATH}/krefia-koppel-api/krefia/all`,
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: KREFIA_RESPONSE,
        },
      },
    ],
  },
];

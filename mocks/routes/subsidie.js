import SUBSIDIE_RESPONSE from '../fixtures/subsidie.json' with { type: 'json' };
import { MOCK_BASE_PATH } from '../settings.js';

export default [
  {
    id: 'get-subsidie',
    url: `${MOCK_BASE_PATH}/subsidies/:type(citizen|company)/:token`,
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

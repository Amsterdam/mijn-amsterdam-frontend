import KREFIA_RESPONSE from '../fixtures/krefia.json' with { type: 'json' };
import { defineMockRoutes } from '../route-registry.ts';
import { MOCK_BASE_PATH } from '../settings.ts';

export const routes = defineMockRoutes([
  {
    id: 'get-krefia',
    url: `${MOCK_BASE_PATH}/krefia-koppel-api/krefia/all`,
    method: 'POST',
    handler: {
      type: 'json',
      status: 200,
      body: KREFIA_RESPONSE,
    },
  },
]);

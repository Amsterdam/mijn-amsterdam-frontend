import SVWI_RESPONSE from '../fixtures/svwi.json' with { type: 'json' };
import { defineMockRoutes } from '../route-registry.ts';
import { MOCK_BASE_PATH } from '../settings.ts';

export const routes = defineMockRoutes([
  {
    id: 'get-svwi-tegel',
    url: `${MOCK_BASE_PATH}/svwi/autorisatie/tegel`,
    method: 'GET',
    handler: {
      type: 'json',
      status: 200,
      body: SVWI_RESPONSE,
    },
  },
]);

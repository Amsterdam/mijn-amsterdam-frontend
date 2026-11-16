import BELASTINGEN from '../fixtures/belastingen.json' with { type: 'json' };
import { defineMockRoutes } from '../route-registry.ts';
import { MOCK_BASE_PATH } from '../settings.ts';

export const routes = defineMockRoutes([
  {
    id: 'get-belastingen',
    url: `${MOCK_BASE_PATH}/belastingen`,
    method: 'GET',
    handler: {
      type: 'json',
      status: 200,
      body: BELASTINGEN,
    },
  },
]);

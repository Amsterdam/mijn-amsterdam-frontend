import CLEOPATRA_RESPONSE from '../fixtures/cleopatra.json' with {
  type: 'json',
};
import { defineMockRoutes } from '../route-registry.ts';
import { MOCK_BASE_PATH } from '../settings.ts';

export const routes = defineMockRoutes([
  {
    id: 'post-cleopatra',
    url: `${MOCK_BASE_PATH}/milieuzone`,
    method: 'POST',
    handler: {
      type: 'json',
      status: 200,
      body: CLEOPATRA_RESPONSE,
    },
  },
]);

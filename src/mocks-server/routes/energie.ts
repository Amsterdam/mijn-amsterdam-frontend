import ENERGIE_LABEL from '../fixtures/energie-label.json' with { type: 'json' };
import { defineMockRoutes } from '../route-registry.ts';
import { MOCK_BASE_PATH } from '../settings.ts';

export const routes = defineMockRoutes([
  {
    id: 'get-energie-label',
    url: `${MOCK_BASE_PATH}/v1/duurzaamheid/energielabel`,
    method: 'GET',
    handler: {
      type: 'json',
      status: 200,
      body: ENERGIE_LABEL,
    },
  },
]);

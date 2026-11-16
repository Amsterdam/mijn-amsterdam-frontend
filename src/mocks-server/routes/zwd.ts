import ZWD_VVE from '../fixtures/zwd-vve.json' with { type: 'json' };
import { defineMockRoutes } from '../route-registry.ts';
import { MOCK_BASE_PATH } from '../settings.ts';

export const routes = defineMockRoutes([
  {
    id: 'get-zwd-vve',
    url: `${MOCK_BASE_PATH}/api/v1/address/0363010000801904/mijn-amsterdam/`,
    method: 'GET',
    handler: {
      type: 'json',
      status: 200,
      body: ZWD_VVE,
    },
  },
]);

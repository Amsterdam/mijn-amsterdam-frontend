import SEARCH_CONFIG from '../../client/components/Search/search-config.json' with {
  type: 'json',
};
import { defineMockRoutes } from '../route-registry.ts';
import { MOCK_BASE_PATH } from '../settings.ts';

export const routes = defineMockRoutes([
  {
    id: 'get-search-config',
    url: `${MOCK_BASE_PATH}/search-config`,
    method: 'GET',
    handler: {
      type: 'json',
      status: 200,
      body: SEARCH_CONFIG,
    },
  },
]);

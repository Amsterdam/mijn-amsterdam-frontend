import SEARCH_CONFIG from '../../client/components/Search/search-config.json' with { type: 'json' };
import { MOCK_BASE_PATH } from '../settings.ts';
import type { MockRouteDefinition } from '../types.ts';

export const routes: MockRouteDefinition[] = [
  {
    id: 'get-search-config',
    url: `${MOCK_BASE_PATH}/search-config`,
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: SEARCH_CONFIG,
        },
      },
    ],
  },
];

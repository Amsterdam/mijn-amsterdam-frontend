import ZWD_VVE from '../fixtures/zwd-vve.json' with { type: 'json' };
import { MOCK_BASE_PATH } from '../settings.ts';
import type { MockRouteDefinition } from '../types.ts';

export const routes: MockRouteDefinition[] = [
  {
    id: 'get-zwd-vve',
    url: `${MOCK_BASE_PATH}/api/v1/address/0363010000801904/mijn-amsterdam/`,
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: ZWD_VVE,
        },
      },
    ],
  },
];

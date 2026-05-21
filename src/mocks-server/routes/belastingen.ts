import BELASTINGEN from '../fixtures/belastingen.json' with { type: 'json' };
import { MOCK_BASE_PATH } from '../settings.ts';
import type { MockRouteDefinition } from '../types.ts';

export const routes: MockRouteDefinition[] = [
  {
    id: 'get-belastingen',
    url: `${MOCK_BASE_PATH}/belastingen`,
    method: 'GET',
    variants: [
      {
        type: 'json',
        options: {
          status: 200,
          body: BELASTINGEN,
        },
      },
    ],
  },
];

import SVWI_RESPONSE from '../fixtures/svwi.json' with { type: 'json' };
import { MOCK_BASE_PATH } from '../settings.ts';
import type { MockRouteDefinition } from '../types.ts';

export const routes: MockRouteDefinition[] = [
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
];

import CLEOPATRA_RESPONSE from '../fixtures/cleopatra.json' with { type: 'json' };
import { MOCK_BASE_PATH } from '../settings.ts';
import type { MockRouteDefinition } from '../types.ts';

export const routes: MockRouteDefinition[] = [
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
];

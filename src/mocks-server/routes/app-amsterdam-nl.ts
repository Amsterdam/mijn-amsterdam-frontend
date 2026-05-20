import { MOCK_BASE_PATH } from '../settings.ts';
import type { MockRouteDefinition } from '../types.ts';

export const appAmsterdamNlRoutes: MockRouteDefinition[] = [
  {
    id: 'post-amsapp-administratienummer',
    url: `${MOCK_BASE_PATH}/amsapp/session/credentials`,
    method: 'POST',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: { detail: 'Success' },
        },
      },
    ],
  },
];

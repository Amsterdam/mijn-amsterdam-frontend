import { MOCK_BASE_PATH } from '../settings.ts';
import type { MockRouteDefinition } from '../types.ts';

export const routes: MockRouteDefinition[] = [
  {
    id: 'post-datapunt-iam-oauth',
    url: `${MOCK_BASE_PATH}/datapunt-iam/openid-connect/token`,
    method: 'POST',
    variants: [
      {
        type: 'json',
        options: {
          status: 200,
          body: { access_token: 'hello-world' },
        },
      },
    ],
  },
];

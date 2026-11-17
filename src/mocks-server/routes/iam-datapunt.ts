import { defineMockRoutes } from '../route-registry.ts';
import { MOCK_BASE_PATH } from '../settings.ts';

export const routes = defineMockRoutes([
  {
    id: 'post-datapunt-iam-oauth',
    url: `${MOCK_BASE_PATH}/datapunt-iam/openid-connect/token`,
    method: 'POST',
    handler: {
      type: 'json',
      status: 200,
      body: { access_token: 'hello-world' },
    },
  },
]);

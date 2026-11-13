import { defineMockRoutes } from '../route-registry.ts';
import { MOCK_BASE_PATH } from '../settings.ts';

export const routes = defineMockRoutes([
  {
    id: 'post-ms-oauth',
    url: `${MOCK_BASE_PATH}/ms-oauth/:tenant/oauth2/v2.0/token`,
    method: 'POST',
    handler: {
      type: 'json',
      status: 200,
      body: { access_token: 'foo-bar' },
    },
  },
]);

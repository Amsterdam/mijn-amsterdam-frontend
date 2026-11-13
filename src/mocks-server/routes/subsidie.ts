import SUBSIDIE_RESPONSE from '../fixtures/subsidie.json' with { type: 'json' };
import { defineMockRoutes } from '../route-registry.ts';
import { MOCK_BASE_PATH } from '../settings.ts';

export const routes = defineMockRoutes([
  {
    id: 'get-subsidie-citizen',
    url: `${MOCK_BASE_PATH}/subsidies/citizen/:token`,
    method: 'GET',
    handler: {
      type: 'json',
      status: 200,
      body: SUBSIDIE_RESPONSE,
    },
  },
  {
    id: 'get-subsidie-company',
    url: `${MOCK_BASE_PATH}/subsidies/company/:token`,
    method: 'GET',
    handler: {
      type: 'json',
      status: 200,
      body: SUBSIDIE_RESPONSE,
    },
  },
]);

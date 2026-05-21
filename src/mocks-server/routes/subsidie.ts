import SUBSIDIE_RESPONSE from '../fixtures/subsidie.json' with { type: 'json' };
import { MOCK_BASE_PATH } from '../settings.ts';
import type { MockRouteDefinition } from '../types.ts';

export const routes: MockRouteDefinition[] = [
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
];

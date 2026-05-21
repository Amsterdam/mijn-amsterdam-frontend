import AFSPRAKEN_RESPONSE from '../fixtures/salesforce-afspraken-stadsloket.json' with { type: 'json' };
import CONTACTMOMENTEN_RESPONSE from '../fixtures/salesforce-contactmomenten.json' with { type: 'json' };
import { MOCK_BASE_PATH } from '../settings.ts';
import type { MockRouteDefinition } from '../types.ts';

export const routes: MockRouteDefinition[] = [
  {
    id: 'get-salesforce-contactmomenten',
    url: `${MOCK_BASE_PATH}/salesforce/contactmomenten/services/apexrest/klantinteracties/v1.0/klantcontacten/`,
    method: 'GET',
    variants: [
      {
        type: 'json',
        options: {
          status: 200,
          body: CONTACTMOMENTEN_RESPONSE,
        },
      },
    ],
  },
  {
    id: 'get-salesforce-afspraken-stadsloket',
    url: `${MOCK_BASE_PATH}/salesforce/contactmomenten/services/apexrest/klantinteracties/v1.0/appointments`,
    method: 'GET',
    variants: [
      {
        type: 'json',
        options: {
          status: 200,
          body: AFSPRAKEN_RESPONSE,
        },
      },
    ],
  },
];

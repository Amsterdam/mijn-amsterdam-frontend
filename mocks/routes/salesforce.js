import SALESFORCE_RESPONSE from '../fixtures/salesforce-contactmomenten.json' with { type: 'json' };
import { MOCK_BASE_PATH } from '../settings.js';

export default [
  {
    id: 'get-salesforce',
    url: `${MOCK_BASE_PATH}/salesforce/contactmomenten/services/apexrest/klantinteracties/v1.0/klantcontacten/`,
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: SALESFORCE_RESPONSE,
        },
      },
    ],
  },
];

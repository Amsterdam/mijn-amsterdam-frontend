import LOODMETINGEN_RAPPORT_RESPONSE from '../fixtures/loodmeting-rapport.json' with {
  type: 'json',
};
import LOODMETINGEN_RESPONSE from '../fixtures/loodmetingen.json' with {
  type: 'json',
};
import { defineMockRoutes } from '../route-registry.ts';
import { MOCK_BASE_PATH } from '../settings.ts';

export const routes = defineMockRoutes([
  {
    id: 'post-loodmetingen-details',
    url: `${MOCK_BASE_PATH}/loodmetingen/be_getrequestdetails`,
    method: 'POST',
    handler: {
      type: 'json',
      status: 200,
      body: LOODMETINGEN_RESPONSE,
    },
  },
  {
    id: 'post-loodmetingen-rapport',
    url: `${MOCK_BASE_PATH}/loodmetingen/be_downloadleadreport`,
    method: 'POST',
    handler: {
      type: 'json',
      status: 200,
      body: LOODMETINGEN_RAPPORT_RESPONSE,
    },
  },
]);

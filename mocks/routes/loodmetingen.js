import LOODMETINGEN_RAPPORT_RESPONSE from '../fixtures/loodmeting-rapport.json' with { type: 'json' };
import LOODMETINGEN_RESPONSE from '../fixtures/loodmetingen.json' with { type: 'json' };
import { MOCK_BASE_PATH } from '../settings.js';

export default [
  {
    id: 'post-loodmetingen-details',
    url: `${MOCK_BASE_PATH}/loodmetingen/be_getrequestdetails`,
    method: 'POST',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: LOODMETINGEN_RESPONSE,
        },
      },
    ],
  },
  {
    id: 'post-loodmetingen-rapport',
    url: `${MOCK_BASE_PATH}/loodmetingen/be_downloadleadreport`,
    method: 'POST',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: LOODMETINGEN_RAPPORT_RESPONSE,
        },
      },
    ],
  },
];

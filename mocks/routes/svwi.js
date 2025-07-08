import SVWI_RESPONSE from '../fixtures/svwi.json' with { type: 'json' };
import { MOCK_BASE_PATH } from '../settings.js';

// https://gemeente-amsterdam.atlassian.net/wiki/spaces/ma/pages/780927155/svwi+werk+en+inkomen (nog niet geimplementeerd?)
export default [
  {
    id: 'get-svwi-tegel',
    url: `${MOCK_BASE_PATH}/svwi/autorisatie/tegel`,
    method: 'get',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: SVWI_RESPONSE,
        },
      },
    ],
  },
];

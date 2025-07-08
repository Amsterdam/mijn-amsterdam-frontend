import { MOCK_BASE_PATH } from '../settings.js';

export default [
  {
    id: 'post-amsapp-administratienummer',
    url: `${MOCK_BASE_PATH}/amsapp/session/credentials`,
    method: 'POST',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: { detail: 'Success' },
        },
      },
    ],
  },
];

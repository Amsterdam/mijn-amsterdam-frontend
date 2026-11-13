import { defineMockRoutes } from '../route-registry.ts';
import { MOCK_BASE_PATH } from '../settings.ts';

export const routes = defineMockRoutes([
  {
    id: 'post-amsapp-administratienummer',
    url: `${MOCK_BASE_PATH}/amsapp/session/credentials`,
    method: 'POST',
    handler: {
      type: 'json',
      status: 200,
      body: { detail: 'Success' },
    },
  },
  {
    id: 'post-amsapp-notifications-logout',
    url: `${MOCK_BASE_PATH}/amsapp/mijnamsterdam/api/v1/logout-notification`,
    method: 'POST',
    handler: {
      type: 'json',
      status: 200,
      body: { status: 'OK' },
    },
  },
]);

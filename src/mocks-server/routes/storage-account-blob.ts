import { MOCK_BASE_PATH } from '../settings.ts';
import type { MockRouteDefinition } from '../types.ts';

export const routes: MockRouteDefinition[] = [
  {
    id: 'get-test-accounts-digid',
    url: `${MOCK_BASE_PATH}/test-accounts/digid`,
    method: 'GET',
    handler: {
      type: 'json',
      status: 200,
      body: {
        tableHeaders: [
          { displayName: 'Gebruikersnaam', key: 'username' },
          { displayName: 'Profiel ID', key: 'profileId' },
        ],
        accounts: [
          {
            username: 'from-mocks-server',
            profileId: '999999999',
          },
        ],
      },
    },
  },
  {
    id: 'get-test-accounts-eherkenning',
    url: `${MOCK_BASE_PATH}/test-accounts/eherkenning`,
    method: 'GET',
    handler: {
      type: 'json',
      status: 200,
      body: {
        tableHeaders: [
          { displayName: 'Gebruikersnaam', key: 'username' },
          { displayName: 'Profiel ID', key: 'profileId' },
        ],
        accounts: [
          {
            username: 'from-mocks-server',
            profileId: '999999999',
            fooBar: 'baz',
          },
        ],
      },
    },
  },
];

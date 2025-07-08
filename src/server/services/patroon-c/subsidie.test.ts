import { describe, expect, test } from 'vitest';

import { fetchSubsidieNotifications } from './subsidie.ts';
import { getAuthProfileAndToken, remoteApi } from '../../../testing/utils.ts';

describe('Subsidie', () => {
  const authProfileAndToken = getAuthProfileAndToken();
  const content = {
    isKnown: true,
    notifications: [
      {
        title: 'Test title',
        link: {
          to: 'http://localhost/to/subsidies',
          title: 'More about this',
        },
      },
    ],
  };

  test('fetchSubsidieNotifications digid', async () => {
    remoteApi
      .get(/\/subsidies\/*\/*/)
      .times(1)
      .reply(200, { content, status: 'OK' });

    const result = await fetchSubsidieNotifications(authProfileAndToken);

    expect(result.content).toEqual({
      notifications: [
        {
          title: 'Test title',
          themaID: 'SUBSIDIES',
          themaTitle: 'Subsidies',
          link: {
            to: 'http://localhost/to/subsidies?authMethod=digid',
            title: 'More about this',
          },
        },
      ],
    });
  });

  test('fetchSubsidieNotifications eherkenning', async () => {
    remoteApi
      .get(/\/subsidies\/*\/*/)
      .times(1)
      .reply(200, { content, status: 'OK' });

    const result = await fetchSubsidieNotifications({
      ...authProfileAndToken,
      profile: { ...authProfileAndToken.profile, authMethod: 'eherkenning' },
    });

    expect(result.content).toEqual({
      notifications: [
        {
          title: 'Test title',
          themaID: 'SUBSIDIES',
          themaTitle: 'Subsidies',
          link: {
            to: 'http://localhost/to/subsidies?authMethod=eherkenning',
            title: 'More about this',
          },
        },
      ],
    });
  });

  test('fetchSubsidieNotifications error 500', async () => {
    remoteApi
      .get(/\/subsidies\/citizen\/*/)
      .reply(500, { content: null, message: 'Error!', status: 'ERROR' });

    const result = await fetchSubsidieNotifications(authProfileAndToken);

    expect(result.content).toEqual(null);
    expect(result.status).toBe('ERROR');
  });
});

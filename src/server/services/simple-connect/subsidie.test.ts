import { describe, expect, test } from 'vitest';

import { fetchSubsidieNotifications } from './subsidie';
import { remoteApi } from '../../../testing/utils';
import { ThemaIDs } from '../../../universal/config/thema';
import { AuthProfileAndToken } from '../../auth/auth-types';

describe('Subsidie', () => {
  const authProfileAndToken: AuthProfileAndToken = {
    profile: { authMethod: 'digid', profileType: 'private', id: '', sid: '' },
    token: 'xxxxxx',
  };

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

    const result = await fetchSubsidieNotifications(
      'xx22xx',
      authProfileAndToken
    );

    expect(result.content).toEqual({
      notifications: [
        {
          title: 'Test title',
          thema: ThemaIDs.SUBSIDIE,
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

    const result = await fetchSubsidieNotifications('xx22xx', {
      ...authProfileAndToken,
      profile: { ...authProfileAndToken.profile, authMethod: 'eherkenning' },
    });

    expect(result.content).toEqual({
      notifications: [
        {
          title: 'Test title',
          thema: ThemaIDs.SUBSIDIE,
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

    const result = await fetchSubsidieNotifications(
      'xx22xxNx',
      authProfileAndToken
    );

    expect(result.content).toEqual(null);
    expect(result.status).toBe('ERROR');
  });
});

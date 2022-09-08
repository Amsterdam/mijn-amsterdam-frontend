import nock from 'nock';
import { Chapters } from '../../../universal/config';
import { AuthProfileAndToken } from '../../helpers/app';
import { fetchSubsidieNotifications } from './subsidie';

describe('Subsidie', () => {
  const authProfileAndToken: AuthProfileAndToken = {
    profile: { authMethod: 'digid', profileType: 'private' },
    token: 'xxxxxx',
  };

  afterAll(() => {
    // Enable http requests.
    nock.enableNetConnect();
    nock.restore();
  });

  beforeAll(() => {
    // Disable real http requests.
    // All requests should be mocked.
    nock.disableNetConnect();
  });

  test('fetchSubsidieNotifications', async () => {
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

    nock('http://localhost')
      .get(/\/remote\/subsidies\/api\/*\/*/)
      .times(2)
      .reply(200, { content, status: 'OK' });

    nock('http://localhost')
      .get(/\/remote\/subsidies\/api\/citizen\/*/)
      .reply(500, { content: null, message: 'Error!', status: 'ERROR' });

    {
      const result = await fetchSubsidieNotifications(
        'xx22xx',
        authProfileAndToken
      );

      expect(result.content).toEqual({
        notifications: [
          {
            title: 'Test title',
            chapter: Chapters.SUBSIDIE,
            link: {
              to: 'http://localhost/to/subsidies?authMethod=digid',
              title: 'More about this',
            },
          },
        ],
      });
    }

    {
      const result = await fetchSubsidieNotifications('xx22xx', {
        ...authProfileAndToken,
        profile: { ...authProfileAndToken.profile, authMethod: 'eherkenning' },
      });

      expect(result.content).toEqual({
        notifications: [
          {
            title: 'Test title',
            chapter: Chapters.SUBSIDIE,
            link: {
              to: 'http://localhost/to/subsidies?authMethod=eherkenning',
              title: 'More about this',
            },
          },
        ],
      });
    }

    {
      const result = await fetchSubsidieNotifications(
        'xx22xx',
        authProfileAndToken
      );

      expect(result.content).toEqual(null);
      expect(result.status).toBe('ERROR');
    }
  });
});

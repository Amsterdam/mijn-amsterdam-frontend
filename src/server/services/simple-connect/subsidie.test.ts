import nock from 'nock';
import { BFF_PORT } from '../../config';
import { AuthProfileAndToken } from '../../helpers/app';
import { fetchSubsidieGenerated } from './subsidie';

describe('Subsidie', () => {
  const authProfileAndToken: AuthProfileAndToken = {
    profile: { authMethod: 'eherkenning', profileType: 'private' },
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

  test('fetchSubsidieGenerated', async () => {
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

    nock('http://localhost:' + BFF_PORT)
      .get('/subsidies/summary')
      .times(2)
      .reply(200, { content });

    nock('http://localhost:' + BFF_PORT)
      .get('/subsidies/summary')
      .reply(500, { content: null, message: 'Error!', status: 'ERROR' });

    {
      const result = await fetchSubsidieGenerated(
        'xx22xx',
        authProfileAndToken
      );

      expect(result.content).toEqual({
        isKnown: true,
        notifications: [
          {
            title: 'Test title',
            link: {
              to: 'http://localhost/to/subsidies?authMethod=eherkenning',
              title: 'More about this',
            },
          },
        ],
      });
    }

    {
      const result = await fetchSubsidieGenerated('xx22xx', {
        ...authProfileAndToken,
        profile: { ...authProfileAndToken.profile, authMethod: 'digid' },
      });
      expect(result.content).toEqual({
        isKnown: true,
        notifications: [
          {
            title: 'Test title',
            link: {
              to: 'http://localhost/to/subsidies?authMethod=digid',
              title: 'More about this',
            },
          },
        ],
      });
    }

    {
      const result = await fetchSubsidieGenerated(
        'xx22xx',
        authProfileAndToken
      );
      expect(result.content).toEqual(null);
      expect(result.status).toBe('ERROR');
    }
  });
});

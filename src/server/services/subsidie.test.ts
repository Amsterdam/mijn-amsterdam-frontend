import nock from 'nock';
import { BFF_PORT } from '../config';
import { fetchSource } from './subsidie';

describe('Subsidie', () => {
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

  test('fetchSubsidie', async () => {
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
      .get('/test-api/subsidies/summary')
      .times(2)
      .reply(200, { content });

    nock('http://localhost:' + BFF_PORT)
      .get('/test-api/subsidies/summary')
      .reply(500, { content: null, message: 'Error!', status: 'ERROR' });

    const headers = {
      'x-auth-type': 'E',
      'x-saml-attribute-token1': 'xxx111xxxddd',
    };

    {
      const result = await fetchSource('xx22xx', headers, true);
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
      headers['x-auth-type'] = 'D';

      const result = await fetchSource('xx22xx', headers, true);
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
      const result = await fetchSource('xx22xx', headers, true);
      expect(result.content).toEqual(null);
      expect(result.status).toBe('ERROR');
    }
  });
});

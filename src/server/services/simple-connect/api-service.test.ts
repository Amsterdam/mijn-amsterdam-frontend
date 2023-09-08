import nock from 'nock';
import { describe, expect, test } from 'vitest';
import * as service from './api-service';
import { remoteApi } from '../../../test-utils';
import { remoteApiHost } from '../../../setupTests';

const REQUEST_ID = 'test-x';

const apiUrlTest = `${remoteApiHost}/api`;

describe('simple-connect/api-service', () => {
  remoteApi
    .get('/api')
    .reply(200, { status: 'OK', content: 'foobar' })
    .get('/api')
    .times(3)
    .reply(200, {
      status: 'OK',
      content: {
        notifications: [
          {
            title: 'Dingen en zo',
            description: 'Bekijk deze mooie site eens!',
            datePublished: '2022-04-22',
            link: {
              title: 'Bekijk hier',
              to: 'https://mijn.amsterdam.nl',
            },
          },
        ],
        things: ['foo', 'bar'],
      },
    });

  test('fetchApi 1', async () => {
    const responseContent = await service.fetchService(REQUEST_ID, {
      url: apiUrlTest,
    });

    expect(responseContent).toMatchInlineSnapshot(`
      {
        "content": "foobar",
        "status": "OK",
      }
    `);
  });

  test('fetchApi 2', async () => {
    const responseContent = await service.fetchService(REQUEST_ID, {
      url: apiUrlTest,
    });

    expect(responseContent).toMatchInlineSnapshot(`
      {
        "content": {
          "things": [
            "foo",
            "bar",
          ],
        },
        "status": "OK",
      }
    `);
  });

  test('fetchApi 3', async () => {
    const responseContent = await service.fetchService(
      REQUEST_ID,
      {
        url: apiUrlTest,
      },
      true
    );

    expect(responseContent).toMatchInlineSnapshot(`
      {
        "content": {
          "notifications": [
            {
              "datePublished": "2022-04-22",
              "description": "Bekijk deze mooie site eens!",
              "link": {
                "title": "Bekijk hier",
                "to": "https://mijn.amsterdam.nl",
              },
              "title": "Dingen en zo",
            },
          ],
          "things": [
            "foo",
            "bar",
          ],
        },
        "status": "OK",
      }
    `);
  });

  test('fetchTipsAndNotifications 1', async () => {
    const responseContent = await service.fetchTipsAndNotifications(
      REQUEST_ID,
      {
        url: apiUrlTest,
      },
      'TEST_CHAPTER'
    );

    expect(responseContent).toMatchInlineSnapshot(`
      {
        "content": {
          "notifications": [
            {
              "chapter": "TEST_CHAPTER",
              "datePublished": "2022-04-22",
              "description": "Bekijk deze mooie site eens!",
              "link": {
                "title": "Bekijk hier",
                "to": "https://mijn.amsterdam.nl",
              },
              "title": "Dingen en zo",
            },
          ],
        },
        "status": "OK",
      }
    `);
  });
});

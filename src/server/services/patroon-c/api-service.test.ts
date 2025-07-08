import { beforeEach, describe, expect, test } from 'vitest';

import * as service from './api-service.ts';
import { remoteApiHost } from '../../../testing/setup.ts';
import { remoteApi } from '../../../testing/utils.ts';

const REQUEST_ID = 'test-x';

const apiUrlTest = `${remoteApiHost}/api`;

describe('simple-connect/api-service', () => {
  beforeEach(() => {
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
  });

  test('fetchApi 1', async () => {
    const responseContent = await service.fetchService({
      url: apiUrlTest,
    });

    expect(responseContent).toMatchInlineSnapshot(`
      {
        "content": "foobar",
        "status": "OK",
      }
    `);

    const responseContent2 = await service.fetchService({
      url: apiUrlTest,
    });

    expect(responseContent2).toMatchInlineSnapshot(`
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

    const responseContent3 = await service.fetchService(
      {
        url: apiUrlTest,
      },
      true
    );

    expect(responseContent3).toMatchInlineSnapshot(`
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

    const responseContentTipsAndNotifications =
      await service.fetchTipsAndNotifications(
        {
          url: apiUrlTest,
        },
        'INKOMEN'
      );

    expect(responseContentTipsAndNotifications).toStrictEqual({
      content: {
        notifications: [
          {
            datePublished: '2022-04-22',
            description: 'Bekijk deze mooie site eens!',
            link: {
              title: 'Bekijk hier',
              to: 'https://mijn.amsterdam.nl',
            },
            themaID: 'INKOMEN',
            title: 'Dingen en zo',
          },
        ],
      },
      status: 'OK',
    });
  });
});

import nock from 'nock';
import * as service from './api-service';

const REQUEST_ID = 'test-x';

describe('simple-connect/api-service', () => {
  nock('http://test')
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
      url: 'http://test/api',
    });

    expect(responseContent).toMatchInlineSnapshot(`
      Object {
        "content": "foobar",
        "status": "OK",
      }
    `);
  });

  test('fetchApi 2', async () => {
    const responseContent = await service.fetchService(REQUEST_ID, {
      url: 'http://test/api',
    });

    expect(responseContent).toMatchInlineSnapshot(`
      Object {
        "content": Object {
          "things": Array [
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
        url: 'http://test/api',
      },
      true
    );

    expect(responseContent).toMatchInlineSnapshot(`
      Object {
        "content": Object {
          "notifications": Array [
            Object {
              "datePublished": "2022-04-22",
              "description": "Bekijk deze mooie site eens!",
              "link": Object {
                "title": "Bekijk hier",
                "to": "https://mijn.amsterdam.nl",
              },
              "title": "Dingen en zo",
            },
          ],
          "things": Array [
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
        url: 'http://test/api',
      },
      'TEST_CHAPTER'
    );

    expect(responseContent).toMatchInlineSnapshot(`
      Object {
        "content": Object {
          "notifications": Array [
            Object {
              "chapter": "TEST_CHAPTER",
              "datePublished": "2022-04-22",
              "description": "Bekijk deze mooie site eens!",
              "link": Object {
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

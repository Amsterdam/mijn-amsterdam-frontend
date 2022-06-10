import nock from 'nock';
import { ApiUrls, BFF_PORT } from '../../config';
import { AuthProfile } from '../../helpers/app';
import { fetchService } from './api-service';

const REQUEST_ID = 'test-x';
const AUTH_PROFILE_DIGID: AuthProfile = {
  authMethod: 'digid',
  profileType: 'private',
  id: 'xxBSNxx',
};

describe('simple-connect/api-service', () => {
  nock('http://test')
    .get('/api')
    .reply(200, { status: 'OK', content: 'foobar' });

  test('fetchBelastingen', async () => {
    expect(
      await fetchService(REQUEST_ID, {
        url: 'http://test/api',
      })
    ).toMatchInlineSnapshot(`
      Object {
        "content": Object {
          "0": "f",
          "1": "o",
          "2": "o",
          "3": "b",
          "4": "a",
          "5": "r",
        },
        "status": "OK",
      }
    `);
  });
});

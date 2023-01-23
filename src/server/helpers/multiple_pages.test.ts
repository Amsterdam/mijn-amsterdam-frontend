import { ApiSuccessResponse } from './../../universal/helpers/api';
import nock from 'nock';
import { requestData } from './source-api-request';

describe('requestData paginated requests', () => {
  let scope: nock.Scope | null = null;

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

  beforeEach(() => {
    scope = nock('https://localhost')
      .get('/paginated')
      .reply(
        200,
        { results: ['a', 'b', 'c'] },
        {
          link: '<https://localhost/paginated/1>; rel="self",<https://localhost/paginated/2>; rel="next"',
        }
      )
      .get('/paginated/2')
      .reply(
        200,
        { results: ['d', 'e'] },
        {
          link: '<https://localhost/paginated/2>; rel="self"',
        }
      );
  });

  afterEach(() => {
    scope = null;
  });

  it('Should fetch all pages', async () => {
    type Response = { results: string[] };

    expect(scope?.isDone()).toEqual(false);
    expect(scope?.activeMocks().length).toEqual(2);

    await requestData<Response>(
      {
        url: 'https://localhost/paginated',
        combinePaginatedResults: ({ results }, newResponse) => {
          return results.concat(
            (newResponse as unknown as ApiSuccessResponse<Response>).content
              ?.results
          );
        },
      },
      'test'
    );

    expect(scope?.isDone()).toEqual(true); // Assert all defined endpoints were hit
    expect(scope?.activeMocks().length).toEqual(0); // Assert there are no more active mocks
  });

  it('Should combine results using the function passed via combinePaginatedResults', async () => {
    type Response = { results: string[] };
    const combine = jest.fn().mockImplementation(({ results }, newResponse) => {
      return results.concat(
        (newResponse as unknown as ApiSuccessResponse<Response>).content
          ?.results
      );
    });

    const result = await requestData<Response>(
      {
        url: 'https://localhost/paginated',
        combinePaginatedResults: combine,
      },
      'test'
    );

    expect(combine).toHaveBeenCalled();
    expect(combine).toHaveBeenCalledTimes(1);
    expect(result.content).toEqual(['a', 'b', 'c', 'd', 'e']);
  });
});

import { ApiSuccessResponse } from '../../universal/helpers/api';
import nock from 'nock';
import { requestData } from './source-api-request';

type Response = { results: string[] };
const combine = ({ results }: Response, newResponse: any) => {
  return {
    results: results.concat(
      (newResponse as unknown as ApiSuccessResponse<Response>).content.results
    ),
  };
};

describe('requestData paginated requests', () => {
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

  describe('basics', () => {
    let scope: nock.Scope | null = null;

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
      expect(scope?.isDone()).toEqual(false);
      expect(scope?.activeMocks().length).toEqual(2);

      await requestData<Response>(
        {
          url: 'https://localhost/paginated',
          combinePaginatedResults: combine,
          maximumAmountOfPages: 2,
        },
        'test'
      );

      expect(scope?.isDone()).toEqual(true); // Assert all defined endpoints were hit
      expect(scope?.activeMocks().length).toEqual(0); // Assert there are no more active mocks
    });

    it('Should combine results using the function passed via combinePaginatedResults', async () => {
      const combineMock = jest.fn().mockImplementation(combine);
      expect(combineMock).not.toHaveBeenCalled();

      const result = await requestData<Response>(
        {
          url: 'https://localhost/paginated',
          combinePaginatedResults: combineMock,
          maximumAmountOfPages: 2,
        },
        'test'
      );

      expect(combineMock).toHaveBeenCalled();
      expect(combineMock).toHaveBeenCalledTimes(1);
      expect(result.content).toEqual({ results: ['a', 'b', 'c', 'd', 'e'] });
    });
  });

  describe('maximum number of pages', () => {
    let scope: nock.Scope | null = null;
    const content = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k'];

    beforeEach(() => {
      scope = nock('https://localhost');

      content.forEach((letter, index) => {
        const page = index + 1;

        scope?.get(`/paginated/${page}`).reply(
          200,
          { results: [letter] },
          {
            link: `<https://localhost/paginated/${page}>; rel="self",<https://localhost/paginated/${
              page + 1
            }>; rel="next"`,
          }
        );
      });
    });

    afterEach(() => {
      scope = null;
    });

    it('should not do more requests than the maximum', async () => {
      type Response = { results: string[] };

      expect(scope?.isDone()).toEqual(false);
      expect(scope?.activeMocks().length).toEqual(11);

      const result = await requestData<Response>(
        {
          url: 'https://localhost/paginated/1',
          combinePaginatedResults: combine,
          maximumAmountOfPages: 10,
        },
        'test'
      );

      expect(result.content).toEqual({ results: content.slice(0, -1) }); // assert that results from last page were not included
      expect(scope?.isDone()).toEqual(false); // Assert that not all defined endpoints were hit
      expect(scope?.activeMocks().length).toEqual(1); // Assert there is still one more active endpoint
    });
  });
});

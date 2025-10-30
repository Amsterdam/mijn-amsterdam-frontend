import Mockdate from 'mockdate';
import z from 'zod';

import {
  createBFFRouter,
  generateFullApiUrlBFF,
  isProtectedRoute,
  isPublicEndpoint,
  queryParams,
  send404,
  sendBadRequest,
  sendBadRequestInvalidInput,
  sendMessage,
  sendResponse,
  sendServiceUnavailable,
  sendUnauthorized,
} from './route-helpers';
import { bffApiHost } from '../../testing/setup';
import { RequestMock, ResponseMock } from '../../testing/utils';
import {
  ApiResponse_DEPRECATED,
  apiErrorResult,
} from '../../universal/helpers/api';
import { oidcConfigDigid, oidcConfigEherkenning } from '../auth/auth-config';

describe('route-helpers', () => {
  const digidClientId = oidcConfigDigid.clientID;
  const eherkenningClientId = oidcConfigEherkenning.clientID;

  let resMock = ResponseMock.new();

  beforeAll(() => {
    oidcConfigEherkenning.clientID = 'test1';
    oidcConfigDigid.clientID = 'test2';

    Mockdate.set('2023-11-23');
  });

  afterAll(() => {
    oidcConfigEherkenning.clientID = digidClientId;
    oidcConfigDigid.clientID = eherkenningClientId;

    Mockdate.reset();
  });

  beforeEach(() => {
    resMock = ResponseMock.new();
  });

  describe('createBFFRouter', () => {
    test('should create a router with the given ID', () => {
      const router = createBFFRouter({ id: 'test-router' });
      expect(router.BFF_ID).toBe('test-router');
      expect(router.stack.length).toBe(0);
    });
    test('should skip the router', () => {
      const router = createBFFRouter({
        id: 'disabled-router',
        isEnabled: false,
      });

      const req = RequestMock.new().get();
      const res = ResponseMock.new();
      const next = vi.fn();

      expect(router.stack.length).toBe(1);

      router.stack?.[0]?.handle(req, res, next);

      expect(next).toHaveBeenCalledWith('router');
    });
  });

  describe('sendResponse tests', async () => {
    test('Sends 200 when status OK', () => {
      const response: ApiResponse_DEPRECATED<null> = {
        status: 'OK',
        content: null,
      };

      sendResponse(resMock, response);
      expect(resMock.send).toHaveBeenCalledWith(response);
    });

    test('Sends the correct status code in Error status', () => {
      const response = apiErrorResult('Bad request', null, 400);

      sendResponse(resMock, response);
      expect(resMock.statusCode).toBe(400);
      expect(resMock.send).toHaveBeenCalledWith(response);
    });

    test('Sends status code 500 when error and no code specified', () => {
      const response = apiErrorResult('Unknown error', null);

      sendResponse(resMock, response);
      expect(resMock.statusCode).toBe(500);
      expect(resMock.send).toHaveBeenCalledWith(response);
    });
  });

  test('send404', () => {
    send404(resMock);

    expect(resMock.status).toHaveBeenCalledWith(404);
    expect(resMock.send).toHaveBeenCalledWith(
      apiErrorResult('Not Found', null, 404)
    );
  });

  test('sendUnauthorized', () => {
    sendUnauthorized(resMock);

    expect(resMock.status).toHaveBeenCalledWith(401);
    expect(resMock.send).toHaveBeenCalledWith(
      apiErrorResult('Unauthorized', null, 401)
    );
  });

  test('sendMessage', () => {
    sendMessage(resMock, 'test', 'data-message', { foo: 'bar' });

    expect(resMock.write).toHaveBeenCalledWith(
      `event: data-message\nid: test\ndata: {"foo":"bar"}\n\n`
    );
  });

  test('queryParams', () => {
    const reqMock = RequestMock.new().setQuery({ paramName: 'test' }).get();
    const result = queryParams<{ paramName: string }>(reqMock);
    expect(result).toStrictEqual({ paramName: 'test' });
  });

  test('send404', () => {
    const resMock = ResponseMock.new();

    send404(resMock);

    expect(resMock.status).toHaveBeenCalledWith(404);
    expect(resMock.send).toHaveBeenCalledWith(
      apiErrorResult('Not Found', null, 404)
    );
  });

  test('sendUnauthorized', () => {
    const resMock = ResponseMock.new();

    sendUnauthorized(resMock);

    expect(resMock.status).toHaveBeenCalledWith(401);
    expect(resMock.send).toHaveBeenCalledWith(
      apiErrorResult('Unauthorized', null, 401)
    );
  });

  test('sendServiceUnavailable', () => {
    const resMock = ResponseMock.new();
    const responseData = apiErrorResult('Service Unavailable', null, 503);

    sendServiceUnavailable(resMock);

    expect(resMock.status).toHaveBeenCalledWith(503);
    expect(resMock.send).toHaveBeenCalledWith(responseData);
  });

  test('sendBadRequest', () => {
    const resMock = ResponseMock.new();
    const responseData = apiErrorResult('Bad request: No can do!', null, 400);

    sendBadRequest(resMock, 'No can do!', null);

    expect(resMock.status).toHaveBeenCalledWith(400);
    expect(resMock.send).toHaveBeenCalledWith(responseData);
  });

  describe('sendBadRequestInvalidInput', () => {
    const resMock = ResponseMock.new();

    test('Without ZOD error', () => {
      const responseData1 = apiErrorResult(
        'Bad request: Invalid input',
        null,
        400
      );

      sendBadRequestInvalidInput(resMock, new Error('No can do!'));

      expect(resMock.status).toHaveBeenCalledWith(400);
      expect(resMock.send).toHaveBeenCalledWith(responseData1);
    });

    test('With ZOD error', () => {
      const responseData2 = apiErrorResult(
        'Bad request:  First error -  Second error',
        null,
        400
      );

      sendBadRequestInvalidInput(
        resMock,
        new z.ZodError([
          { code: 'custom', message: 'First error', path: [] },
          { code: 'custom', message: 'Second error', path: [] },
        ])
      );

      expect(resMock.status).toHaveBeenCalledWith(400);
      expect(resMock.send).toHaveBeenCalledWith(responseData2);
    });
  });

  test('isPublicEndpoint', () => {
    const value2 = isPublicEndpoint('/services/stream');
    expect(value2).toBe(false);

    const value3 = isPublicEndpoint('/services/auth/anything');
    expect(value3).toBe(false);
  });

  test('isProtectedRoute', () => {
    const value = isProtectedRoute('/services/stream');
    expect(value).toBe(true);

    const value3 = isPublicEndpoint('/services/auth/anything');
    expect(value3).toBe(false);
  });

  describe('generateFullApiUrlBFF', () => {
    test('generateFullApiUrlBFF no params', () => {
      const value = generateFullApiUrlBFF('/services/stream');
      expect(value).toBe(`${bffApiHost}/api/v1/services/stream`);
    });
    test('generateFullApiUrlBFF with path params', () => {
      const value = generateFullApiUrlBFF('/services/test/:id', { id: '123' });
      expect(value).toBe(`${bffApiHost}/api/v1/services/test/123`);
    });
    test('generateFullApiUrlBFF with path and query params', () => {
      const value = generateFullApiUrlBFF('/services/test/:id', [
        { foo: 'bar' },
        { id: '123' },
      ]);
      expect(value).toBe(`${bffApiHost}/api/v1/services/test/123?foo=bar`);
    });
    test('generateFullApiUrlBFF with only query params', () => {
      const value = generateFullApiUrlBFF('/services/test', [{ foo: 'bar' }]);
      expect(value).toBe(`${bffApiHost}/api/v1/services/test?foo=bar`);
    });
    test('generateFullApiUrlBFF with only query params', () => {
      expect(() =>
        generateFullApiUrlBFF('/services/test/:id', [{ foo: 'bar' }])
      ).toThrow();
    });
  });
});

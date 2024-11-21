import Mockdate from 'mockdate';

import { clearRequestCache } from './route-handlers';
import {
  generateFullApiUrlBFF,
  isProtectedRoute,
  isPublicEndpoint,
  queryParams,
  send404,
  sendBadRequest,
  sendMessage,
  sendResponse,
  sendUnauthorized,
} from './route-helpers';
import { bffApiHost } from '../../testing/setupTests';
import { RequestMock, ResponseMock } from '../../testing/test-utils';
import { ApiResponse, apiErrorResult } from '../../universal/helpers/api';
import { oidcConfigDigid, oidcConfigEherkenning } from '../auth/auth-config';
import { cache } from '../helpers/source-api-request';

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

  describe('sendResponse tests', async () => {
    test('Sends 200 when status OK', () => {
      const response: ApiResponse = {
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

  test('clearRequestCache', () => {
    const requestID = '11223300xx';
    const resMock = ResponseMock.new();
    resMock.locals = { requestID };

    cache.put(requestID, { foo: 'bar' });

    expect(cache.get(requestID)).toEqual({ foo: 'bar' });

    clearRequestCache(RequestMock.new().get(), resMock);

    expect(cache.get(requestID)).toBe(null);
    expect(cache.keys()).toEqual([]);
  });

  test('clearRequestCache.unknown.key', () => {
    const requestID = '11223300xx';
    cache.put(requestID, { foo: 'bar' });

    expect(cache.get(requestID)).toEqual({ foo: 'bar' });

    const resMock = ResponseMock.new();
    resMock.locals = { requestID: 'some_other_key' };

    clearRequestCache(RequestMock.new().get(), resMock);

    expect(cache.get(requestID)).toEqual({ foo: 'bar' });
    expect(cache.keys()).toEqual([requestID]);
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

  test('sendBadRequest', () => {
    const resMock = ResponseMock.new();
    const responseData = apiErrorResult('Bad request: No can do!', null, 400);

    sendBadRequest(resMock, 'No can do!', null);

    expect(resMock.status).toHaveBeenCalledWith(400);
    expect(resMock.send).toHaveBeenCalledWith(responseData);
  });

  test('isPublicEndpoint', () => {
    const value = isPublicEndpoint('/services/cms');
    expect(value).toBe(true);

    const value2 = isPublicEndpoint('/services/stream');
    expect(value2).toBe(false);

    const value3 = isPublicEndpoint('/services/auth/anything');
    expect(value3).toBe(false);
  });

  test('isProtectedRoute', () => {
    const value = isProtectedRoute('/services/stream');
    expect(value).toBe(true);

    const value2 = isProtectedRoute('/services/cms');
    expect(value2).toBe(false);

    const value3 = isPublicEndpoint('/services/auth/anything');
    expect(value3).toBe(false);
  });

  test('generateFullApiUrlBFF', () => {
    const value = generateFullApiUrlBFF('/services/stream');
    expect(value).toBe(`${bffApiHost}/api/v1/services/stream`);
  });
});

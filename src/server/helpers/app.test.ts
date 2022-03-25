import express from 'express';
import {
  addServiceResultHandler,
  clearRequestCache,
  getAuth,
  getProfileType,
  queryParams,
  send404,
  sendMessage,
  requestID,
} from './app';
import { cache } from './source-api-request';

describe('server/helpers/app', () => {
  test('getAuth', () => {
    const req = {
      headers: {
        From: 'webmaster@example.org',
        'x-something-hack': 'hax0r',
        'x-saml-attribute-token1': 'xxx111xxxddd',
      },
      cookies: {
        authType: 'E',
      },
    } as unknown as typeof express.request;

    const result = getAuth(req);

    expect(result).toEqual({
      'x-auth-type': 'E',
      'x-saml-attribute-token1': 'xxx111xxxddd',
    });
  });

  test('requestID', () => {
    const mockNext = jest.fn();

    const req = {} as any;
    const res = {
      locals: {},
    } as any;

    requestID(req, res, mockNext);
    expect(res.locals.requestID).toBeDefined();
    expect(typeof res.locals.requestID).toBe('string');
    expect(mockNext).toHaveBeenCalled();
  });

  test('send404', () => {
    const mockRes = {
      status: jest.fn(),
      end: jest.fn(),
    };

    send404(mockRes as any);

    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.end).toHaveBeenCalledWith('not found');
  });

  test('clearRequestCache', () => {
    const requestID = '11223300xx';
    const nextMock = jest.fn();
    cache.put(requestID, { foo: 'bar' });

    expect(cache.get(requestID)).toEqual({ foo: 'bar' });

    clearRequestCache({} as any, { locals: { requestID } } as any, nextMock);

    expect(cache.get(requestID)).toBe(null);
    expect(cache.keys()).toEqual([]);
    expect(nextMock).toBeCalledTimes(1);
  });

  test('sendMessage', () => {
    const res = {
      write: jest.fn(),
    };
    sendMessage(res as any, 'test', 'data-message', { foo: 'bar' });

    expect(res.write).toHaveBeenCalledWith(
      `event: data-message\nid: test\ndata: {"foo":"bar"}\n\n`
    );
  });

  test('addServiceResultHandler', async () => {
    const data = { foo: 'bar' };
    const servicePromise = Promise.resolve(data);
    const res = {
      write: jest.fn(),
    };
    const result = await addServiceResultHandler(
      res as any,
      servicePromise,
      'test-service'
    );
    expect(res.write).toHaveBeenCalledWith(
      `event: message\nid: test-service\ndata: {"foo":"bar"}\n\n`
    );
    expect(result).toEqual(data);
  });

  test('queryParams', () => {
    const result = queryParams({ query: 'test' } as any);
    expect(result).toBe('test');
  });

  test('getProfileType', () => {
    {
      const result = getProfileType({ query: {} } as any);
      expect(result).toBe('private');
    }
    {
      const result = getProfileType({
        query: { profileType: 'commercial' },
      } as any);
      expect(result).toBe('commercial');
    }
  });
});

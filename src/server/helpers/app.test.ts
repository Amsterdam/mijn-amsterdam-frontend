import * as Sentry from '@sentry/node';
import express from 'express';
import {
  addServiceResultHandler,
  clearSession,
  exitEarly,
  getAuthTypeFromHeader,
  getPassthroughRequestHeaders,
  getProfileType,
  isBffEndpoint,
  isBffPublicEndpoint,
  isValidRequestPath,
  queryParams,
  send404,
  sendMessage,
  sessionID,
} from './app';
import { cache } from './source-api-request';

describe('server/helpers/app', () => {
  test('isValidRequestPath', () => {
    {
      const result = isValidRequestPath(
        '/test-api/bff/test/blap/bla',
        '/test/blap/bla'
      );
      expect(result).toBe(true);
    }
    {
      const result = isValidRequestPath(
        '/test-api/bff/test/blap/bla',
        '/blap/test/blip'
      );
      expect(result).toBe(false);
    }
    {
      const result = isValidRequestPath('/bff/test/blap/bla', '/test/blap/bla');
      expect(result).toBe(false);
    }
  });

  test('isBffEndpoint', () => {
    {
      const result = isBffEndpoint('/test-api/bff/services/all');
      expect(result).toBe(true);
    }
    {
      const result = isBffEndpoint('/services/all');
      expect(result).toBe(false);
    }
  });

  test('isBffPublicEndpoint', () => {
    {
      const result = isBffPublicEndpoint('/test-api/bff/services/all');
      expect(result).toBe(false);
    }
    {
      const result = isBffPublicEndpoint('/test-api/bff/public/services/cms');
      expect(result).toBe(true);
    }
  });

  test('getAuthTypeFromHeader', () => {
    {
      const result = getAuthTypeFromHeader({
        'x-auth-type': 'D',
      });
      expect(result).toBe('digid');
    }
    {
      const result = getAuthTypeFromHeader({
        'x-auth-type': 'E',
      });
      expect(result).toBe('eherkenning');
    }
    {
      const result = getAuthTypeFromHeader({
        'x-auth-type': 'X',
      });
      expect(result).toBe('digid');
    }
  });

  test('getPassthroughRequestHeaders', () => {
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

    const result = getPassthroughRequestHeaders(req);

    expect(result).toEqual({
      'x-auth-type': 'E',
      'x-saml-attribute-token1': 'xxx111xxxddd',
    });
  });

  describe('exitEarly', () => {
    const req = {
      path: '/none',
      url: 'http://localhost/none',
      headers: {
        From: 'webmaster@example.org',
        'x-something-hack': 'hax0r',
        'x-saml-attribute-token1': 'xxx111xxxddd',
      },
      cookies: {
        authType: 'E',
      },
    } as unknown as typeof express.request;

    const mockRes = {
      status: jest.fn(),
      end: jest.fn(),
    };

    const mockNext = jest.fn();
    const captureMessageSpy = jest.spyOn(Sentry, 'captureMessage');

    test('Exits', () => {
      exitEarly(req, mockRes as unknown as typeof express.response, mockNext);

      expect(captureMessageSpy).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.end).toHaveBeenCalledWith('not found');
    });

    mockRes.status.mockReset();
    mockRes.end.mockReset();
    captureMessageSpy.mockReset();

    test('Passes', () => {
      req.path = '/test-api/bff/services/all';
      req.url = 'http://localhost/test-api/bff/services/all';

      exitEarly(req, mockRes as unknown as typeof express.response, mockNext);

      expect(captureMessageSpy).not.toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.end).not.toHaveBeenCalled();

      expect(mockNext).toHaveBeenCalled();
    });
  });

  test('sessionID', () => {
    const mockNext = jest.fn();

    const req = {} as any;
    const res = {
      locals: {},
    } as any;

    sessionID(req, res, mockNext);
    expect(res.locals.sessionID).toBeDefined();
    expect(typeof res.locals.sessionID).toBe('string');
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

  test('clearSession', () => {
    const sessionID = '11223300xx';
    const nextMock = jest.fn();
    cache.put(sessionID, { foo: 'bar' });

    expect(cache.get(sessionID)).toEqual({ foo: 'bar' });

    clearSession({} as any, { locals: { sessionID } } as any, nextMock);

    expect(cache.get(sessionID)).toBe(null);
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

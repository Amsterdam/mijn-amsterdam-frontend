import { NextFunction, Request, Response } from 'express';
import { apiErrorResult } from '../../universal/helpers/api';
import { cache } from '../helpers/source-api-request';
import { send404, sendUnauthorized } from './route-helpers';
import {
  clearRequestCache,
  isAuthenticated,
  requestID,
} from './route-handlers';

describe('routing.route-handlers', () => {
  test('requestID', () => {
    const mockNext = vi.fn();

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
      status: vi.fn(),
      send: vi.fn(),
    };

    send404(mockRes as any);

    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.send).toHaveBeenCalledWith(
      apiErrorResult('Not Found', null)
    );
  });

  test('sendUnauthorized', () => {
    const mockRes = {
      status: vi.fn(),
      send: vi.fn(),
    };

    sendUnauthorized(mockRes as any);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.send).toHaveBeenCalledWith(
      apiErrorResult('Unauthorized', null)
    );
  });

  test('clearRequestCache', () => {
    const requestID = '11223300xx';
    cache.put(requestID, { foo: 'bar' });

    expect(cache.get(requestID)).toEqual({ foo: 'bar' });

    clearRequestCache({} as any, { locals: { requestID } } as any);

    expect(cache.get(requestID)).toBe(null);
    expect(cache.keys()).toEqual([]);
  });

  test('clearRequestCache.unknown.key', () => {
    const requestID = '11223300xx';
    const nextMock = vi.fn();
    cache.put(requestID, { foo: 'bar' });

    expect(cache.get(requestID)).toEqual({ foo: 'bar' });

    clearRequestCache(
      {} as any,
      { locals: { requestID: 'some_other_key' } } as any
    );

    expect(cache.get(requestID)).toEqual({ foo: 'bar' });
    expect(cache.keys()).toEqual([requestID]);
  });

  test('isAuthenticated.false', async () => {
    const req = {
      cookies: {
        blap: 'test',
      },
    } as unknown as Request;

    const res = {
      send: vi.fn().mockImplementation((responseContent: any) => {
        return responseContent;
      }),
      status: vi.fn(),
    } as unknown as Response;

    expect(
      await isAuthenticated(req, res, vi.fn() as unknown as NextFunction)
    ).toStrictEqual({
      content: null,
      message: 'Unauthorized',
      status: 'ERROR',
    });

    expect(res.status).toHaveBeenCalledWith(401);
  });
});

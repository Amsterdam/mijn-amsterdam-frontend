import { RequestMock, ResponseMock } from '../../test-utils';
import { OIDC_SESSION_COOKIE_NAME } from '../auth/auth-config';
import * as authHelpers from '../auth/auth-helpers';
import { AuthProfileAndToken } from '../auth/auth-types';
import { cache } from '../helpers/source-api-request';
import { addToBlackList } from '../services/session-blacklist';
import {
  clearRequestCache,
  isAuthenticated,
  isBlacklistedHandler,
  requestID,
} from './route-handlers';

describe('routing.route-handlers', () => {
  let resMock = ResponseMock.new();
  const nextMock = vi.fn();

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('clearRequestCache', () => {
    test('Clears cache for corresponding request', () => {
      const requestID = '11223300xx';
      cache.put(requestID, { foo: 'bar' });

      expect(cache.get(requestID)).toEqual({ foo: 'bar' });

      const resMock = ResponseMock.new();
      resMock.locals.requestID = requestID;

      clearRequestCache(RequestMock.new().get(), resMock);

      expect(cache.get(requestID)).toBe(null);
      expect(cache.keys()).toEqual([]);
    });

    test('Does not clear cache for other requests', () => {
      const requestID = '11223300xx';

      cache.put(requestID, { foo: 'bar' });

      expect(cache.get(requestID)).toEqual({ foo: 'bar' });

      const resMock = ResponseMock.new();
      resMock.locals.requestID = 'some_other_key';

      clearRequestCache(RequestMock.new().get(), resMock);

      expect(cache.get(requestID)).toEqual({ foo: 'bar' });
      expect(cache.keys()).toEqual([requestID]);
    });
  });

  test('verifyAuthenticated', async () => {});

  describe('apiKeyVerificationHandler', async () => {
    test('Correct key', () => {});
    test('Bad key', () => {});
  });

  test('nocache', async () => {});

  describe('isAuthenticated', () => {
    test('Is authenticated', async () => {
      vi.spyOn(authHelpers, 'getAuth');

      const reqMock = RequestMock.new()
        .setCookies({
          [OIDC_SESSION_COOKIE_NAME]: 'test',
        })
        .get();

      await isAuthenticated(reqMock, resMock, nextMock);

      expect(nextMock).toHaveBeenCalled();
    });

    test('Not authenticated (wrong cookie name)', async () => {
      const reqMock = RequestMock.new()
        .setCookies({
          blap: 'test',
        })
        .get();

      await isAuthenticated(reqMock, resMock, nextMock);

      expect(resMock.send).toHaveBeenCalledWith({
        code: 401,
        content: null,
        message: 'Unauthorized',
        status: 'ERROR',
      });

      expect(resMock.status).toHaveBeenCalledWith(401);
    });

    test('isAuthenticated: Not authenticated (no auth data)', async () => {
      const reqMock = RequestMock.new()
        .setCookies({
          [OIDC_SESSION_COOKIE_NAME]: 'test',
        })
        .get();

      await isAuthenticated(reqMock, resMock, nextMock);

      expect(resMock.send).toHaveBeenCalledWith({
        code: 401,
        content: null,
        message: 'Unauthorized',
        status: 'ERROR',
      });

      expect(resMock.status).toHaveBeenCalledWith(401);
    });
  });

  test('requestID: Assignment of requestID', () => {
    const mockNext = vi.fn();
    const resMock = ResponseMock.new();
    const reqMock = RequestMock.new().get();

    requestID(reqMock, resMock, mockNext);
    expect(resMock.locals.requestID).toBeDefined();
    expect(typeof resMock.locals.requestID).toBe('string');
    expect(mockNext).toHaveBeenCalled();
  });

  test('isBlacklistedHandler: Add to blacklist', async () => {
    const sessionID = 'test-session-id';
    const nextMock = vi.fn();
    const resMock = ResponseMock.new();
    const reqMock = RequestMock.new().get();

    vi.spyOn(authHelpers, 'getAuth').mockResolvedValueOnce({
      profile: {
        sid: sessionID,
      },
    } as AuthProfileAndToken);

    await isBlacklistedHandler(reqMock, resMock, nextMock);

    expect(nextMock).toHaveBeenCalledTimes(1);

    await addToBlackList(sessionID);
    await isBlacklistedHandler(reqMock, resMock, nextMock);

    expect(resMock.send).toHaveBeenCalled();
    expect(resMock.status).toHaveBeenCalledWith(401);
  });
});

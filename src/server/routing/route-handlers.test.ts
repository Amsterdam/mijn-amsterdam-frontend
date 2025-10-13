import { handleIsAuthenticated, requestID } from './route-handlers';
import {
  getAuthProfileAndToken,
  getReqMockWithOidc,
  RequestMock,
  ResponseMock,
} from '../../testing/utils';
import { OIDC_SESSION_COOKIE_NAME } from '../auth/auth-config';

describe('routing.route-handlers', () => {
  const resMock = ResponseMock.new();
  const nextMock = vi.fn();

  afterEach(() => {
    vi.resetAllMocks();
  });

  test('verifyAuthenticated', async () => {});

  describe('apiKeyVerificationHandler', async () => {
    test('Correct key', () => {});
    test('Bad key', () => {});
  });

  test('nocache', async () => {});

  describe('isAuthenticated', () => {
    test('Is authenticated', async () => {
      const reqMock = await getReqMockWithOidc(
        getAuthProfileAndToken().profile
      );
      (reqMock as any).setCookies({
        [OIDC_SESSION_COOKIE_NAME]: 'test',
      });

      await handleIsAuthenticated(reqMock, resMock, nextMock);

      expect(nextMock).toHaveBeenCalled();
    });

    test('Not authenticated (wrong cookie name)', async () => {
      const reqMock = RequestMock.new()
        .setCookies({
          blap: 'test',
        })
        .get();

      await handleIsAuthenticated(reqMock, resMock, nextMock);

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

      await handleIsAuthenticated(reqMock, resMock, nextMock);

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
});

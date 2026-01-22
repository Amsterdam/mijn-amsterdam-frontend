import jwt from 'jsonwebtoken';
import nock from 'nock';

import {
  handleIsAuthenticated,
  OAuthVerificationHandler,
  requestID,
} from './route-handlers';
import { HttpStatusCode } from '../../client/hooks/api/useBffApi';
import {
  getAuthProfileAndToken,
  getReqMockWithOidc,
  RequestMock,
  ResponseMock,
} from '../../testing/utils';
import { OIDC_SESSION_COOKIE_NAME } from '../auth/auth-config';

// Dummy private key only used for testing - can not be smaller
// To generate: openssl genrsa -out private.pem 2048
const dummyPrivateKey = `
-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDyHYGIAxyz/mbp
57crK6R543u+bCm3D8xPT/CEJHJtpI7T+SmbHn37SbQH8Q6Ac9sZS8vytpqWVPrI
3h4bdIsaexfzbDdrBphRhP7do/hTYV8G/0bdVM+NPaX+tSBQIAKzBZqtxMzzCPDU
KqpHPtpGB+PAhjfU5iqTj7HwwSBlsjFZcjDVQfR6cytKmsIn8kkL/NjOAc1DEhgl
JPz2pdw23WLJTpKPm/zVXzPacXbzWmzWx5kCqy6aBxS60YYDIgAgESUTg7uE22sV
3VQSgG79ocDD2V7Flf6BY/28uhHCaUWKK9C45OhhET+ykJc7KCegMGo/hK5FEVEV
Krz+TJ61AgMBAAECggEAEs+DjZFuVLaugLxJwR8kKXso1U/agthFn6DelymswUOA
fEwWtTBOiew9QkOyhHzb2DCJISuaQZVLIbmOHcR1fUJ0hytQd+58fZLnaUlwxOuj
AixpsU8CTB8uyyX/43HFO+ryzE7mvHgkm9tPvPbPZxL8WSwkYNRcGPhYUxPyJCxo
EViiHfZ6DI1EWwPSJK0OUJFMvsGDl3Eg1dxDok1/wa2PGcJf3SMgiuFVgO3p5RQv
MsDUQSx5Dq/wlzFRPw0ntQ1EXIWGwKoRW+4rB4dNgvpG+PJwp8+K8KB8fKthAsyH
zlF2BYZjMfLInn1CAZDFNmeBI3pm7wbICAW4EF7g8QKBgQD/9JjH5ssN8wt9qDZ1
nhuKbvRfLmviEr6kFnyYIufMMUFMskZMw9lsQiXgSjDVn0IkfeA5p6PgbMVcawEs
D3H52Ug2UZe3fAXINepGv5JwfJ7jG61NuLFjz96XsO8Mhhve47h4AEe7baZ0uI33
mFKC9YDNdUJ8IjcNXxNpJtvp5QKBgQDyKErmgc9tBQHYlQv9x25k7/wt2j8PQKFE
0nu5AC5UPU0ckoPPhIri1Bz2llpOPtYKbwyz/CGNF0Xndx90EKb/0Wnf/8gHSv78
/A2ZvSYtWTCFLrtAYvIEB1X0xpsCT35g43LjufA10gvtt5ZgZV57/wC7n6JEkP/k
7FC2/yZUkQKBgQChaS2j+r6YqGnZr2fQmomBrmD7WTn9kpaYwfmGs5R8J5+nb1F3
/ZYyeDCMlhzfypQakSsDEN3+nHmFw5E0qPTWfBjW8HN96X9399ArF4qQ13YXgI+0
0MFFUYRtIs5NlpEi6XaebobOAuMS/oPA3VVDcvDsIINx5t3S199U04WhpQKBgQCv
OCKCSjmJ/A6K5cZIek7R8Kh7kSkB41UN1HO7uHrNb5Hlc8q2lIRefvb6Im7zoRoF
cLczYOPyEH3/bz2uIQKFpsTCVXUqecSpz8QTkz8Vnyyxoc/SVgYijiBPPooZEOY0
Oz/9saQzfWouNyIzXAYTGMAyAt9KV9UhkzEQSO02UQKBgGQ9lQXMWlzr4Z9q4d6j
JNXV99hEO7/b2TmZeT3FXHI+WuSVSvrIH1TmLBrAAwyz74kpXzk16dVgWQPGa0f5
/bsImhyoFAStKXnjnJoO/ElrUq57vLAD1tYvge0D41WgQgprfSU965CB0rquJl0A
lAPKRoEPqQMWs8QgzHSDhxu7
-----END PRIVATE KEY-----
`;
// These values can be generated from privateKey:
// openssl rsa -in private.pem -pubout -out public.pem
// node -p "require('crypto').createPublicKey(require('fs').readFileSync('public.pem')).export({format:'jwk'})"
const DEFAULT_KEY_ID = 'test_key_id';
const oauthKeysResponse = {
  keys: [
    {
      kid: DEFAULT_KEY_ID,
      kty: 'RSA',
      n: '8h2BiAMcs_5m6ee3KyukeeN7vmwptw_MT0_whCRybaSO0_kpmx59-0m0B_EOgHPbGUvL8raallT6yN4eG3SLGnsX82w3awaYUYT-3aP4U2FfBv9G3VTPjT2l_rUgUCACswWarcTM8wjw1CqqRz7aRgfjwIY31OYqk4-x8MEgZbIxWXIw1UH0enMrSprCJ_JJC_zYzgHNQxIYJST89qXcNt1iyU6Sj5v81V8z2nF281ps1seZAqsumgcUutGGAyIAIBElE4O7hNtrFd1UEoBu_aHAw9lexZX-gWP9vLoRwmlFiivQuOToYRE_spCXOygnoDBqP4SuRRFRFSq8_kyetQ',
      e: 'AQAB',
    },
  ],
};

describe('routing.route-handlers', () => {
  const resMock = ResponseMock.new();

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('OAuthVerificationHandler', async () => {
    const defaultToken = {
      algorithm: 'RS256',
      keyid: DEFAULT_KEY_ID,
      issuer: 'https://sts.windows.net/test_tenant/',
      audience: 'test_audience',
    } as const;
    const defaultRole = 'User';
    const defaultTokenSigned = jwt.sign(
      { roles: [defaultRole] },
      dummyPrivateKey,
      defaultToken
    );
    beforeAll(() => {
      vi.stubEnv('BFF_OAUTH_KEY_ID', defaultToken.keyid);
      vi.stubEnv('BFF_OAUTH_TENANT', 'test_tenant');
      vi.stubEnv('BFF_OAUTH_MIJNADAM_CLIENT_ID', defaultToken.audience);
    });
    beforeEach(() => {
      nock('https://sts.windows.net')
        .get('/test_tenant/discovery/keys')
        .times(1)
        .reply(200, oauthKeysResponse);
    });
    afterAll(() => {
      vi.unstubAllEnvs();
    });
    test('Correct token', async () => {
      const nextMock = vi.fn();
      const resMock = ResponseMock.new();
      const reqMock = RequestMock.new().get();

      reqMock.headers = {
        ...reqMock.headers,
        authorization: `Bearer ${defaultTokenSigned}`,
      };

      await OAuthVerificationHandler(defaultRole)(reqMock, resMock, nextMock);
      expect(nextMock).toHaveBeenCalled();
    });
    test.each([
      ['audience', 'invalid'],
      ['issuer', 'invalid'],
      ['algorithm', 'PS512'],
    ])(
      'Non matching %s returns unauthorized Token ongeldig of verlopen',
      async (propKey, propVal) => {
        const nextMock = vi.fn();
        const resMock = ResponseMock.new();
        const reqMock = RequestMock.new().get();

        const token = jwt.sign({ roles: [defaultRole] }, dummyPrivateKey, {
          ...defaultToken,
          [propKey]: propVal,
        });

        reqMock.headers = {
          ...reqMock.headers,
          authorization: `Bearer ${token}`,
        };

        await OAuthVerificationHandler(defaultRole)(reqMock, resMock, nextMock);
        expect(resMock.send).toHaveBeenCalledWith({
          code: HttpStatusCode.Unauthorized,
          content: null,
          message: expect.stringContaining('Unauthorized'),
          status: 'ERROR',
        });
      }
    );
    test('Non matching role returns unauthorized', async () => {
      const nextMock = vi.fn();
      const resMock = ResponseMock.new();
      const reqMock = RequestMock.new().get();

      reqMock.headers = {
        ...reqMock.headers,
        authorization: `Bearer ${defaultTokenSigned}`,
      };

      await OAuthVerificationHandler('fake-role')(reqMock, resMock, nextMock);
      expect(resMock.send).toHaveBeenCalledWith({
        code: 401,
        content: null,
        message: expect.stringContaining('Unauthorized'),
        status: 'ERROR',
      });
    });

    test('No token returns unauthorized', async () => {
      const nextMock = vi.fn();
      const resMock = ResponseMock.new();
      const reqMock = RequestMock.new().get();
      await OAuthVerificationHandler(defaultRole)(reqMock, resMock, nextMock);
      expect(resMock.send).toHaveBeenCalledWith({
        code: 401,
        content: null,
        message: expect.stringContaining('Missing Authorization header'),
        status: 'ERROR',
      });
    });

    test('Invalid authorization header returns unauthorized', async () => {
      const nextMock = vi.fn();
      const resMock = ResponseMock.new();
      const reqMock = RequestMock.new().get();
      reqMock.headers = {
        ...reqMock.headers,
        authorization: `ApiKey 123`,
      };
      await OAuthVerificationHandler(defaultRole)(reqMock, resMock, nextMock);
      expect(resMock.send).toHaveBeenCalledWith({
        code: 401,
        content: null,
        message: expect.stringContaining('Malformed Authorization header'),
        status: 'ERROR',
      });
    });
    test('Missing envs returns service unavailable', async () => {
      vi.stubEnv('BFF_OAUTH_TENANT', undefined);
      const nextMock = vi.fn();
      const resMock = ResponseMock.new();
      const reqMock = RequestMock.new().get();
      reqMock.headers = {
        ...reqMock.headers,
        authorization: `Bearer ${defaultTokenSigned}`,
      };
      await OAuthVerificationHandler(defaultRole)(reqMock, resMock, nextMock);
      expect(resMock.send).toHaveBeenCalledWith({
        code: 503,
        content: null,
        message: expect.stringContaining('Service Unavailable'),
        status: 'ERROR',
      });
    });
  });

  describe('isAuthenticated', () => {
    test('Is authenticated', async () => {
      const nextMock = vi.fn();
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
      const nextMock = vi.fn();
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
      const nextMock = vi.fn();
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

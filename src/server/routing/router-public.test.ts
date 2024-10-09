import { bffApiHost } from '../../setupTests';
import {
  getAuthProfileAndToken,
  RequestMock,
  ResponseMock,
} from '../../test-utils';
import * as authHelpers from '../auth/auth-helpers';

import { zaakStatusHandler } from './router-public';

describe('router-public', () => {
  describe('zaak status endpoint', () => {
    test('redirects to login if not authenticated', async () => {
      const authProfileAndToken = getAuthProfileAndToken();

      const reqMock = RequestMock.new().setUrl(
        `${bffApiHost}/api/v1/services/zaak-status?thema=vergunningen&id=Z%2F000%2F000001`
      );

      await reqMock.createOIDCStub(authProfileAndToken.profile);

      const resMock = ResponseMock.new();
      const nextMock = vi.fn();

      await zaakStatusHandler(reqMock, resMock, nextMock);

      expect(resMock.redirect).toHaveBeenCalledWith(
        'http://frontend-host/zaak-status?http%3A%2F%2Fbff-api-host%2Fapi%2Fv1%2Fservices%2Fzaak-status%3Fthema=vergunningen&id=Z%2F000%2F000001'
      );
    });

    test('redirects to login with digid if not authenticated', async () => {
      const reqMock = RequestMock.new().setUrl(
        `${bffApiHost}/api/v1/services/zaak-status?thema=vergunningen&id=Z%2F000%2F000001`
      );

      const resMock = ResponseMock.new();

      const nextMock = vi.fn();

      await zaakStatusHandler(reqMock, resMock, nextMock);

      expect(resMock.redirect).toHaveBeenCalledWith(
        '/api/v1/auth/digid/login?returnTo=%2Fzaak-status%3Fhttp%253A%252F%252Fbff-api-host%252Fapi%252Fv1%252Fservices%252Fzaak-status%253Fthema%3Dvergunningen%26id%3DZ%252F000%252F000001'
      );
    });

    test('redirects to login with eherkenning if not authenticated', async () => {
      const reqMock = RequestMock.new().setUrl(
        `${bffApiHost}/api/v1/services/zaak-status?thema=vergunningen&id=Z%2F000%2F000001&auth-type=eherkenning`
      );

      const resMock = ResponseMock.new();

      const nextMock = vi.fn();

      await zaakStatusHandler(reqMock, resMock, nextMock);

      expect(resMock.redirect).toHaveBeenCalledWith(
        '/api/v1/auth/eherkenning/login?returnTo=%2Fzaak-status%3Fhttp%253A%252F%252Fbff-api-host%252Fapi%252Fv1%252Fservices%252Fzaak-status%253Fthema%3Dvergunningen%26id%3DZ%252F000%252F000001%26auth-type%3Deherkenning'
      );
    });

    test('calls next with error if an exception occurs', async () => {
      const reqMock = RequestMock.new().setUrl(
        `${bffApiHost}/api/v1/services/zaak-status?thema=vergunningen&id=Z%2F000%2F000001`
      );

      const resMock = ResponseMock.new();

      const nextMock = vi.fn();

      const getAuthSpy = vi
        .spyOn(authHelpers, 'getAuth')
        .mockImplementation(() => {
          throw new Error('Test error');
        });

      await zaakStatusHandler(reqMock, resMock, nextMock);

      expect(nextMock).toHaveBeenCalledWith(expect.any(Error));
      expect(nextMock.mock.calls[0][0].message).toBe('Test error');

      getAuthSpy.mockRestore();
    });
  });
});

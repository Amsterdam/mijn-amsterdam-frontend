import { bffApiHost } from '../../setupTests';
import {
  getAuthProfileAndToken,
  getReqMockWithOidc,
  RequestMock,
  ResponseMock,
} from '../../test-utils';

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

      expect(resMock.redirect).toHaveBeenCalledWith('/api/v1/auth/digid/login');
    });

    test('redirects to login with eherkenning if not authenticated', async () => {
      const reqMock = RequestMock.new().setUrl(
        `${bffApiHost}/api/v1/services/zaak-status?thema=vergunningen&id=Z%2F000%2F000001&auth-type=eherkenning`
      );

      const resMock = ResponseMock.new();

      const nextMock = vi.fn();

      await zaakStatusHandler(reqMock, resMock, nextMock);

      expect(resMock.redirect).toHaveBeenCalledWith(
        '/api/v1/auth/eherkenning/login'
      );
    });
  });
});

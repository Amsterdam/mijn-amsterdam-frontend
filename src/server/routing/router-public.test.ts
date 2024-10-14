import { bffApiHost } from '../../setupTests';
import { RequestMock, ResponseMock } from '../../test-utils';

import { zaakStatusHandler } from './router-public';

describe('router-public', () => {
  describe('zaak status endpoint', () => {
    test('redirects to login with digid if not authenticated', async () => {
      const reqMock = RequestMock.new()
        .setUrl(`${bffApiHost}/api/v1/services/zaak-status`)
        .setQuery({
          id: 'Z%2F000%2F000001',
          thema: 'vergunningen',
          'auth-type': 'digid',
        });

      const resMock = ResponseMock.new();

      const nextMock = vi.fn();

      await zaakStatusHandler(reqMock, resMock, nextMock);

      expect(resMock.redirect).toHaveBeenCalledWith(
        '/api/v1/auth/digid/login?returnTo=/zaak-status&id=Z%2F000%2F000001&thema=vergunningen'
      );
    });

    test('redirects to login with eherkenning if not authenticated', async () => {
      const reqMock = RequestMock.new()
        .setUrl(`${bffApiHost}/api/v1/services/zaak-status`)
        .setQuery({
          id: 'Z%2F000%2F000001',
          thema: 'vergunningen',
          'auth-type': 'eherkenning',
        });

      const resMock = ResponseMock.new();

      const nextMock = vi.fn();

      await zaakStatusHandler(reqMock, resMock, nextMock);

      expect(resMock.redirect).toHaveBeenCalledWith(
        '/api/v1/auth/eherkenning/login?returnTo=/zaak-status&id=Z%2F000%2F000001&thema=vergunningen'
      );
    });
  });
});

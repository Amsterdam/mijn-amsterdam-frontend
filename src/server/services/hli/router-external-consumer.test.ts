import { Request, Response } from 'express';
import { remoteApi } from '../../../test-utils';
import { forTesting } from './router-external-consumer';
import { generateDevSessionCookieValue } from '../../helpers/app.development';
import { OIDC_SESSION_COOKIE_NAME } from '../../config';

vi.mock('../../../server/helpers/encrypt-decrypt', async (requireActual) => {
  return {
    ...((await requireActual()) as object),
    encrypt: () => {
      return ['test-encrypted-id'];
    },
    decrypt: () => 'session-id:e6ed38c3-a44a-4c16-97c1-89d7ebfca095',
  };
});

describe('hli/router-external-consumer', async () => {
  const sendMock = vi.fn();
  const statusMock = vi.fn();
  const renderMock = vi.fn();

  const cookieValue = await generateDevSessionCookieValue(
    'digid',
    'digi1',
    'digi1-session-id'
  );

  const reqMock = {
    cookies: {
      [OIDC_SESSION_COOKIE_NAME]: cookieValue,
    },
  } as unknown as Request;

  const resMock = {
    locals: { requestID: 'xxx' },
    send: sendMock,
    status: statusMock,
    render: renderMock,
  } as unknown as Response;

  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('Administratienummer endpoint', () => {
    test('OK', async () => {
      remoteApi.post('/zorgned/persoonsgegevensNAW').reply(200, {
        persoon: {
          clientidentificatie: '123-123',
        },
      });

      await forTesting.sendAdministratienummerResponse(reqMock, resMock);

      expect(renderMock).toHaveBeenCalledWith(
        'amsapp-stadspas-administratienummer',
        {
          administratienummerEncrypted: 'test-encrypted-id',
          AMSAPP_PROTOCOl: 'amsterdam://',
        }
      );
    });

    test('NO Administratienummer', async () => {
      remoteApi.post('/zorgned/persoonsgegevensNAW').reply(404);

      await forTesting.sendAdministratienummerResponse(reqMock, resMock);

      expect(renderMock).toHaveBeenCalledWith(
        'amsapp-stadspas-administratienummer',
        {
          administratienummerEncrypted: undefined,
          AMSAPP_PROTOCOl: 'amsterdam://',
        }
      );
    });

    test('ERROR', async () => {
      remoteApi.post('/zorgned/persoonsgegevensNAW').reply(500);

      await forTesting.sendAdministratienummerResponse(reqMock, resMock);

      expect(renderMock).toHaveBeenCalledWith(
        'amsapp-stadspas-administratienummer',
        {
          error: 'Request failed with status code 500',
          AMSAPP_PROTOCOl: 'amsterdam://',
        }
      );
    });

    test('Unauthorized', async () => {
      await forTesting.sendAdministratienummerResponse(
        {
          cookies: {},
        } as unknown as Request,
        resMock
      );

      expect(statusMock).toHaveBeenCalledWith(401);
    });
  });
});

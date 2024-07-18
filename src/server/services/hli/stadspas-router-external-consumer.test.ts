import { Request, Response } from 'express';
import { remoteApi } from '../../../test-utils';
import { forTesting } from './stadspas-router-external-consumer';
import { generateDevSessionCookieValue } from '../../helpers/app.development';
import { OIDC_SESSION_COOKIE_NAME } from '../../config';
import UID from 'uid-safe';

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
  const redirectMock = vi.fn();

  async function getReqMock(useCookie: boolean = true) {
    const cookieValue = useCookie
      ? await generateDevSessionCookieValue('digid', 'digi1', UID.sync(10))
      : undefined;
    const reqMock = {
      cookies: {
        [OIDC_SESSION_COOKIE_NAME]: cookieValue,
      },
      params: {
        token: 'x123z',
      },
    } as unknown as Request<{ token: string }>;

    return reqMock;
  }

  const resMock = {
    locals: {
      get requestID() {
        return UID.sync(10);
      },
    },
    send: sendMock,
    status: statusMock,
    render: renderMock,
    redirect: redirectMock,
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
      remoteApi.post('/amsapp/administratienummer').reply(200, 'ok');

      await forTesting.sendAdministratienummerResponse(
        await getReqMock(),
        resMock
      );

      expect(redirectMock).toHaveBeenCalledWith('amsterdam://stadspas');
    });

    test('Delivery failed', async () => {
      remoteApi.post('/zorgned/persoonsgegevensNAW').reply(200, {
        persoon: {
          clientidentificatie: '123-123',
        },
      });

      await forTesting.sendAdministratienummerResponse(
        await getReqMock(),
        resMock
      );

      expect(redirectMock).toHaveBeenCalledWith(
        'amsterdam://stadspas?errorCode=004&errorMessage=Verzenden van administratienummer naar de Amsterdam app niet gelukt'
      );

      // expect(renderMock).toHaveBeenCalledWith(
      //   'amsapp-stadspas-administratienummer',
      //   {
      //     error: {
      //       code: '004',
      //       message:
      //         'Verzenden van administratienummer naar de Amsterdam app niet gelukt',
      //     },
      //     appHref:
      //       'amsterdam://stadspas?errorMessage=Verzenden van administratienummer naar de Amsterdam app niet gelukt&errorCode=004',
      //   }
      // );
    });

    test('NO Digid login', async () => {
      await forTesting.sendAdministratienummerResponse(
        await getReqMock(false),
        resMock
      );

      expect(sendMock).toHaveBeenCalledWith({
        status: 'ERROR',
        message: 'Unauthorized',
        content: null,
      });
    });

    test('NO Administratienummer', async () => {
      remoteApi.post('/zorgned/persoonsgegevensNAW').reply(404);

      await forTesting.sendAdministratienummerResponse(
        await getReqMock(),
        resMock
      );

      expect(redirectMock).toHaveBeenCalledWith(
        'amsterdam://stadspas?errorCode=003&errorMessage=Geen administratienummer gevonden'
      );

      // expect(renderMock).toHaveBeenCalledWith(
      //   'amsapp-stadspas-administratienummer',
      //   {
      //     error: {
      //       code: '003',
      //       message: 'Geen administratienummer gevonden',
      //     },
      //     appHref:
      //       'amsterdam://stadspas?errorMessage=Geen administratienummer gevonden&errorCode=003',
      //   }
      // );
    });

    test('ERROR', async () => {
      remoteApi.post('/zorgned/persoonsgegevensNAW').reply(500);

      await forTesting.sendAdministratienummerResponse(
        await getReqMock(),
        resMock
      );

      expect(redirectMock).toHaveBeenCalledWith(
        'amsterdam://stadspas?errorCode=002&errorMessage=Kon het administratienummer niet ophalen'
      );

      // expect(renderMock).toHaveBeenCalledWith(
      //   'amsapp-stadspas-administratienummer',
      //   {
      //     error: {
      //       message: 'Kon het administratienummer niet ophalen',
      //       code: '002',
      //     },
      //     appHref:
      //       'amsterdam://stadspas?errorMessage=Kon het administratienummer niet ophalen&errorCode=002',
      //   }
      // );
    });

    test('Unauthorized', async () => {
      await forTesting.sendAdministratienummerResponse(
        {
          cookies: {},
        } as unknown as Request<{ token: string }>,
        resMock
      );

      expect(statusMock).toHaveBeenCalledWith(401);
    });
  });
});

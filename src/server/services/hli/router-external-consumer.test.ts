import { Request, Response } from 'express';
import { remoteApi } from '../../../test-utils';
import { forTesting } from './router-external-consumer';
import { generateDevSessionCookieValue } from '../../helpers/app.development';
import {
  OIDC_SESSION_COOKIE_NAME,
  STADSPASSEN_ENDPOINT_PARAMETER,
} from '../../config';
const ADMINISTRATIENUMMER = 'test-encrypted-id';
const DECRYPTED_ADMINISTRATIENUMMER =
  'session-id:e6ed38c3-a44a-4c16-97c1-89d7ebfca095';

vi.mock('../../../server/helpers/encrypt-decrypt', async (requireActual) => {
  return {
    ...((await requireActual()) as object),
    encrypt: () => {
      return [ADMINISTRATIENUMMER];
    },
    decrypt: () => {
      DECRYPTED_ADMINISTRATIENUMMER;
    },
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
          administratienummerEncrypted: ADMINISTRATIENUMMER,
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

  describe('Stadspassen endpoint', async () => {
    vi.mock('./stadspas-gpass-service.ts', async (requireActual) => {
      const mod: object = await requireActual();
      return {
        ...mod,
        fetchStadspassenByAdministratienummer: () => 'Success',
      };
    });

    const RESPONSES = {
      PASHOUDER: require('../../../../mocks/fixtures/gpass-pashouders.json'),
      STADSPAS: require('../../../../mocks/fixtures/gpass-stadspas.json'),
      TRANSACTIES: require('../../../../mocks/fixtures/gpass-transacties.json'),
    };

    const reqMock = {
      params: { [STADSPASSEN_ENDPOINT_PARAMETER]: 'ADMINISTRATIENUMMER' },
    } as unknown as Request<{ [STADSPASSEN_ENDPOINT_PARAMETER]: string }>;

    const resMock = {
      locals: { requestID: 'xxx' },
      send: sendMock,
      status: (_code: number) => {
        return {
          send: sendMock,
        };
      },
      render: renderMock,
    } as unknown as Response;

    it('Returns stadpassen when supplied with encrypted administratieNummer', async () => {
      await forTesting.sendStadspassenResponse(reqMock, resMock);
      expect(resMock.send).toHaveBeenCalledOnce();
      expect(resMock.send).toHaveBeenCalledWith('Success');
    });

    it('Returns an apiErrorResult when administratienummer is empty', async () => {
      reqMock.params[STADSPASSEN_ENDPOINT_PARAMETER] =
        undefined as unknown as string;

      await forTesting.sendStadspassenResponse(reqMock, resMock);
      expect(resMock.send).toHaveBeenCalledWith({
        content: null,
        message: `Bad request: Missing encrypted url parameter: '${STADSPASSEN_ENDPOINT_PARAMETER}'.`,
        status: 'ERROR',
      });
    });
  });
});

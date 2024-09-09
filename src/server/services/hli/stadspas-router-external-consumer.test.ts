import nock from 'nock';
import { remoteApi, RequestMock, ResponseMock } from '../../../test-utils';
import { apiSuccessResult } from '../../../universal/helpers/api';
import { OIDC_SESSION_COOKIE_NAME } from '../../auth/auth-config';
import { AuthProfile } from '../../auth/auth-types';
import * as stadspas from './stadspas';
import { forTesting } from './stadspas-router-external-consumer';
import { StadspasDiscountTransaction } from './stadspas-types';

vi.mock('../../../server/helpers/encrypt-decrypt', async (requireActual) => {
  return {
    ...((await requireActual()) as object),
    encrypt: () => {
      return ['test-encrypted-id'];
    },
    decrypt: () => 'session-id:e6ed38c3-a44a-4c16-97c1-89d7ebfca095',
  };
});

const TRANSACTIONS_KEY_ENCRYPTED = 'test-encrypted-id';

const USER_PROFILE: AuthProfile = {
  sid: 'e6ed38c3-a44a-4c16-97c1-89d7ebfca095',
  profileType: 'private',
  authMethod: 'digid',
  id: 'x1',
};

async function createAuthenticatedRequestMock<
  T extends Record<string, string> = Record<string, string>,
>(params: Record<string, string>) {
  const reqMock = RequestMock.new();
  if (params) {
    reqMock.setParams(params);
  }
  await reqMock.createOIDCStub(USER_PROFILE);
  const reqMockWithTokenParams = reqMock.get<T>();

  return reqMockWithTokenParams;
}

describe('hli/router-external-consumer', async () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('Administratienummer endpoint', async () => {
    const params = {
      token: 'x123z',
    };

    const reqMockWithTokenParams =
      await createAuthenticatedRequestMock<typeof params>(params);

    test('OK', async () => {
      remoteApi.post('/zorgned/persoonsgegevensNAW').reply(200, {
        persoon: {
          clientidentificatie: '123-123',
        },
      });
      remoteApi
        .post('/amsapp/session/credentials')
        .reply(200, { detail: 'Success' });

      const resMock = ResponseMock.new();

      await forTesting.sendAdministratienummerResponse(
        reqMockWithTokenParams,
        resMock
      );

      expect(resMock.render).toHaveBeenCalledWith(
        'amsapp-stadspas-administratienummer',
        {
          administratienummerEncrypted: 'test-encrypted-id',
          appHref: 'amsterdam://stadspas/gelukt',
          nonce: 'h70yjZuEZl',
        }
      );
    });

    test('Delivery failed', async () => {
      remoteApi.post('/zorgned/persoonsgegevensNAW').reply(200, {
        persoon: {
          clientidentificatie: '123-123',
        },
      });
      const reqMockWithTokenParams =
        await createAuthenticatedRequestMock<typeof params>(params);
      const resMock = ResponseMock.new();

      await forTesting.sendAdministratienummerResponse(
        reqMockWithTokenParams,
        resMock
      );

      expect(resMock.render).toHaveBeenCalledWith(
        'amsapp-stadspas-administratienummer',
        {
          error: {
            code: '004',
            message:
              'Verzenden van administratienummer naar de Amsterdam app niet gelukt',
          },
          appHref:
            'amsterdam://stadspas/mislukt?errorMessage=Verzenden%20van%20administratienummer%20naar%20de%20Amsterdam%20app%20niet%20gelukt&errorCode=004',
        }
      );
    });

    test('NO Digid login', async () => {
      const resMock = ResponseMock.new();
      const reqMock = RequestMock.new().get<typeof params>();

      await forTesting.sendAdministratienummerResponse(reqMock, resMock);

      expect(resMock.render).toHaveBeenCalledWith(
        'amsapp-stadspas-administratienummer',
        {
          error: { code: '001', message: 'Niet ingelogd met Digid' },
          appHref:
            'amsterdam://stadspas/mislukt?errorMessage=Niet%20ingelogd%20met%20Digid&errorCode=001',
        }
      );
    });

    test('NO Administratienummer', async () => {
      remoteApi.post('/zorgned/persoonsgegevensNAW').reply(404);
      const resMock = ResponseMock.new();

      await forTesting.sendAdministratienummerResponse(
        reqMockWithTokenParams,
        resMock
      );

      expect(resMock.render).toHaveBeenCalledWith(
        'amsapp-stadspas-administratienummer',
        {
          error: {
            code: '003',
            message: 'Geen administratienummer gevonden',
          },
          appHref:
            'amsterdam://stadspas/mislukt?errorMessage=Geen%20administratienummer%20gevonden&errorCode=003',
        }
      );
    });

    test('ERROR', async () => {
      remoteApi.post('/zorgned/persoonsgegevensNAW').reply(500);
      const resMock = ResponseMock.new();

      await forTesting.sendAdministratienummerResponse(
        reqMockWithTokenParams,
        resMock
      );

      expect(resMock.render).toHaveBeenCalledWith(
        'amsapp-stadspas-administratienummer',
        {
          error: {
            message: 'Kon het administratienummer niet ophalen',
            code: '002',
          },
          appHref:
            'amsterdam://stadspas/mislukt?errorMessage=Kon%20het%20administratienummer%20niet%20ophalen&errorCode=002',
        }
      );
    });

    test('Unauthorized', async () => {
      const resMock = ResponseMock.new();

      await forTesting.sendAdministratienummerResponse(
        RequestMock.new().get(),
        resMock
      );

      expect(resMock.render).toHaveBeenCalledWith(
        'amsapp-stadspas-administratienummer',
        {
          error: { code: '001', message: 'Niet ingelogd met Digid' },
          appHref:
            'amsterdam://stadspas/mislukt?errorMessage=Niet%20ingelogd%20met%20Digid&errorCode=001',
        }
      );
    });
  });

  describe('Stadspassen endpoint', async () => {
    vi.mock('./stadspas-gpass-service.ts', async (requireActual) => {
      const mod: object = await requireActual();
      return {
        ...mod,
        fetchStadspassenByAdministratienummer: () => {
          return {
            status: 'OK',
            content: {
              administratienummer: '123456789',
              stadspassen: [{ foo: 'bar' }],
            },
          };
        },
      };
    });

    const resMock = ResponseMock.new();

    test('Returns stadpassen when supplied with encrypted administratieNummer', async () => {
      const params = { administratienummerEncrypted: 'ADMINISTRATIENUMMER' };
      const reqMock = RequestMock.new().setParams(params).get<typeof params>();

      await forTesting.sendStadspassenResponse(reqMock, resMock);

      expect(resMock.send).toHaveBeenCalledOnce();
      expect(resMock.send).toHaveBeenCalledWith({
        status: 'OK',
        content: [
          {
            foo: 'bar',
            securityCode: null,
            transactionsKeyEncrypted: TRANSACTIONS_KEY_ENCRYPTED,
          },
        ],
      });
    });
  });

  describe('Budget transactions endpoint', async () => {
    test('Happy path without budgetcode filter', async () => {
      const resMock = ResponseMock.new();

      const fetchStadspasTransactionsSpy = vi
        .spyOn(stadspas, 'fetchStadspasBudgetTransactions')
        .mockResolvedValueOnce(apiSuccessResult([]));

      const params = { transactionsKeyEncrypted: TRANSACTIONS_KEY_ENCRYPTED };
      const reqMock = RequestMock.new().setParams(params).get<typeof params>();

      await forTesting.sendBudgetTransactionsResponse(reqMock, resMock);

      expect(fetchStadspasTransactionsSpy).toHaveBeenCalledOnce();
      expect(resMock.send).toHaveBeenCalledOnce();
    });

    test('Happy path with budgetcode filter.', async () => {
      const resMock = ResponseMock.new();

      const fetchStadspasTransactionsSpy = vi
        .spyOn(stadspas, 'fetchStadspasBudgetTransactions')
        .mockResolvedValueOnce(apiSuccessResult([]));

      const params = {
        transactionsKeyEncrypted: TRANSACTIONS_KEY_ENCRYPTED,
      };

      const reqMock = RequestMock.new()
        .setParams(params)
        .setQuery({
          budgetCode: 'GPAS05_19',
        })
        .get<typeof params>();

      await forTesting.sendBudgetTransactionsResponse(reqMock, resMock);

      expect(fetchStadspasTransactionsSpy).toHaveBeenCalledOnce();
      expect(resMock.send).toHaveBeenCalledOnce();
      expect(resMock.send).toHaveBeenCalledWith({ content: [], status: 'OK' });
    });
  });

  describe('Aanbieding transactions endpoint', async () => {
    function buildStadspasAanbiedingTransactionResponse(): StadspasDiscountTransaction[] {
      return [];
    }

    test('Happy path', async () => {
      const fetchStadspasDiscountTransactionsSpy = vi
        .spyOn(stadspas, 'fetchStadspasDiscountTransactions')
        .mockResolvedValueOnce(
          apiSuccessResult(buildStadspasAanbiedingTransactionResponse())
        );

      const params = {
        transactionsKeyEncrypted: TRANSACTIONS_KEY_ENCRYPTED,
      };

      const reqMock = RequestMock.new().setParams(params).get<typeof params>();
      const resMock = ResponseMock.new();

      await forTesting.sendDiscountTransactionsResponse(reqMock, resMock);

      expect(fetchStadspasDiscountTransactionsSpy).toHaveBeenCalledWith(
        resMock.locals.requestID,
        TRANSACTIONS_KEY_ENCRYPTED
      );

      expect(resMock.send).toHaveBeenCalledWith({ content: [], status: 'OK' });
    });
  });
});

import { forTesting } from './router-stadspas-external-consumer';
import { bffApiHost } from '../../testing/setup';
import { remoteApi, RequestMock, ResponseMock } from '../../testing/utils';
import { apiSuccessResult } from '../../universal/helpers/api';
import { AuthProfile } from '../auth/auth-types';
import * as stadspas from '../services/hli/stadspas';
import { StadspasDiscountTransaction } from '../services/hli/stadspas-types';

vi.mock('../helpers/encrypt-decrypt', async (requireActual) => {
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

  const redirectUrlGelukt = `${bffApiHost}/api/v1/auth/digid/logout?returnTo=amsapp-stadspas-landing&appHref=amsterdam%3A%2F%2Fstadspas%2Fgelukt`;
  const baseRedirectUrlMislukt = `${bffApiHost}/api/v1/auth/digid/logout?returnTo=amsapp-stadspas-landing&appHref=amsterdam%3A%2F%2Fstadspas%2Fmislukt%3FerrorMessage%3D`;

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

      expect(resMock.redirect).toHaveBeenCalledWith(redirectUrlGelukt);
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

      expect(resMock.redirect).toHaveBeenCalledWith(
        `${baseRedirectUrlMislukt}Verzenden%2520van%2520administratienummer%2520naar%2520de%2520Amsterdam%2520app%2520niet%2520gelukt%26errorCode%3D004`
      );
    });

    test('NO Digid login', async () => {
      const resMock = ResponseMock.new();
      const reqMock = RequestMock.new().get<typeof params>();

      await forTesting.sendAdministratienummerResponse(reqMock, resMock);

      expect(resMock.redirect).toHaveBeenCalledWith(
        `${baseRedirectUrlMislukt}Niet%2520ingelogd%2520met%2520Digid%26errorCode%3D001`
      );
    });

    test('NO Administratienummer', async () => {
      remoteApi.post('/zorgned/persoonsgegevensNAW').reply(404);
      const resMock = ResponseMock.new();

      await forTesting.sendAdministratienummerResponse(
        reqMockWithTokenParams,
        resMock
      );

      expect(resMock.redirect).toHaveBeenCalledWith(
        `${baseRedirectUrlMislukt}Geen%2520administratienummer%2520gevonden%26errorCode%3D003`
      );
    });

    test('ERROR', async () => {
      remoteApi.post('/zorgned/persoonsgegevensNAW').reply(500);
      const resMock = ResponseMock.new();

      await forTesting.sendAdministratienummerResponse(
        reqMockWithTokenParams,
        resMock
      );

      expect(resMock.redirect).toHaveBeenCalledWith(
        `${baseRedirectUrlMislukt}Kon%2520het%2520administratienummer%2520niet%2520ophalen%26errorCode%3D002`
      );
    });

    test('Unauthorized', async () => {
      const resMock = ResponseMock.new();

      await forTesting.sendAdministratienummerResponse(
        RequestMock.new().get(),
        resMock
      );

      expect(resMock.redirect).toHaveBeenCalledWith(
        `${baseRedirectUrlMislukt}Niet%2520ingelogd%2520met%2520Digid%26errorCode%3D001`
      );
    });
  });

  describe('Stadspassen endpoint', async () => {
    vi.mock('../services/hli/stadspas-gpass-service', async (requireActual) => {
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
      const params = {
        administratienummerEncrypted: 'ADMINISTRATIENUMMER',
      };
      const reqMock = RequestMock.new().setParams(params).get<typeof params>();

      await forTesting.sendStadspassenResponse(reqMock, resMock);

      expect(resMock.send).toHaveBeenCalledOnce();
      expect(resMock.send).toHaveBeenCalledWith({
        status: 'OK',
        content: [
          {
            foo: 'bar',
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

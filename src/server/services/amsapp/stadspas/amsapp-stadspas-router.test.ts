import { HttpStatusCode } from 'axios';

import { forTesting } from './amsapp-stadspas-route-handlers';
import {
  remoteApi,
  RequestMock,
  ResponseMock,
} from '../../../../testing/utils';
import {
  apiErrorResult,
  apiSuccessResult,
} from '../../../../universal/helpers/api';
import { AuthProfile } from '../../../auth/auth-types';
import * as stadspas from '../../hli/stadspas';
import * as gpass from '../../hli/stadspas-gpass-service';
import type { Stadspas } from '../../hli/stadspas-types';

vi.mock('../../../helpers/encrypt-decrypt', async (requireActual) => {
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

      const renderSecondArg = resMock.render.mock.calls[0][1];

      expect(renderSecondArg.identifier).toStrictEqual('test-encrypted-id');
      expect(renderSecondArg.appHref).toStrictEqual(
        'amsterdam://stadspas/gelukt'
      );
      expect(renderSecondArg.nonce).not.toBeUndefined();
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

      const renderSecondArg = resMock.render.mock.calls[0][1];
      expect(renderSecondArg.error).toStrictEqual({
        code: '004',
        message:
          'Verzenden van administratienummer naar de Amsterdam app niet gelukt',
      });
      expect(renderSecondArg.appHref).toStrictEqual(
        'amsterdam://stadspas/mislukt?errorMessage=Verzenden%20van%20administratienummer%20naar%20de%20Amsterdam%20app%20niet%20gelukt&errorCode=004'
      );
    });

    test('NO Digid login', async () => {
      const resMock = ResponseMock.new();
      const reqMock = RequestMock.new().get<typeof params>();

      await forTesting.sendAdministratienummerResponse(reqMock, resMock);

      const renderSecondArg = resMock.render.mock.calls[0][1];
      expect(renderSecondArg.error).toStrictEqual({
        code: '001',
        message: 'Niet ingelogd met Digid',
      });
      expect(renderSecondArg.appHref).toStrictEqual(
        'amsterdam://stadspas/mislukt?errorMessage=Niet%20ingelogd%20met%20Digid&errorCode=001'
      );
    });

    test('NO Administratienummer', async () => {
      remoteApi.post('/zorgned/persoonsgegevensNAW').reply(404);
      const resMock = ResponseMock.new();

      await forTesting.sendAdministratienummerResponse(
        reqMockWithTokenParams,
        resMock
      );

      const renderSecondArg = resMock.render.mock.calls[0][1];
      expect(renderSecondArg.error).toStrictEqual({
        code: '003',
        message: 'Geen administratienummer gevonden',
      });
      expect(renderSecondArg.appHref).toStrictEqual(
        'amsterdam://stadspas/mislukt?errorMessage=Geen%20administratienummer%20gevonden&errorCode=003'
      );
    });

    test('ERROR', async () => {
      remoteApi.post('/zorgned/persoonsgegevensNAW').reply(500);
      const resMock = ResponseMock.new();

      await forTesting.sendAdministratienummerResponse(
        reqMockWithTokenParams,
        resMock
      );

      const renderSecondArg = resMock.render.mock.calls[0][1];
      expect(renderSecondArg.error).toStrictEqual({
        code: '002',
        message: 'Kon het administratienummer niet ophalen',
      });
      expect(renderSecondArg.appHref).toStrictEqual(
        'amsterdam://stadspas/mislukt?errorMessage=Kon%20het%20administratienummer%20niet%20ophalen&errorCode=002'
      );
    });

    test('Unauthorized', async () => {
      const resMock = ResponseMock.new();

      await forTesting.sendAdministratienummerResponse(
        RequestMock.new().get(),
        resMock
      );

      const renderSecondArg = resMock.render.mock.calls[0][1];
      expect(renderSecondArg.error).toStrictEqual({
        code: '001',
        message: 'Niet ingelogd met Digid',
      });
      expect(renderSecondArg.appHref).toStrictEqual(
        'amsterdam://stadspas/mislukt?errorMessage=Niet%20ingelogd%20met%20Digid&errorCode=001'
      );
    });
  });

  describe('Stadspassen endpoint', async () => {
    test('Returns error when fetching administratieNummer fails', async () => {
      vi.spyOn(
        gpass,
        'fetchStadspassenByAdministratienummer'
      ).mockResolvedValueOnce(
        apiErrorResult('oops', null, HttpStatusCode.ImATeapot)
      );

      const resMock = ResponseMock.new();

      const params = {
        administratienummerEncrypted: 'ADMINISTRATIENUMMER',
      };
      const reqMock = RequestMock.new().setParams(params).get<typeof params>();

      await forTesting.sendStadspassenResponse(reqMock, resMock);

      expect(resMock.send).toHaveBeenCalledOnce();
      expect(resMock.send).toHaveBeenCalledWith({
        status: 'ERROR',
        content: null,
        message: 'oops',
        code: 418,
      });
      expect(resMock.status).toHaveBeenCalledWith(HttpStatusCode.ImATeapot);
    });

    test('Returns stadpassen when supplied with encrypted administratieNummer', async () => {
      const resMock = ResponseMock.new();

      vi.spyOn(
        gpass,
        'fetchStadspassenByAdministratienummer'
      ).mockResolvedValueOnce({
        status: 'OK',
        content: {
          administratienummer: '123456789',
          stadspassen: [{ foo: 'bar' } as unknown as Stadspas],
        },
      });

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
    test('Happy path', async () => {
      const fetchStadspasDiscountTransactionsSpy = vi
        .spyOn(stadspas, 'fetchStadspasDiscountTransactions')
        .mockResolvedValueOnce(apiSuccessResult([]));

      const params = {
        transactionsKeyEncrypted: TRANSACTIONS_KEY_ENCRYPTED,
      };

      const reqMock = RequestMock.new().setParams(params).get<typeof params>();
      const resMock = ResponseMock.new();

      await forTesting.sendDiscountTransactionsResponse(reqMock, resMock);

      expect(fetchStadspasDiscountTransactionsSpy).toHaveBeenCalledWith(
        TRANSACTIONS_KEY_ENCRYPTED
      );

      expect(resMock.send).toHaveBeenCalledWith({ content: [], status: 'OK' });
    });
  });

  describe('sendStadspasBlockRequest', async () => {
    const TRANSACTIONS_KEY_ENCRYPTED = 'test-encrypted-id';

    test('Passes response from sendStadspasBlockRequest through as is.', async () => {
      const params = {
        transactionsKeyEncrypted: TRANSACTIONS_KEY_ENCRYPTED,
      };
      const reqMock = RequestMock.new().setParams(params).get<typeof params>();
      const resMock = ResponseMock.new();

      vi.spyOn(stadspas, 'blockStadspas').mockResolvedValueOnce(
        apiSuccessResult({ passNumber: 123123, actief: false })
      );

      await forTesting.sendStadspasBlockRequest(reqMock, resMock);

      expect(resMock.send).toHaveBeenCalledWith({
        status: 'OK',
        content: { passNumber: 123123, actief: false },
      });
    });
  });
});

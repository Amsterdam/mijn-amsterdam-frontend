import Mockdate from 'mockdate';

import {
  blockStadspas,
  fetchStadspasBudgetTransactions,
  unblockStadspas,
  fetchStadspas,
  fetchStadspasDiscountTransactions,
} from './stadspas';
import type {
  StadspasHouderPasSource,
  StadspasHouderSource,
  StadspasPasHouderResponse,
  StadspasDiscountTransactions,
  StadspasDiscountTransactionsResponseSource,
} from './stadspas-types';
import { getAuthProfileAndToken, remoteApi } from '../../../testing/utils';
import { AuthProfileAndToken } from '../../auth/auth-types';
import * as encryptDecrypt from '../../helpers/encrypt-decrypt';

const FAKE_API_KEY = '22222xx22222';

const authProfileAndToken: AuthProfileAndToken = getAuthProfileAndToken();

/** Create a stadspas with optionally overwriting it's default properties. */
export function createPas(
  props?: Partial<StadspasHouderPasSource>
): StadspasHouderPasSource {
  return {
    actief: true,
    securitycode: '012345',
    heeft_budget: true,
    budgetten: [
      {
        code: 'AMSTEG_10-14',
        naam: 'Kindtegoed 10-14',
        omschrijving: 'Kindtegoed',
        expiry_date: '2080-08-31T21:59:59.000Z',

        // NOTE: these properties are not available in the pashouders response, only in the pas details response.
        budget_assigned: 150,
        budget_balance: 0,
      },
    ],
    vervangen: false,
    categorie: 'Amsterdamse Digitale Stadspas',
    categorie_code: 'A',
    expiry_date: '2080-08-31T23:59:59.000Z',
    id: 999999,
    pasnummer: 777777777777,
    pasnummer_volledig: '6666666666666666666',
    passoort: { id: 11, naam: 'Digitale Stadspas' },
    ...props,
  };
}

export function setupStadspashouderRequests(response: {
  passen?: StadspasHouderPasSource[];
  sub_pashouders?: StadspasHouderSource[];
}): void {
  vi.spyOn(encryptDecrypt, 'encrypt').mockReturnValue([
    '1x2x3x-##########-4x5x6x',
    Buffer.from('xx'),
    Buffer.from('yy'),
  ]);

  vi.spyOn(encryptDecrypt, 'decrypt').mockReturnValue('123-unencrypted-456');

  remoteApi.post('/zorgned/persoonsgegevensNAW').reply(200, {
    persoon: {
      clientidentificatie: '123-123',
    },
  });
  const pasHouderResponse: StadspasPasHouderResponse = {
    initialen: 'A',
    achternaam: 'Achternaam',
    voornaam: 'Vadertje',
    passen: response.passen || [],
    sub_pashouders: response.sub_pashouders || [],
  };

  remoteApi
    .get('/stadspas/rest/sales/v1/pashouder?addsubs=true')
    .reply(200, pasHouderResponse);
}

export function setupPassenRequests(
  passen: Partial<StadspasHouderPasSource>[]
): void {
  for (const pas of passen) {
    remoteApi
      .get(`/stadspas/rest/sales/v1/pas/${pas.pasnummer}?include_balance=true`)
      .reply(200, pas);
  }
}

describe('stadspas services', () => {
  beforeEach(() => {
    Mockdate.set('2025-01-01');
  });

  afterEach(() => {
    Mockdate.reset();
    vi.restoreAllMocks();
    vi.resetAllMocks();
  });

  describe('Stadspas service', () => {
    test('fail administratienummer endpoint', async () => {
      remoteApi.post('/zorgned/persoonsgegevensNAW').reply(500);

      const response = await fetchStadspas(authProfileAndToken);

      expect(response).toStrictEqual({
        code: 500,
        content: null,
        message: 'Request failed with status code 500',
        status: 'ERROR',
      });
    });

    test('fail user unknown', async () => {
      remoteApi.post('/zorgned/persoonsgegevensNAW').reply(200, {
        persoon: {
          clientidentificatie: '123-123',
        },
      });
      remoteApi
        .get('/stadspas/rest/sales/v1/pashouder?addsubs=true')
        .reply(401);

      const response = await fetchStadspas(authProfileAndToken);

      expect(response).toStrictEqual({
        content: {
          stadspassen: [],
          dateExpiryFormatted: '31 juli 2025',
        },
        status: 'OK',
      });
    });

    test('Transforms pas correctly', async () => {
      const relevantPas = createPas({
        actief: true,
        pasnummer: 111111111111,
        expiry_date: '2025-07-31',
      });
      setupStadspashouderRequests({ passen: [relevantPas] });
      setupPassenRequests([relevantPas]);

      const response = await fetchStadspas(authProfileAndToken);

      expect(response.content?.stadspassen[0]).toStrictEqual({
        actief: true,
        balance: 0,
        balanceFormatted: '€0,00',
        blockPassURL:
          'http://bff-api-host/api/v1/services/stadspas/block/1x2x3x-##########-4x5x6x',
        budgets: [
          {
            budgetAssigned: 150,
            budgetAssignedFormatted: '€150,00',
            budgetBalance: 0,
            budgetBalanceFormatted: '€0,00',
            code: 'AMSTEG_10-14',
            dateEnd: '2080-08-31T21:59:59.000Z',
            dateEndFormatted: '31 augustus 2080',
            description: 'Kindtegoed',
            title: 'Kindtegoed 10-14',
          },
        ],
        dateEnd: '2025-07-31',
        dateEndFormatted: '31 juli 2025',
        id: '999999',
        link: {
          title: 'Stadspas van Vadertje',
          to: '/regelingen-bij-laag-inkomen/stadspas/111111111111',
        },
        owner: {
          firstname: 'Vadertje',
          infix: undefined,
          initials: 'A',
          lastname: 'Achternaam',
        },
        passNumber: 111111111111,
        passNumberComplete: '6666666666666666666',
        securityCode: '012345',
        transactionsKeyEncrypted: '1x2x3x-##########-4x5x6x',
        unblockPassURL:
          'http://bff-api-host/api/v1/services/stadspas/unblock/1x2x3x-##########-4x5x6x',
        urlTransactions:
          'http://bff-api-host/api/v1/services/stadspas/transactions/1x2x3x-##########-4x5x6x',
      });
    });

    test('failed pas request - only returns 1 pass', async () => {
      const passen = [
        createPas({
          pasnummer: 1,
          expiry_date: '2025-07-31',
        }),
        createPas({
          pasnummer: 2,
          expiry_date: '2025-07-31',
        }),
      ];

      // Only mock the request for the first pass, the second request fails.
      setupStadspashouderRequests({
        passen,
      });
      setupPassenRequests(passen.slice(0, 1));

      const response = await fetchStadspas(authProfileAndToken);

      expect(
        response.content?.stadspassen.map((pas) => pas.passNumber)
      ).toStrictEqual([1]);
    });

    test('Ignores expired and future passes of pashouder and sub_pashouder passes', async () => {
      const pashouderPassen = [
        // Expired in previous pas year.
        createPas({
          pasnummer: 1,
          expiry_date: '2024-02-31',
        }),
        // Expired last day of previous pas year.
        createPas({
          pasnummer: 2,
          expiry_date: '2024-07-31',
        }),
        // Valid - 1st day of validity of the current pas year and blocked.
        createPas({
          pasnummer: 3,
          actief: false,
          expiry_date: '2024-08-01',
        }),
        // Valid - blocked in current pas year.
        createPas({
          pasnummer: 4,
          expiry_date: '2024-10-10',
        }),
        // Future - valid, but belongs to next pas year.
        createPas({
          pasnummer: 5,
          expiry_date: '2026-07-31',
        }),
        // Expired - replaced by a new pass.
        createPas({
          pasnummer: 6,
          expiry_date: '2025-07-31',
          vervangen: true,
          actief: false,
        }),
      ];

      const subpashouderPassen = pashouderPassen.map((p) => {
        return {
          ...p,
          pasnummer: p.pasnummer + 10, // Ensure unique pasnummers for sub_pashouders.
        };
      });

      // All passes are returned initially, but only the valid and blocked passes should be returned after filtering.
      setupStadspashouderRequests({
        passen: pashouderPassen,
        sub_pashouders: [
          {
            initialen: 'B',
            achternaam: 'Achternaam',
            voornaam: 'Kind',
            passen: subpashouderPassen,
          },
        ],
      });

      const expectedPasnummers = [3, 4, 13, 14];

      setupPassenRequests(
        [...pashouderPassen, ...subpashouderPassen].filter((p) =>
          expectedPasnummers.includes(p.pasnummer)
        )
      );

      const response = await fetchStadspas(authProfileAndToken);

      expect(
        response.content?.stadspassen.map((pas) => pas.passNumber)
      ).toStrictEqual(expectedPasnummers);
    });
  });

  describe('Fetching transactions', () => {
    test('stadspas transacties Happy!', async () => {
      remoteApi
        .get(
          '/stadspas/rest/transacties/v1/budget?pasnummer=123123123&sub_transactions=true&date_from=2024-06-30&date_until=2025-01-01'
        )
        .matchHeader(
          'authorization',
          `AppBearer ${FAKE_API_KEY},0363000123-123`
        )
        .reply(200, {
          transacties: [
            {
              id: 'transactie-id',
              budget: {
                aanbieder: { naam: 'transactie naam' },
                naam: 'budgetje',
                code: '001',
              },
              bedrag: 34.5,
              transactiedatum: '2024-04-25',
            },
          ],
        });

      const [transactionsKeyEncrypted] = encryptDecrypt.encrypt(
        `my-unique-session-id:0363000123-123:123123123`
      );

      const response = await fetchStadspasBudgetTransactions(
        transactionsKeyEncrypted,
        undefined,
        'my-unique-session-id'
      );

      expect(response).toStrictEqual({
        content: [
          {
            amount: 34.5,
            amountFormatted: '+ €34,50',
            budget: 'budgetje',
            budgetCode: '001',
            datePublished: '2024-04-25',
            datePublishedFormatted: '25 april 2024',
            id: 'transactie-id',
            title: 'transactie naam',
          },
        ],
        status: 'OK',
      });
    });

    test('stadspas transacties unmatched session id', async () => {
      const [transactionsKeyEncrypted] = encryptDecrypt.encrypt(
        `another-session-id:0363000123-123:123123123`
      );

      const response = await fetchStadspasBudgetTransactions(
        transactionsKeyEncrypted,
        undefined,
        'foo-bar'
      );

      expect(response).toStrictEqual({
        code: 401,
        content: null,
        message: 'Not authorized',
        status: 'ERROR',
      });
    });

    test('stadspas transacties bad encrypted key', async () => {
      const response = await fetchStadspasBudgetTransactions(
        'FOO.BAR.XYZ',
        undefined,
        'foo-bar'
      );

      expect(response).toStrictEqual({
        code: 400,
        content: null,
        message: 'Bad request: Failed to decrypt transactions key',
        status: 'ERROR',
      });
    });
  });

  describe('Fetching Discount Transactions', async () => {
    test('stadspas transacties Happy!', async () => {
      const apiResponse: StadspasDiscountTransactionsResponseSource = {
        number_of_items: 0,
        transacties: [],
      };

      const expectedResponse: StadspasDiscountTransactions = {
        discountAmountTotal: 0,
        discountAmountTotalFormatted: '€0,00',
        transactions: [],
      };

      remoteApi
        .get(
          `/stadspas/rest/transacties/v1/aanbiedingen?pasnummer=123123123&sub_transactions=true`
        )
        .matchHeader(
          'authorization',
          `AppBearer ${FAKE_API_KEY},0363000123-123`
        )
        .reply(200, apiResponse);

      const [transactionsKeyEncrypted] = encryptDecrypt.encrypt(
        `0363000123-123:123123123`
      );

      const response = await fetchStadspasDiscountTransactions(
        transactionsKeyEncrypted
      );

      expect(response).toStrictEqual({
        content: expectedResponse,
        status: 'OK',
      });
    });
  });

  describe('Block/Unblock stadspas', async () => {
    test('Block', async () => {
      remoteApi
        .get('/stadspas/rest/sales/v1/pas/123123123?include_balance=true')
        .reply(200, {
          id: 'stadspas-id-1',
          passNumber: 123123123,
          passNumberComplete: 'volledig.123123123',
          actief: true,
        });

      remoteApi.post('/stadspas/rest/sales/v1/togglepas/123123123').reply(200, {
        actief: false,
      });

      const [transactionsKeyEncrypted] = encryptDecrypt.encrypt(
        `verify-session-id:0363000123-123:123123123`
      );

      const response = await blockStadspas(
        transactionsKeyEncrypted,
        'verify-session-id'
      );

      expect(response).toStrictEqual({
        content: {
          '123123123': true,
        },
        status: 'OK',
      });
    });

    test('Unblock', async () => {
      remoteApi
        .get('/stadspas/rest/sales/v1/pas/123123123?include_balance=true')
        .reply(200, {
          id: 'stadspas-id-1',
          passNumber: 123123123,
          passNumberComplete: 'volledig.123123123',
          actief: false,
        });

      remoteApi.post('/stadspas/rest/sales/v1/togglepas/123123123').reply(200, {
        actief: true,
      });

      const [transactionsKeyEncrypted] = encryptDecrypt.encrypt(
        `verify-session-id:0363000123-123:123123123`
      );

      const response = await unblockStadspas(
        transactionsKeyEncrypted,
        'verify-session-id'
      );

      expect(response).toStrictEqual({
        content: {
          '123123123': false,
        },
        status: 'OK',
      });
    });
  });
});

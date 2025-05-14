import Mockdate from 'mockdate';
import { Mock } from 'vitest';

import { fetchAdministratienummer } from './hli-zorgned-service';
import { blockStadspas, fetchStadspasBudgetTransactions } from './stadspas';
import {
  fetchGpassDiscountTransactions,
  fetchStadspassen,
  mutateGpassBlockPass,
} from './stadspas-gpass-service';
import {
  Stadspas,
  StadspasDiscountTransactions,
  StadspasDiscountTransactionsResponseSource,
  StadspasHouderPasSource,
  StadspasHouderSource,
  StadspasOwner,
  StadspasPasHouderResponse,
} from './stadspas-types';
import { getAuthProfileAndToken, remoteApi } from '../../../testing/utils';
import { apiSuccessResult } from '../../../universal/helpers/api';
import { AuthProfileAndToken } from '../../auth/auth-types';
import * as encryptDecrypt from '../../helpers/encrypt-decrypt';

const FAKE_API_KEY = '22222xx22222';

const defaultPashouderResponse = createStadspasHouderResponse();
const defaultPasResponse = createPas();

const authProfileAndToken: AuthProfileAndToken = getAuthProfileAndToken();

vi.mock('./stadspas-gpass-service.ts', async (importOriginal) => ({
  ...(await importOriginal()),
  mutateGpassBlockPass: vi.fn(),
}));

function createStadspasHouderResponse(): StadspasPasHouderResponse {
  const stadspasHouderResponse = {
    initialen: 'A',
    achternaam: 'Achternaam',
    voornaam: 'Vadertje',
    passen: [
      createPas({ actief: false, pasnummer: 111111111111 }),
      createPas({
        actief: true,
        pasnummer: 222222222222,
        securitycode: '012345',
        vervangen: true,
      }),
    ],
    sub_pashouders: [
      {
        initialen: 'B',
        achternaam: 'Achternaam',
        voornaam: 'Moedertje',
        passen: [
          createPas({ actief: true, pasnummer: 333333333333 }),
          createPas({ actief: false, pasnummer: 444444444444 }),
        ],
      },
      {
        initialen: 'C',
        achternaam: 'Achternaam',
        voornaam: 'Kindje',
        passen: [
          createPas({ actief: true, pasnummer: 555555555555 }),
          createPas({ actief: false, pasnummer: 666666666666 }),
        ],
      },
    ],
  };
  return stadspasHouderResponse;
}

/** Create a stadspas with optionally overwriting it's default properties. */
function createPas(
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

/** Create a transformed stadspas with optionally overwriting it's default properties. */
function createTransformedPas(
  props: Partial<{
    topLevelProps: Partial<Stadspas>;
    owner: Partial<StadspasOwner>;
  }>
): Stadspas {
  const owner = {
    firstname: 'Paul',
    infix: undefined,
    initials: 'P',
    lastname: 'Achternaam',
    ...props.owner,
  };
  return {
    actief: true,
    balance: 0,
    balanceFormatted: '€0,00',
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
    dateEnd: '2080-08-31T23:59:59.000Z',
    dateEndFormatted: '31 augustus 2080',
    id: '999999',
    owner,
    passNumber: 777777777777,
    passNumberComplete: '6666666666666666666',
    securityCode: '012345',
    ...props.topLevelProps,
  };
}

function setupStadspashouderRequests(response: {
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
    .matchHeader('authorization', `AppBearer ${FAKE_API_KEY},0363000123-123`)
    .reply(200, pasHouderResponse);
  remoteApi
    .persist()
    .get(/\/stadspas\/rest\/sales\/v1\/pas\//)
    .matchHeader('authorization', `AppBearer ${FAKE_API_KEY},0363000123-123`)
    .reply(200, defaultPasResponse);
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

  test('stadspas-zorgned-service', async () => {
    remoteApi.post('/zorgned/persoonsgegevensNAW').reply(200, {
      persoon: {
        clientidentificatie: '123-123',
      },
    });

    const response = await fetchAdministratienummer(authProfileAndToken);

    expect(response).toStrictEqual({
      content: '0363000123-123',
      status: 'OK',
    });
  });

  describe('stadspas-gpass-service', () => {
    test('fail administratienummer endpoint', async () => {
      remoteApi.post('/zorgned/persoonsgegevensNAW').reply(500);

      const BSN = '123456789';
      const response = await fetchStadspassen(BSN);

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

      const BSN = '89898989';
      const response = await fetchStadspassen(BSN);

      expect(response).toStrictEqual({
        content: {
          administratienummer: null,
          stadspassen: [],
        },
        status: 'OK',
      });
    });

    test('fail only returns 1st pass', async () => {
      const encryptSpy = vi
        .spyOn(encryptDecrypt, 'encrypt')
        .mockReturnValueOnce([
          '1x2x3x-##########-4x5x6x',
          Buffer.from('xx'),
          Buffer.from('yy'),
        ]);

      const decryptSpy = vi
        .spyOn(encryptDecrypt, 'decrypt')
        .mockReturnValueOnce('123-unencrypted-456');

      remoteApi.post('/zorgned/persoonsgegevensNAW').reply(200, {
        persoon: {
          clientidentificatie: '123-123',
        },
      });
      remoteApi
        .get('/stadspas/rest/sales/v1/pashouder?addsubs=true')
        .reply(200, defaultPashouderResponse);
      // Only mocking 1 pas response
      remoteApi
        .get('/stadspas/rest/sales/v1/pas/333333333333?include_balance=true')
        .reply(200, defaultPasResponse);

      const BSN = '123456789';
      const response = await fetchStadspassen(BSN);

      const expectedResponse = {
        content: {
          administratienummer: '0363000123-123',
          stadspassen: [
            createTransformedPas({
              topLevelProps: {
                dateEnd: '2080-08-31T23:59:59.000Z',
                dateEndFormatted: '01 september 2080',
              },
              owner: { firstname: 'Moedertje', initials: 'B' },
            }),
          ],
        },
        status: 'OK',
      };

      expect(response).toStrictEqual(expectedResponse);

      encryptSpy.mockRestore();
      decryptSpy.mockRestore();
    });

    describe('filter inside of fetchStadspassen', async () => {
      const relevantPas = createPas({
        actief: true,
        pasnummer: 111111111111,
      });

      test('Transforms pas correctly', async () => {
        setupStadspashouderRequests({ passen: [relevantPas] });

        const BSN = '12121212';
        const response = await fetchStadspassen(BSN);
        expect(response.content?.stadspassen[0]).toStrictEqual({
          actief: true,
          balance: 0,
          balanceFormatted: '€0,00',
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
          dateEnd: '2080-08-31T23:59:59.000Z',
          dateEndFormatted: '01 september 2080',
          id: '999999',
          owner: {
            firstname: 'Vadertje',
            infix: undefined,
            initials: 'A',
            lastname: 'Achternaam',
          },
          passNumber: 777777777777,
          passNumberComplete: '6666666666666666666',
          securityCode: '012345',
        });
      });

      test('filters out replaced passes and returns pass correctly', async () => {
        Mockdate.set('2024-12-01');
        // current pas year range 2024-08-01 untill 2025-07-31

        const toFilterOutPasses = [
          createPas({
            actief: false,
            securitycode: '012345',
            vervangen: true,
          }),
          createPas({
            actief: false,
            securitycode: '012345',
            vervangen: false,
            expiry_date: '2024-07-31T21:59:59.000Z',
          }),
          createPas({
            actief: false,
            vervangen: false,
            expiry_date: '2024-06-31T21:59:59.000Z',
          }),
        ];

        const passen = [relevantPas, ...toFilterOutPasses];
        setupStadspashouderRequests({ passen });

        const BSN = '2323232323';
        const response = await fetchStadspassen(BSN);

        expect(response.content?.stadspassen.length).toBe(
          passen.length - toFilterOutPasses.length
        );
      });

      test('Subtracts a year when expiry date is in the last year', async () => {
        Mockdate.set('2025-01-01');
        setupStadspashouderRequests({
          passen: [
            createPas({
              actief: false,
              vervangen: false,
              expiry_date: '2024-07-31T21:59:59.000Z',
            }),
            createPas({
              actief: false,
              vervangen: false,
              expiry_date: '2024-06-31T21:59:59.000Z',
            }),
          ],
        });

        const BSN = '34343434';
        const response = await fetchStadspassen(BSN);
        expect(response.content?.stadspassen.length).toBe(0);
      });

      test('Keeps pas that has just been blocked a few days ago.', async () => {
        Mockdate.set('2025-02-27');

        setupStadspashouderRequests({
          passen: [
            createPas({
              actief: false,
              expiry_date: '2025-02-25T15:04:46.924Z',
              vervangen: false,
            }),
          ],
        });

        const BSN = '4545454545';
        const response = await fetchStadspassen(BSN);

        expect(response.content?.stadspassen.length).toBe(1);
      });

      test('Filters reaches subpashouders', async () => {
        const passesToFilterOut = [
          createPas({
            actief: false,
            pasnummer: 444444444444,
            securitycode: '012345',
            vervangen: false,
            expiry_date: '2024-07-31T21:59:59.000Z',
          }),
        ];
        const passen = [relevantPas, ...passesToFilterOut];
        const sub_pashouders = [
          {
            initialen: 'B',
            achternaam: 'Achternaam',
            voornaam: 'Moedertje',
            passen,
          },
        ];
        setupStadspashouderRequests({ sub_pashouders });

        const BSN = '5656565656';
        const response = await fetchStadspassen(BSN);
        expect(response.content?.stadspassen.length).toBe(
          passen.length - passesToFilterOut.length
        );
      });
    });
  });

  test('stadspas transacties Happy!', async () => {
    remoteApi
      .get(
        '/stadspas/rest/transacties/v1/budget?pasnummer=123123123&sub_transactions=true'
      )
      .matchHeader('authorization', `AppBearer ${FAKE_API_KEY},0363000123-123`)
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

  describe('fetchStadspasDiscountTransactions', async () => {
    const administratienummer = 'administratienummer123';
    const passNumber = 123456789;

    test('Get success response', async () => {
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
          `/stadspas/rest/transacties/v1/aanbiedingen?pasnummer=${passNumber}&sub_transactions=true`
        )
        .matchHeader(
          'authorization',
          `AppBearer ${FAKE_API_KEY},${administratienummer}`
        )
        .reply(200, apiResponse);

      const response = await fetchGpassDiscountTransactions(
        administratienummer,
        passNumber
      );

      expect(response).toStrictEqual({
        content: expectedResponse,
        status: 'OK',
      });
    });
  });

  describe('blockStadspas', async () => {
    test('Happy path', async () => {
      const [transactionsKeyEncrypted] = encryptDecrypt.encrypt(
        `another-session-id:0363000123-123:123123123`
      );
      (mutateGpassBlockPass as Mock).mockReturnValueOnce(
        apiSuccessResult({ '6012345678901': false })
      );
      const response = await blockStadspas(transactionsKeyEncrypted);
      expect(response).toStrictEqual({
        content: {
          '6012345678901': false,
        },
        status: 'OK',
      });
    });
  });
});

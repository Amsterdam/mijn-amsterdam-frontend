import { HttpStatusCode } from 'axios';
import Mockdate from 'mockdate';
import { describe, expect } from 'vitest';

import { blockStadspas } from './stadspas';
import { GPASS_API_TOKEN } from './stadspas-config-and-content';
import {
  fetchGpassDiscountTransactions,
  fetchStadspassenByAdministratienummer,
  forTesting,
  mutateGpassSetPasIsBlockedState,
} from './stadspas-gpass-service';
import type {
  StadspasAanbiedingSource,
  StadspasDetailBudgetSource,
  StadspasDetailSource,
  StadspasDiscountTransactionsResponseSource,
  StadspasHouderSource,
  StadspasTransactiesResponseSource,
} from './stadspas-types';
import {
  createPas,
  setupStadspashouderRequests,
  setupPassenRequests,
} from './stadspas.test';
import { remoteApi } from '../../../testing/utils';
import { ApiErrorResponse } from '../../../universal/helpers/api';

describe('stadspas-gpass-service', () => {
  afterEach(() => {
    Mockdate.reset();
    vi.restoreAllMocks();
    vi.resetAllMocks();
  });
  beforeEach(() => {
    Mockdate.set('2025-01-01');
  });
  describe('getHeaders', () => {
    test('should return correct headers', () => {
      const administratienummer = '12345';
      const headers = forTesting.getHeaders(administratienummer);
      expect(headers).toStrictEqual({
        Authorization: `AppBearer ${GPASS_API_TOKEN},${administratienummer}`,
        Accept: 'application/json',
      });
    });
  });

  describe('getOwner', () => {
    test('should transform pashouder to owner correctly', () => {
      const pashouder: StadspasHouderSource = {
        voornaam: 'John',
        achternaam: 'Doe',
        tussenvoegsel: 'van',
        initialen: 'J.D.',
        passen: [],
      };
      const owner = forTesting.getOwner(pashouder);
      expect(owner).toStrictEqual({
        firstname: 'John',
        lastname: 'Doe',
        infix: 'van',
        initials: 'J.D.',
      });
    });
  });

  describe('transformBudget', () => {
    test('should transform budget correctly', () => {
      const budget = {
        naam: 'Budget Name',
        omschrijving: 'Description',
        code: '123',
        budget_assigned: 1000,
        budget_balance: 500,
        expiry_date: '2023-12-31',
      };
      const transformedBudget = forTesting.transformBudget(budget);
      expect(transformedBudget).toStrictEqual({
        title: 'Budget Name',
        description: 'Description',
        code: '123',
        budgetAssigned: 1000,
        budgetAssignedFormatted: '€1.000,00',
        budgetBalance: 500,
        budgetBalanceFormatted: '€500,00',
        dateEnd: '2023-12-31',
        dateEndFormatted: '31 december 2023',
      });
    });

    test('should return input if not an object with naam property', () => {
      const budget = {
        foo: 'bar',
      } as unknown as StadspasDetailBudgetSource;
      const transformedBudget = forTesting.transformBudget(budget);
      expect(transformedBudget).toStrictEqual(budget);
    });
  });

  describe('transformStadspasResponse', () => {
    test('should transform stadspas response correctly', () => {
      const gpassStadspasResonseData: StadspasDetailSource = {
        id: 1,
        pasnummer: 12345,
        pasnummer_volledig: '12345-67890',
        expiry_date: '2023-12-31',
        budgetten: [
          {
            naam: 'Budget Name',
            omschrijving: 'Description',
            code: '123',
            budget_assigned: 1000,
            budget_balance: 500,
            expiry_date: '2023-12-31',
          },
        ],
        actief: false,
        balance_update_time: '',
        budgetten_actief: false,
        categorie: '',
        categorie_code: '',
        originele_pas: {
          categorie: '',
          categorie_code: '',
          id: 0,
          pasnummer: 0,
          pasnummer_volledig: '',
          passoort: {
            id: 0,
            naam: '',
          },
        },
        passoort: {
          id: 0,
          naam: '',
        },
        pashouder: {
          initialen: '',
          achternaam: '',
          tussenvoegsel: '',
          voornaam: '',
          passen: [],
          volledige_naam: '',
        },
      };
      const pashouder: StadspasHouderSource = {
        voornaam: 'John',
        achternaam: 'Doe',
        tussenvoegsel: 'van',
        initialen: 'J.D.',
        passen: [],
      };
      const transformedResponse = forTesting.transformStadspasResponse(
        gpassStadspasResonseData,
        pashouder,
        '0123456'
      );
      expect(transformedResponse).toStrictEqual({
        id: '1',
        actief: false,
        owner: {
          firstname: 'John',
          lastname: 'Doe',
          infix: 'van',
          initials: 'J.D.',
        },
        dateEnd: '2023-12-31',
        dateEndFormatted: '31 december 2023',
        budgets: [
          {
            title: 'Budget Name',
            description: 'Description',
            code: '123',
            budgetAssigned: 1000,
            budgetAssignedFormatted: '€1.000,00',
            budgetBalance: 500,
            budgetBalanceFormatted: '€500,00',
            dateEnd: '2023-12-31',
            dateEndFormatted: '31 december 2023',
          },
        ],
        balance: 500,
        balanceFormatted: '€500,00',
        passNumber: 12345,
        passNumberComplete: '12345-67890',
        securityCode: '0123456',
      });

      const transformedResponseNoSecurityCode =
        forTesting.transformStadspasResponse(
          gpassStadspasResonseData,
          pashouder
        );
      expect(transformedResponseNoSecurityCode.securityCode).toBeNull();
    });

    test('should return input if not an object with pasnummer property', () => {
      const gpassStadspasResonseData = {
        someOtherProperty: 'value',
      } as unknown as StadspasDetailSource;

      const pashouder: StadspasHouderSource = {
        voornaam: 'John',
        achternaam: 'Doe',
        tussenvoegsel: 'van',
        initialen: 'J.D.',
        passen: [],
      };

      const transformedResponse = forTesting.transformStadspasResponse(
        gpassStadspasResonseData,
        pashouder
      );
      expect(transformedResponse).toEqual(gpassStadspasResonseData);
    });
  });

  describe('transformGpassTransactionsResponse', () => {
    test('should transform transactions response correctly', () => {
      const responseSource: StadspasTransactiesResponseSource = {
        transacties: [
          {
            id: 1,
            budget: {
              aanbieder: {
                naam: 'Provider',
                id: 0,
              },
              naam: 'Budget Name',
              code: '123',
              id: 0,
            },
            bedrag: -100,
            transactiedatum: '2023-01-01',
            pashouder: {
              id: 0,
              hoofd_pashouder_id: 0,
            },
            pas: {
              id: 0,
              pasnummer: 0,
              pasnummer_volledig: '',
              originele_pas: {
                id: 0,
                pasnummer: 0,
                pasnummer_volledig: '',
              },
            },
          },
          {
            id: 1,
            budget: {
              aanbieder: {
                naam: 'Provider',
                id: 0,
              },
              naam: 'Budget Name',
              code: '123',
              id: 0,
            },
            bedrag: 100,
            transactiedatum: '2023-01-01',
            pashouder: {
              id: 0,
              hoofd_pashouder_id: 0,
            },
            pas: {
              id: 0,
              pasnummer: 0,
              pasnummer_volledig: '',
              originele_pas: {
                id: 0,
                pasnummer: 0,
                pasnummer_volledig: '',
              },
            },
          },
        ],
        number_of_items: 0,
        total_items: 0,
      };

      const transformedResponse =
        forTesting.transformGpassTransactionsResponse(responseSource);

      expect(transformedResponse).toStrictEqual([
        {
          id: '1',
          title: 'Provider',
          amount: -100,
          amountFormatted: '- €100,00',
          datePublished: '2023-01-01',
          datePublishedFormatted: '01 januari 2023',
          budget: 'Budget Name',
          budgetCode: '123',
        },
        {
          id: '1',
          title: 'Provider',
          amount: 100,
          amountFormatted: '+ €100,00',
          datePublished: '2023-01-01',
          datePublishedFormatted: '01 januari 2023',
          budget: 'Budget Name',
          budgetCode: '123',
        },
      ]);
    });

    test('should return default response data if we encounter unsable data', () => {
      const responseSource = {
        someOtherProperty: 'value',
      } as unknown as StadspasTransactiesResponseSource;
      const transformedResponse =
        forTesting.transformGpassTransactionsResponse(responseSource);
      expect(transformedResponse).toEqual([]);
    });
  });

  describe('transformGpassAanbiedingenResponse', () => {
    test('should transform aanbiedingen response correctly', () => {
      const responseSource: StadspasDiscountTransactionsResponseSource = {
        transacties: [
          {
            id: 1,
            aanbieding: {
              communicatienaam: 'Offer Name',
              kortingzin: 'Discount Title',
              omschrijving: 'Description',
              id: 0,
              aanbiedingnummer: 0,
              publicatienummer: 0,
              pijler: '',
              aanbieder: {
                id: 0,
              },
              afbeeldingen: [],
            },
            verleende_korting: -50,
            transactiedatum: '2023-01-01',
            annulering: false,
            geannuleerd: false,
            pashouder: {
              id: 0,
              hoofd_pashouder_id: 0,
            },
            leeftijd_pashouder: 0,
            pas: {
              id: 0,
              pasnummer: 0,
              pasnummer_volledig: '',
              originele_pas: {
                id: 0,
                pasnummer: 0,
                pasnummer_volledig: '',
              },
            },
          },
        ],
        totale_korting: -50,
        number_of_items: 0,
      };

      const transformedResponse =
        forTesting.transformGpassAanbiedingenResponse(responseSource);

      expect(transformedResponse).toStrictEqual({
        discountAmountTotal: -50,
        discountAmountTotalFormatted: '€50,00',
        transactions: [
          {
            id: '1',
            title: 'Offer Name',
            discountAmount: -50,
            discountAmountFormatted: '€50,00',
            datePublished: '2023-01-01',
            datePublishedFormatted: '01 januari 2023',
            discountTitle: 'Discount Title',
            description: 'Description',
          },
        ],
      });
    });
  });

  describe('transformTransactions', () => {
    test('should transform transactions correctly', () => {
      const transactions: StadspasAanbiedingSource[] = [
        {
          id: 1,
          aanbieding: {
            communicatienaam: 'Offer Name',
            kortingzin: 'Discount Title',
            omschrijving: 'Description',
            id: 0,
            aanbiedingnummer: 0,
            publicatienummer: 0,
            pijler: '',
            aanbieder: {
              id: 0,
            },
            afbeeldingen: [],
          },
          verleende_korting: -50,
          transactiedatum: '2023-01-01',
          annulering: false,
          geannuleerd: false,
          pashouder: {
            id: 0,
            hoofd_pashouder_id: 0,
          },
          leeftijd_pashouder: 0,
          pas: {
            id: 0,
            pasnummer: 0,
            pasnummer_volledig: '',
            originele_pas: {
              id: 0,
              pasnummer: 0,
              pasnummer_volledig: '',
            },
          },
        },
      ];
      const transformedTransactions =
        forTesting.transformTransactions(transactions);
      expect(transformedTransactions).toStrictEqual([
        {
          id: '1',
          title: 'Offer Name',
          discountAmount: -50,
          discountAmountFormatted: '€50,00',
          datePublished: '2023-01-01',
          datePublishedFormatted: '01 januari 2023',
          discountTitle: 'Discount Title',
          description: 'Description',
        },
      ]);
    });

    test('Missing data omits source properties which we subsitute with null', () => {
      const transactions = [
        {
          id: 1,
          aanbieding: {},
          verleende_korting: -50,
          transactiedatum: '2023-01-01',
        },
      ] as unknown as StadspasAanbiedingSource[];
      const transformedTransactions =
        forTesting.transformTransactions(transactions);
      expect(transformedTransactions).toStrictEqual([
        {
          datePublished: '2023-01-01',
          datePublishedFormatted: '01 januari 2023',
          description: null,
          discountAmount: -50,
          discountAmountFormatted: '€50,00',
          discountTitle: null,
          id: '1',
          title: null,
        },
      ]);
    });
  });

  describe('fetchStadspassenByAdministratienummer', () => {
    const administratienummer = '12345';

    const errorResponse = {
      status: 'ERROR',
      content: null,
      message: 'Request failed with status code 500',
      code: HttpStatusCode.InternalServerError,
    };

    test('User not found or has no passen/pashouders', async () => {
      remoteApi
        .get(`/stadspas/rest/sales/v1/pashouder?addsubs=true`)
        .reply(401);
      remoteApi
        .get(`/stadspas/rest/sales/v1/pashouder?addsubs=true`)
        .reply(200, { passen: [] });

      const result =
        await fetchStadspassenByAdministratienummer(administratienummer);

      expect(result).toStrictEqual({
        content: {
          administratienummer: null,
          stadspassen: [],
        },
        status: 'OK',
      });

      const result2 =
        await fetchStadspassenByAdministratienummer(administratienummer);

      expect(result2).toStrictEqual({
        content: {
          administratienummer: '12345',
          stadspassen: [],
        },
        status: 'OK',
      });
    });

    test('Internal server error is passed through', async () => {
      remoteApi
        .get(`/stadspas/rest/sales/v1/pashouder?addsubs=true`)
        .reply(500, errorResponse);

      const result =
        await fetchStadspassenByAdministratienummer(administratienummer);

      expect(result).toStrictEqual(errorResponse);
    });

    test('should return transformed stadspassen if stadspasHouderResponse status is OK', async () => {
      Mockdate.set('2025-01-01');

      const relevantPas = createPas({
        actief: true,
        pasnummer: 111111111111,
        expiry_date: '2025-07-31',
      });
      setupStadspashouderRequests({ passen: [relevantPas] });
      setupPassenRequests([relevantPas]);

      const response =
        await fetchStadspassenByAdministratienummer(administratienummer);

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
        dateEnd: '2025-07-31',
        dateEndFormatted: '31 juli 2025',
        id: '999999',
        owner: {
          firstname: 'Vadertje',
          infix: undefined,
          initials: 'A',
          lastname: 'Achternaam',
        },
        passNumber: 111111111111,
        passNumberComplete: '6666666666666666666',
        securityCode: '012345',
      });
    });
  });

  describe('fetchGpassDiscountTransactions', () => {
    const administratienummer = '12345';
    const pasnummer = 999999999;

    test('should return transformed discount transactions if response status is OK', async () => {
      const responseSource: StadspasDiscountTransactionsResponseSource = {
        transacties: [
          {
            id: 1,
            aanbieding: {
              communicatienaam: 'Offer Name',
              kortingzin: 'Discount Title',
              omschrijving: 'Description',
              id: 0,
              aanbiedingnummer: 0,
              publicatienummer: 0,
              pijler: '',
              aanbieder: {
                id: 0,
              },
              afbeeldingen: [],
            },
            verleende_korting: -50,
            transactiedatum: '2023-01-01',
            annulering: false,
            geannuleerd: false,
            pashouder: {
              id: 0,
              hoofd_pashouder_id: 0,
            },
            leeftijd_pashouder: 0,
            pas: {
              id: 0,
              pasnummer: 0,
              pasnummer_volledig: '',
              originele_pas: {
                id: 0,
                pasnummer: 0,
                pasnummer_volledig: '',
              },
            },
          },
        ],
        totale_korting: -50,
        number_of_items: 0,
      };

      remoteApi
        .get(
          `/stadspas/rest/transacties/v1/aanbiedingen?pasnummer=${pasnummer}&sub_transactions=true`
        )
        .reply(200, responseSource);

      const result = await fetchGpassDiscountTransactions(
        administratienummer,
        pasnummer
      );

      expect(result).toStrictEqual({
        status: 'OK',
        content: {
          discountAmountTotal: -50,
          discountAmountTotalFormatted: '€50,00',
          transactions: [
            {
              id: '1',
              title: 'Offer Name',
              discountAmount: -50,
              discountAmountFormatted: '€50,00',
              datePublished: '2023-01-01',
              datePublishedFormatted: '01 januari 2023',
              discountTitle: 'Discount Title',
              description: 'Description',
            },
          ],
        },
      });
    });

    test('should return default response if we encounter unusable data.', async () => {
      const responseSource = {
        someOtherProperty: 'value',
      } as unknown as StadspasDiscountTransactionsResponseSource;

      remoteApi
        .get(
          `/stadspas/rest/transacties/v1/aanbiedingen?pasnummer=${pasnummer}&sub_transactions=true`
        )
        .reply(200, responseSource);

      const result = await fetchGpassDiscountTransactions(
        administratienummer,
        pasnummer
      );

      expect(result).toStrictEqual({
        content: {
          discountAmountTotal: 0,
          discountAmountTotalFormatted: '€0,00',
          transactions: [],
        },
        status: 'OK',
      });
    });

    test('should return error response if request fails', async () => {
      remoteApi
        .get(
          `/stadspas/rest/transacties/v1/aanbiedingen?pasnummer=${pasnummer}&sub_transactions=true`
        )
        .reply(500);

      const errorResponse = {
        status: 'ERROR',
        content: null,
        message: 'Request failed with status code 500',
        code: HttpStatusCode.InternalServerError,
      };

      const result = await fetchGpassDiscountTransactions(
        administratienummer,
        pasnummer
      );

      expect(result).toStrictEqual(errorResponse);
    });
  });

  describe('blockStadspass', async () => {
    const transactionKeysEncrypted = '123';

    test('Uses decrypt and fetcher', async () => {
      const response = (await blockStadspas(
        // This cannot be decrypted so we expect an error response.
        transactionKeysEncrypted
      )) as ApiErrorResponse<null>;

      expect(response.message).toContain('Failed to decrypt');
    });

    test('Can only block and not toggle the stadspas', async () => {
      const PASSNUMBER = 123;
      const IS_BLOCKED = true;

      remoteApi
        .get(`/stadspas/rest/sales/v1/pas/${PASSNUMBER}?include_balance=true`)
        .reply(200, {
          pasnummer: PASSNUMBER,
          actief: true,
        });

      remoteApi
        .post(`/stadspas/rest/sales/v1/togglepas/${PASSNUMBER}`)
        .reply(200, {
          pasnummer: PASSNUMBER,
          actief: false,
        });

      remoteApi
        .get(`/stadspas/rest/sales/v1/pas/${PASSNUMBER}?include_balance=true`)
        .reply(200, {
          pasnummer: PASSNUMBER,
          actief: false,
        });

      const response = await mutateGpassSetPasIsBlockedState(
        PASSNUMBER,
        '123',
        IS_BLOCKED
      );

      expect(response).toStrictEqual({
        content: { isBlocked: true },
        status: 'OK',
      });

      // Returns without going through the toggle request again.
      const response2 = await mutateGpassSetPasIsBlockedState(
        PASSNUMBER,
        '123',
        IS_BLOCKED
      );

      expect(response2).toStrictEqual({
        content: { isBlocked: true },
        status: 'OK',
      });
    });

    test('Returns error status if invalid response from source API', async () => {
      const PASSNUMBER = 123;
      const IS_BLOCKED = true;

      remoteApi
        .get(`/stadspas/rest/sales/v1/pas/${PASSNUMBER}?include_balance=true`)
        .reply(200, { pasnummer: PASSNUMBER, actief: 'INVALID' });

      const response = await mutateGpassSetPasIsBlockedState(
        PASSNUMBER,
        '123456789',
        IS_BLOCKED
      );

      expect(response).toStrictEqual({
        code: 500,
        content: null,
        message:
          "Could not determine 'actief' state of pass because of an invalid response",
        status: 'ERROR',
      });
    });

    test('Unblocks the stadspas', async () => {
      const PASSNUMBER = 123;
      const IS_BLOCKED = false;

      remoteApi
        .get(`/stadspas/rest/sales/v1/pas/${PASSNUMBER}?include_balance=true`)
        .reply(200, {
          pasnummer: PASSNUMBER,
          actief: false,
        });

      remoteApi
        .post(`/stadspas/rest/sales/v1/togglepas/${PASSNUMBER}`)
        .reply(200, {
          pasnummer: PASSNUMBER,
          actief: true,
        });

      const response = await mutateGpassSetPasIsBlockedState(
        PASSNUMBER,
        '123',
        IS_BLOCKED
      );

      expect(response).toStrictEqual({
        content: { isBlocked: false },
        status: 'OK',
      });
    });
  });

  describe('filtering', () => {
    test('getDefaultExpiryDate', () => {
      expect(forTesting.getDefaultExpiryDate().toISOString()).toBe(
        '2025-07-31T00:00:00.000Z'
      );
      expect(forTesting.getDefaultExpiryDate(-5).toISOString()).toBe(
        '2020-07-31T00:00:00.000Z'
      );
      expect(forTesting.getDefaultExpiryDate(5).toISOString()).toBe(
        '2030-07-31T00:00:00.000Z'
      );
    });

    test('getThisYearsDefaultExpiryDate', () => {
      expect(forTesting.getThisYearsDefaultExpiryDate().toISOString()).toBe(
        '2025-07-31T00:00:00.000Z'
      );
    });

    test('getNextYearsDefaultExpiryDate', () => {
      expect(forTesting.getNextYearsDefaultExpiryDate().toISOString()).toBe(
        '2026-07-31T00:00:00.000Z'
      );
    });

    test('getPreviousYearsDefaultExpiryDate', () => {
      expect(forTesting.getPreviousYearsDefaultExpiryDate().toISOString()).toBe(
        '2024-07-31T00:00:00.000Z'
      );
    });

    test('getCurrentPasYearExpiryDate', () => {
      expect(forTesting.getCurrentPasYearExpiryDate().toISOString()).toBe(
        '2025-07-31T00:00:00.000Z'
      );
    });

    test.each([
      // In the current pasjaar.
      [true, '2025-07-31', true],
      [false, '2025-07-31', true],
      // Show future passes but not inactive future ones.
      [true, '2026-07-31', true],
      [false, '2026-07-31', false],
      // Blocked passes in the current pasjaar.
      [false, '2024-08-01', true],
      [false, '2025-01-01', true],
      [false, '2024-12-10', true],
      // Blocked somewhere in the last pasjaar.
      [false, '2024-01-01', false],
      // Expired last pasjaar.
      [true, '2024-07-31', false],
      [false, '2024-07-31', false],
      // Do not show passes with an invalid date.
      [true, 'invalid-date', false],
      [false, 'invalid-date', false],
    ])(
      'Shoud pass be visible if pas.actief = %s and epiry date %s ?',
      (isActief, expiryDate, isValid) => {
        Mockdate.set('2025-01-01');
        expect(forTesting.isVisiblePass(isActief, expiryDate)).toBe(isValid);
      }
    );

    test('Moving into the new pasyear', () => {
      Mockdate.set('2025-08-01');
      expect(forTesting.isVisiblePass(false, '2025-07-31')).toBe(false);
    });
  });
});

import { describe, expect, Mock } from 'vitest';

import { GPASS_API_TOKEN } from './stadspas-config-and-content';
import {
  fetchGpassDiscountTransactions,
  forTesting,
} from './stadspas-gpass-service';
import { fetchStadspassenByAdministratienummer } from './stadspas-gpass-service';
import {
  StadspasPasHouderResponse,
  StadspasAanbiedingSource,
  StadspasDetailBudgetSource,
  StadspasDetailSource,
  StadspasDiscountTransactionsResponseSource,
  StadspasHouderSource,
  StadspasTransactiesResponseSource,
} from './stadspas-types';
import { HTTP_STATUS_CODES } from '../../../universal/constants/errorCodes';
import { apiSuccessResult } from '../../../universal/helpers/api';
import { getApiConfig } from '../../helpers/source-api-helpers';
import { requestData } from '../../helpers/source-api-request';

describe('stadspas-gpass-service', () => {
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
        pashouder
      );
      expect(transformedResponse).toStrictEqual({
        id: '1',
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
      });
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
      ]);
    });

    test('should return input if not an array of transactions', () => {
      const responseSource = {
        someOtherProperty: 'value',
      } as unknown as StadspasTransactiesResponseSource;
      const transformedResponse =
        forTesting.transformGpassTransactionsResponse(responseSource);
      expect(transformedResponse).toEqual(responseSource);
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

    test('should return input if not an array of transactions', () => {
      const responseSource = {
        someOtherProperty: 'value',
      } as unknown as StadspasDiscountTransactionsResponseSource;
      const transformedResponse =
        forTesting.transformGpassAanbiedingenResponse(responseSource);
      expect(transformedResponse).toEqual(responseSource);
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
  vi.mock('../../helpers/source-api-request');
  vi.mock('../../helpers/source-api-helpers');

  describe('fetchStadspassenByAdministratienummer', () => {
    const requestID = 'test-request-id';
    const administratienummer = '12345';
    const dataRequestConfig = { url: 'http://example.com' };

    beforeEach(() => {
      vi.clearAllMocks();
      (getApiConfig as Mock).mockReturnValue(dataRequestConfig);
    });

    test('should return NO_PASHOUDER_CONTENT_RESPONSE if stadspasHouderResponse status is ERROR and code is UNAUTHORIZED', async () => {
      (requestData as Mock).mockResolvedValueOnce({
        status: 'ERROR',
        code: HTTP_STATUS_CODES.UNAUTHORIZED,
      });

      const result = await fetchStadspassenByAdministratienummer(
        requestID,
        administratienummer
      );

      expect(result).toStrictEqual(
        apiSuccessResult({
          stadspassen: [],
          administratienummer: null,
        })
      );
    });

    test('should return stadspasHouderResponse if status is ERROR and code is not UNAUTHORIZED', async () => {
      const errorResponse = {
        status: 'ERROR',
        code: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      };
      (requestData as Mock).mockResolvedValueOnce(errorResponse);

      const result = await fetchStadspassenByAdministratienummer(
        requestID,
        administratienummer
      );

      expect(result).toStrictEqual(errorResponse);
    });

    test('should return transformed stadspassen if stadspasHouderResponse status is OK', async () => {
      const pashouder: StadspasHouderSource = {
        voornaam: 'John',
        achternaam: 'Doe',
        tussenvoegsel: 'van',
        initialen: 'J.D.',
        passen: [
          {
            pasnummer: 999999999,
            actief: true,
          },
        ],
      };

      const stadspasHouderResponse: StadspasPasHouderResponse = {
        ...pashouder,
        sub_pashouders: [],
      };

      const stadspasDetail: StadspasDetailSource = {
        id: 1,
        pasnummer: 999999999,
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
      };

      (requestData as Mock)
        .mockResolvedValueOnce({
          status: 'OK',
          content: stadspasHouderResponse,
        })
        .mockResolvedValueOnce({
          status: 'OK',
          content: [
            forTesting.transformStadspasResponse(stadspasDetail, pashouder),
          ],
        });

      const result = await fetchStadspassenByAdministratienummer(
        requestID,
        administratienummer
      );

      expect(result).toStrictEqual(
        apiSuccessResult({
          stadspassen: [
            {
              id: '1',
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
              passNumber: 999999999,
              passNumberComplete: '12345-67890',
            },
          ],
          administratienummer: '12345',
        })
      );
    });
  });

  describe('fetchGpassDiscountTransactions', () => {
    const requestID = 'test-request-id';
    const administratienummer = '12345';
    const pasnummer = 999999999;
    const dataRequestConfig = { url: 'http://example.com' };

    beforeEach(() => {
      vi.clearAllMocks();
      (getApiConfig as Mock).mockReturnValue(dataRequestConfig);
    });

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

      (requestData as Mock).mockResolvedValueOnce({
        status: 'OK',
        content: forTesting.transformGpassAanbiedingenResponse(responseSource),
      });

      const result = await fetchGpassDiscountTransactions(
        requestID,
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

    test('should return input if not an array of transactions', async () => {
      const responseSource = {
        someOtherProperty: 'value',
      } as unknown as StadspasDiscountTransactionsResponseSource;

      (requestData as Mock).mockResolvedValueOnce({
        status: 'OK',
        content: responseSource,
      });

      const result = await fetchGpassDiscountTransactions(
        requestID,
        administratienummer,
        pasnummer
      );

      expect(result).toStrictEqual({
        status: 'OK',
        content: responseSource,
      });
    });

    test('should return error response if request fails', async () => {
      const errorResponse = {
        status: 'ERROR',
        code: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      };

      (requestData as Mock).mockResolvedValueOnce(errorResponse);

      const result = await fetchGpassDiscountTransactions(
        requestID,
        administratienummer,
        pasnummer
      );

      expect(result).toStrictEqual(errorResponse);
    });
  });
});

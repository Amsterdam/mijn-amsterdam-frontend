import Mockdate from 'mockdate';
import Decimal from 'decimal.js';

import { fetchAfisDocument } from './afis-documents';
import {
  fetchAfisFacturen,
  fetchAfisFacturenByState,
  fetchAfisFacturenOverview,
  forTesting,
} from './afis-facturen';
import {
  AfisFacturenParams,
  AfisFactuur,
  AfisFactuurPropertiesSource,
  AfisInvoicesPartialPaymentsSource,
  XmlNullable,
} from './afis-types';
import AFIS_AFGEHANDELDE_FACTUREN from './test-fixtures/afgehandelde-facturen.json';
import AFIS_OPENSTAAANDE_FACTUREN from './test-fixtures/openstaande-facturen.json';
import ARC_DOC from '../../../../mocks/fixtures/afis/arc-doc-id.json';
import DOCUMENT_DOWNLOAD_RESPONSE from '../../../../mocks/fixtures/afis/document.json';
import { getAuthProfileAndToken, remoteApi } from '../../../test-utils';

const mocks = vi.hoisted(() => {
  const MOCK_VALUE_ENCRYPTED = 'xx-encrypted-xx';
  const MOCK_VALUE_DECRYPTED = 'value-decrypted';

  return {
    MOCK_VALUE_ENCRYPTED,
    MOCK_VALUE_DECRYPTED,
  };
});

vi.mock('../../../server/helpers/encrypt-decrypt', async (importOriginal) => {
  const original: object = await importOriginal();
  return {
    ...original,
    encryptSessionIdWithRouteIdParam: vi
      .fn()
      .mockReturnValue(mocks.MOCK_VALUE_ENCRYPTED),
    decrypt: vi.fn().mockReturnValue(mocks.MOCK_VALUE_DECRYPTED),
  };
});

const REQUEST_ID = '456';
const SESSION_ID = '0987';
const FACTUUR_NUMMER = '12346789';
const GENERIC_ID = '12346789';

const ROUTES = {
  openstaandeFacturen: (uri: string) => {
    return decodeURI(uri).includes(
      `IsCleared eq false and (AccountingDocumentType eq 'DR'`
    );
  },
  afgehandeldeFacturen: (uri: string) => {
    return decodeURI(uri).includes('and IsCleared eq true');
  },
  overgedragenFacturen: (uri: string) => {
    return decodeURI(uri).includes(
      `and IsCleared eq true and DunningLevel eq '3'`
    );
  },
  documentDownload: (uri: string) => {
    return decodeURI(uri).includes('API_CV_ATTACHMENT_SRV');
  },
  documentID: (uri: string) => {
    return decodeURI(uri).includes('ZFI_CDS_TOA02');
  },
};

describe('afis-facturen', async () => {
  const authProfileAndToken = getAuthProfileAndToken('private');

  test('Openstaande factuur data is transformed and url is correctly formatted', async () => {
    remoteApi
      .get(ROUTES.openstaandeFacturen)
      .reply(200, AFIS_OPENSTAAANDE_FACTUREN);

    const openParams: AfisFacturenParams = {
      state: 'open',
      businessPartnerID: GENERIC_ID,
    };

    const deelbetalingenResponse: AfisInvoicesPartialPaymentsSource = {
      feed: {
        entry: [
          {
            content: {
              properties: {
                InvoiceReference: '1234567890',
                AmountInBalanceTransacCrcy: '00.00',
                NetPaymentAmount: '27.50',
              },
            },
          },
        ],
      },
    };

    remoteApi
      .get((uri) =>
        decodeURI(uri).includes(
          `IsCleared eq false and (AccountingDocumentType eq 'AB')`
        )
      )
      .reply(200, deelbetalingenResponse);

    const response = await fetchAfisFacturen(
      REQUEST_ID,
      authProfileAndToken.profile.sid,
      openParams
    );

    // All fields are listed here to test correct formatting.
    const openFactuur = response.content?.facturen[0];
    expect(openFactuur).toMatchInlineSnapshot(`
      {
        "afzender": "Bedrijf: Ok",
        "amountOwed": "370.50",
        "amountOwedFormatted": "€ 370,50",
        "datePublished": "2023-11-21T00:00:00",
        "datePublishedFormatted": "21 november 2023",
        "debtClearingDate": null,
        "debtClearingDateFormatted": null,
        "documentDownloadLink": "http://bff-api-host/api/v1/services/afis/facturen/document?id=xx-encrypted-xx",
        "factuurDocumentId": "1234567890",
        "factuurNummer": "1234567890",
        "id": "1234567890",
        "link": {
          "title": "Factuur 1234567890",
          "to": "http://bff-api-host/api/v1/services/afis/facturen/document?id=xx-encrypted-xx",
        },
        "paylink": "http://localhost:3100/mocks-server/afis/paylink",
        "paymentDueDate": "2023-12-21T00:00:00",
        "paymentDueDateFormatted": "21 december 2023",
        "status": "gedeeltelijke-betaling",
        "statusDescription": "Uw factuur is nog niet volledig betaald. Maak het resterend bedrag van € 370,50 euro over onder vermelding van de gegevens op uw factuur.",
      }
    `);

    const automatischeIncassoFactuur = response.content?.facturen[1];
    expect(automatischeIncassoFactuur?.status).toBe('openstaand');
    expect(automatischeIncassoFactuur?.paymentDueDate).toBe(
      '2023-12-12T00:00:00'
    );

    const inDispuutInvoice = response.content?.facturen[2];
    expect(inDispuutInvoice?.status).toBe('in-dispuut');

    const geldTerugInvoice = response.content?.facturen[3];
    expect(geldTerugInvoice?.status).toBe('geld-terug');
    expect(geldTerugInvoice?.statusDescription.includes('-')).toBe(false);

    const unknownStatusInvoice = response.content?.facturen[4];
    expect(unknownStatusInvoice?.status).toBe('onbekend');
  });

  test('Afgehandelde factuur data is transformed and url is correctly formatted', async () => {
    remoteApi
      .get(ROUTES.afgehandeldeFacturen)
      .reply(200, AFIS_AFGEHANDELDE_FACTUREN);

    const closedParams: AfisFacturenParams = {
      state: 'afgehandeld',
      businessPartnerID: GENERIC_ID,
      top: undefined,
    };

    const response = await fetchAfisFacturen(
      REQUEST_ID,
      authProfileAndToken.profile.sid,
      closedParams
    );

    const geannuleerdeInvoice = response.content?.facturen[0];
    expect(geannuleerdeInvoice).toMatchInlineSnapshot(`
      {
        "afzender": "Lisan al Gaib inc.",
        "amountOwed": "0.00",
        "amountOwedFormatted": "€ 0,00",
        "datePublished": null,
        "datePublishedFormatted": null,
        "debtClearingDate": null,
        "debtClearingDateFormatted": null,
        "documentDownloadLink": "http://bff-api-host/api/v1/services/afis/facturen/document?id=xx-encrypted-xx",
        "factuurDocumentId": "INV-2023-010",
        "factuurNummer": "INV-2023-010",
        "id": "INV-2023-010",
        "link": {
          "title": "Factuur INV-2023-010",
          "to": "http://bff-api-host/api/v1/services/afis/facturen/document?id=xx-encrypted-xx",
        },
        "paylink": null,
        "paymentDueDate": "2023-12-21T00:00:00",
        "paymentDueDateFormatted": "21 december 2023",
        "status": "geannuleerd",
        "statusDescription": "Geannuleerd",
      }
    `);

    const betaaldeInvoice = response.content?.facturen[1];
    expect(betaaldeInvoice?.status).toStrictEqual('geannuleerd');

    const unknownStatusInvoice = response.content?.facturen[2];
    expect(unknownStatusInvoice?.status).toStrictEqual('geannuleerd');
  });

  test('Download document error response from ARC_DOC endpoint', async () => {
    remoteApi
      .get(ROUTES.documentID)
      .reply(500, { message: 'Internal Server Error' });

    const response = await fetchAfisDocument(
      REQUEST_ID,
      getAuthProfileAndToken('private'),
      FACTUUR_NUMMER
    );

    expect(response).toMatchInlineSnapshot(`
      {
        "code": 500,
        "content": null,
        "message": "Request failed with status code 500",
        "status": "ERROR",
      }
    `);
  });

  test('Download document happy path', async () => {
    remoteApi.get(ROUTES.documentID).reply(200, ARC_DOC);
    remoteApi
      .post(ROUTES.documentDownload)
      .reply(200, DOCUMENT_DOWNLOAD_RESPONSE);

    const response = await fetchAfisDocument(
      REQUEST_ID,
      getAuthProfileAndToken('private'),
      FACTUUR_NUMMER
    );

    expect(response.status).toBe('OK');
    expect(response.content?.data.length).toBeGreaterThan(0);
    expect(response.content?.mimetype).toBe('application/pdf');
    expect(response.content?.filename).toStrictEqual('FACTUUR.PDF');
  });

  test('formatFactuurRequestURL formats URL correctly', () => {
    const url = forTesting.formatFactuurRequestURL('http://example.com', {
      state: 'open',
      businessPartnerID: GENERIC_ID,
    });
    expect(url).toContain('IsCleared eq false');
    expect(url).toContain(`Customer eq '${GENERIC_ID}'`);
  });

  test('getAccountingDocumentTypesFilter returns correct filter', () => {
    const filter = forTesting.getAccountingDocumentTypesFilter('open');
    expect(filter).toBe(
      " and (AccountingDocumentType eq 'DR' or AccountingDocumentType eq 'DG' or AccountingDocumentType eq 'DM' or AccountingDocumentType eq 'DE' or AccountingDocumentType eq 'DF' or AccountingDocumentType eq 'DV' or AccountingDocumentType eq 'DW')"
    );
  });

  test('transformDeelbetalingenResponse transforms response correctly', () => {
    const response: AfisInvoicesPartialPaymentsSource = {
      feed: {
        entry: [
          {
            content: {
              properties: {
                InvoiceReference: '123',
                AmountInBalanceTransacCrcy: '-100.10',
                NetPaymentAmount: '-50.20',
              },
            },
          },
          {
            content: {
              properties: {
                InvoiceReference: '123',
                AmountInBalanceTransacCrcy: '-75.40',
                NetPaymentAmount: '-15.90',
              },
            },
          },
          {
            content: {
              properties: {
                InvoiceReference: '321',
                AmountInBalanceTransacCrcy: '-100',
                NetPaymentAmount: '-100.49',
              },
            },
          },
        ],
      },
    };
    const result = forTesting.transformDeelbetalingenResponse(response);

    expect(['123', '321'].every((id) => id in result)).toBe(true);

    expect(result['123'].AmountInBalanceTransacCrcy.toFixed(2)).toEqual(
      '-175.50'
    );
    expect(result['123'].NetPaymentAmount.toFixed(2)).toEqual('-66.10');

    expect(result['321'].AmountInBalanceTransacCrcy.toFixed(2)).toEqual(
      '-100.00'
    );
    expect(result['321'].NetPaymentAmount.toFixed(2)).toEqual('-100.49');
  });

  test('replaceXmlNulls replaces XML nulls correctly', () => {
    const sourceInvoice: XmlNullable<AfisFactuurPropertiesSource> = {
      AccountingDocument: { '@null': true },
      DocumentReferenceID: '123',
      AccountingDocumentType: '',
      InvoiceReference: '',
      AmountInBalanceTransacCrcy: '',
      DunningBlockingReason: '',
      DunningLevel: 0,
      NetDueDate: '',
      NetPaymentAmount: '',
      Paylink: null,
      PostingDate: { '@null': true },
      ProfitCenterName: '',
      SEPAMandate: '',
    };

    const result = forTesting.replaceXmlNulls(sourceInvoice);
    expect(result).toMatchInlineSnapshot(`
      {
        "AccountingDocument": null,
        "AccountingDocumentType": "",
        "AmountInBalanceTransacCrcy": "",
        "DocumentReferenceID": "123",
        "DunningBlockingReason": "",
        "DunningLevel": 0,
        "InvoiceReference": "",
        "NetDueDate": "",
        "NetPaymentAmount": "",
        "Paylink": null,
        "PostingDate": null,
        "ProfitCenterName": "",
        "SEPAMandate": "",
      }
    `);
  });

  describe('Status + Status descriptions', () => {
    const openstaand: AfisFactuurPropertiesSource = {
      AccountingDocument: '123',
      AccountingDocumentType: 'DR',
      InvoiceReference: '',
      AmountInBalanceTransacCrcy: '100.00',
      ClearingDate: undefined,
      DocumentReferenceID: '456',
      DunningBlockingReason: '',
      DunningLevel: 0,
      IsCleared: false,
      NetDueDate: '2023-12-21T00:00:00',
      NetPaymentAmount: '100.00',
      Paylink: 'http://example.com/pay',
      PostingDate: '2023-11-21T00:00:00',
      ProfitCenterName: 'Profit Center 1',
      ReverseDocument: '',
      SEPAMandate: '',
    };

    const sourceInvoices: Record<
      AfisFactuur['status'],
      AfisFactuurPropertiesSource
    > = {
      openstaand,
      'automatische-incasso': {
        AccountingDocument: '124',
        AccountingDocumentType: 'DG',
        InvoiceReference: '',
        AmountInBalanceTransacCrcy: '200.00',
        ClearingDate: undefined,
        DocumentReferenceID: '457',
        DunningBlockingReason: '',
        DunningLevel: 0,
        IsCleared: false,
        NetDueDate: '2023-12-22T00:00:00',
        NetPaymentAmount: '200.00',
        Paylink: 'http://example.com/pay',
        PostingDate: '2023-11-22T00:00:00',
        ProfitCenterName: 'Profit Center 2',
        ReverseDocument: '',
        SEPAMandate: 'SEPA123',
      },
      'in-dispuut': {
        AccountingDocument: '125',
        AccountingDocumentType: 'DM',
        InvoiceReference: '',
        AmountInBalanceTransacCrcy: '300.00',
        ClearingDate: undefined,
        DocumentReferenceID: '458',
        DunningBlockingReason: 'BA',
        DunningLevel: 1,
        IsCleared: false,
        NetDueDate: '2023-12-23T00:00:00',
        NetPaymentAmount: '300.00',
        Paylink: 'http://example.com/pay',
        PostingDate: '2023-11-23T00:00:00',
        ProfitCenterName: 'Profit Center 3',
        ReverseDocument: '',
        SEPAMandate: '',
      },
      'gedeeltelijke-betaling': openstaand,
      'overgedragen-aan-belastingen': {
        AccountingDocument: '127',
        AccountingDocumentType: 'DF',
        InvoiceReference: '',
        AmountInBalanceTransacCrcy: '500.00',
        ClearingDate: undefined,
        DocumentReferenceID: '460',
        DunningBlockingReason: '',
        DunningLevel: 3,
        IsCleared: true,
        NetDueDate: '2023-12-25T00:00:00',
        NetPaymentAmount: '500.00',
        Paylink: 'http://example.com/pay',
        PostingDate: '2023-11-25T00:00:00',
        ProfitCenterName: 'Profit Center 5',
        ReverseDocument: '',
        SEPAMandate: '',
      },
      'geld-terug': {
        AccountingDocument: '128',
        AccountingDocumentType: 'DV',
        InvoiceReference: '',
        AmountInBalanceTransacCrcy: '-100.00',
        ClearingDate: undefined,
        DocumentReferenceID: '461',
        DunningBlockingReason: '',
        DunningLevel: 0,
        IsCleared: false,
        NetDueDate: '2023-12-26T00:00:00',
        NetPaymentAmount: '-100.00',
        Paylink: null,
        PostingDate: '2023-11-26T00:00:00',
        ProfitCenterName: 'Profit Center 6',
        ReverseDocument: '',
        SEPAMandate: '',
      },
      betaald: {
        AccountingDocument: '129',
        AccountingDocumentType: 'DW',
        InvoiceReference: '',
        AmountInBalanceTransacCrcy: '0.00',
        ClearingDate: '2023-12-01T00:00:00',
        DocumentReferenceID: '462',
        DunningBlockingReason: '',
        DunningLevel: 0,
        IsCleared: true,
        NetDueDate: '2023-12-27T00:00:00',
        NetPaymentAmount: '0.00',
        Paylink: null,
        PostingDate: '2023-11-27T00:00:00',
        ProfitCenterName: 'Profit Center 7',
        ReverseDocument: '',
        SEPAMandate: '',
      },
      geannuleerd: {
        AccountingDocument: '130',
        AccountingDocumentType: 'DX',
        InvoiceReference: '',
        AmountInBalanceTransacCrcy: '0.00',
        ClearingDate: undefined,
        DocumentReferenceID: '463',
        DunningBlockingReason: '',
        DunningLevel: 0,
        IsCleared: false,
        NetDueDate: '2023-12-28T00:00:00',
        NetPaymentAmount: '0.00',
        Paylink: null,
        PostingDate: '2023-11-28T00:00:00',
        ProfitCenterName: 'Profit Center 8',
        ReverseDocument: '123',
        SEPAMandate: '',
      },
      herinnering: {
        AccountingDocument: '131',
        AccountingDocumentType: 'DY',
        InvoiceReference: '',
        AmountInBalanceTransacCrcy: '600.00',
        ClearingDate: undefined,
        DocumentReferenceID: '464',
        DunningBlockingReason: '',
        DunningLevel: 2,
        IsCleared: false,
        NetDueDate: '2023-12-29T00:00:00',
        NetPaymentAmount: '600.00',
        Paylink: 'http://example.com/pay',
        PostingDate: '2023-11-29T00:00:00',
        ProfitCenterName: 'Profit Center 9',
        ReverseDocument: '',
        SEPAMandate: '',
      },
      onbekend: {
        AccountingDocument: '132',
        AccountingDocumentType: 'DZ',
        InvoiceReference: '',
        AmountInBalanceTransacCrcy: '700.00',
        ClearingDate: undefined,
        DocumentReferenceID: '465',
        DunningBlockingReason: '',
        DunningLevel: 0,
        IsCleared: undefined,
        NetDueDate: '2023-12-30T00:00:00',
        NetPaymentAmount: '700.00',
        Paylink: 'http://example.com/pay',
        PostingDate: '2023-11-30T00:00:00',
        ProfitCenterName: 'Profit Center 10',
        ReverseDocument: '',
        SEPAMandate: '',
      },
    };

    test('determineFactuurStatus returns correct status', () => {
      Object.entries(sourceInvoices).forEach(
        ([statusExpected, sourceInvoice]) => {
          expect(
            forTesting.determineFactuurStatus(
              sourceInvoice,
              new Decimal(sourceInvoice.AmountInBalanceTransacCrcy),
              statusExpected === 'gedeeltelijke-betaling'
            )
          ).toBe(statusExpected);
        }
      );
    });

    test('determineFactuurStatus determines status correctly', () => {
      const statusDescriptions = Object.keys(sourceInvoices).map((status) => {
        const statusDescription = forTesting.determineFactuurStatusDescription(
          status as AfisFactuur['status'],
          '€ 123,40',
          '16 juni 2024'
        );
        return [status, statusDescription];
      });
      expect(statusDescriptions).toMatchInlineSnapshot(`
        [
          [
            "openstaand",
            "€ 123,40 betaal nu",
          ],
          [
            "automatische-incasso",
            "€ 123,40 wordt automatisch van uw rekening afgeschreven.",
          ],
          [
            "in-dispuut",
            "€ 123,40 in dispuut",
          ],
          [
            "gedeeltelijke-betaling",
            "Uw factuur is nog niet volledig betaald. Maak het resterend bedrag van € 123,40 euro over onder vermelding van de gegevens op uw factuur.",
          ],
          [
            "overgedragen-aan-belastingen",
            "€ 123,40 is overgedragen aan het incasso- en invorderingstraject van directie Belastingen op op 16 juni 2024",
          ],
          [
            "geld-terug",
            "Het bedrag van € 123,40 wordt verrekend met openstaande facturen of teruggestort op uw rekening.",
          ],
          [
            "betaald",
            "€ 123,40 betaald op 16 juni 2024",
          ],
          [
            "geannuleerd",
            "Geannuleerd",
          ],
          [
            "herinnering",
            "€ 123,40 betaaltermijn verstreken: gelieve te betalen volgens de instructies in de herinneringsbrief die u per e-mail of post heeft ontvangen.",
          ],
          [
            "onbekend",
            "Onbekend",
          ],
        ]
      `);
    });
  });

  test('getAmountOwed calculates amount owed correctly', () => {
    const invoice: Pick<
      AfisFactuurPropertiesSource,
      'NetPaymentAmount' | 'AmountInBalanceTransacCrcy'
    > = {
      NetPaymentAmount: '100.00',
      AmountInBalanceTransacCrcy: '50.00',
    };

    const result = forTesting.getAmountOwed(invoice);
    expect(result).toEqual({
      amountOwed: new Decimal(150),
      amountInBalanceTransacCrcyInCents: new Decimal(5000),
    });

    const resultWithDeelbetaling = forTesting.getAmountOwed(invoice, {
      NetPaymentAmount: new Decimal(50),
      AmountInBalanceTransacCrcy: new Decimal(0),
    });
    expect(resultWithDeelbetaling.amountOwed.toFixed(2)).toEqual('200.00');
    expect(
      resultWithDeelbetaling.amountInBalanceTransacCrcyInCents.toFixed(2)
    ).toEqual('5000.00');
  });

  test('getFactuurnummer returns correct factuurnummer', () => {
    const invoice: Pick<
      AfisFactuurPropertiesSource,
      'AccountingDocument' | 'DocumentReferenceID'
    > = {
      AccountingDocument: '123456789',
      DocumentReferenceID: '987654321',
    };

    const factuurnummer = forTesting.getFactuurnummer(invoice);
    expect(factuurnummer).toBe('123456789');

    const invoiceWithoutAccountingDocument: Pick<
      AfisFactuurPropertiesSource,
      'AccountingDocument' | 'DocumentReferenceID'
    > = {
      AccountingDocument: '',
      DocumentReferenceID: '987654321',
    };

    const factuurnummerWithoutAccountingDocument = forTesting.getFactuurnummer(
      invoiceWithoutAccountingDocument
    );
    expect(factuurnummerWithoutAccountingDocument).toBe('987654321');
  });

  test('fetchAfisFacturenDeelbetalingen fetches and transforms deelbetalingen correctly', async () => {
    const deelbetalingenResponse: AfisInvoicesPartialPaymentsSource = {
      feed: {
        entry: [
          {
            content: {
              properties: {
                InvoiceReference: '123',
                AmountInBalanceTransacCrcy: '100.00',
                NetPaymentAmount: '50.00',
              },
            },
          },
        ],
      },
    };

    remoteApi
      .get((uri) =>
        decodeURI(uri).includes(
          `IsCleared eq false and (AccountingDocumentType eq 'AB')`
        )
      )
      .reply(200, deelbetalingenResponse);

    const params: AfisFacturenParams = {
      state: 'deelbetalingen',
      businessPartnerID: GENERIC_ID,
    };

    const response = await forTesting.fetchAfisFacturenDeelbetalingen(
      REQUEST_ID,
      params
    );

    expect(response.status).toBe('OK');
    expect(response.content).toEqual({
      '123': {
        NetPaymentAmount: new Decimal(50.0),
        AmountInBalanceTransacCrcy: new Decimal(100.0),
      },
    });
  });

  describe('fetch facturen', () => {
    Mockdate.set('2024-10-01T00:00:00');

    const defaultProps = {
      DunningLevel: 0,
      DunningBlockingReason: null,
      ProfitCenterName: 'Bedrijf: Ok',
      SEPAMandate: '',
      PostingDate: '2023-11-21T00:00:00',
      NetDueDate: '2023-12-21T00:00:00',
      NetPaymentAmount: '123.40',
      AmountInBalanceTransacCrcy: '10.00',
      DocumentReferenceID: '1234567890',
      AccountingDocument: '1234567890',
      Paylink: 'http://localhost:3100/mocks-server/afis/paylink',
      IsCleared: false,
    };

    const factuur = (properties: Record<string, unknown> = {}) => ({
      content: {
        '@type': 'application/xml',
        properties: {
          ...defaultProps,
          ...properties,
        },
      },
    });

    test('fetchAfisFacturenOverview', async () => {
      remoteApi.get(ROUTES.openstaandeFacturen).reply(200, {
        feed: {
          entry: [factuur()],
        },
      });

      remoteApi.get(ROUTES.afgehandeldeFacturen).reply(200, {
        feed: {
          entry: [{ ...factuur({ IsCleared: true, Paylink: null }) }],
        },
      });

      remoteApi.get(ROUTES.overgedragenFacturen).reply(200, {
        feed: {
          entry: [{ ...factuur({ IsCleared: true, DunningLevel: 3 }) }],
        },
      });

      const response = await fetchAfisFacturenOverview(REQUEST_ID, SESSION_ID, {
        businessPartnerID: GENERIC_ID,
      });
      const byStateValues = Object.values(response.content);

      expect(byStateValues.length).toBe(3);
      expect(
        byStateValues.every((responseData) => {
          return (
            responseData?.count === 1 && responseData?.facturen.length === 1
          );
        })
      ).toBe(true);
    });

    test('fetchAfisFacturenByState', async () => {
      remoteApi.get(ROUTES.afgehandeldeFacturen).reply(200, {
        feed: {
          entry: [{ ...factuur({ IsCleared: true, Paylink: null }) }],
        },
      });

      const response = await fetchAfisFacturenByState(REQUEST_ID, SESSION_ID, {
        state: 'afgehandeld',
        businessPartnerID: GENERIC_ID,
      });

      expect(
        response.content !== null && 'afgehandeld' in response.content
      ).toBe(true);

      expect(
        response.content !== null &&
          'afgehandeld' in response.content &&
          response.content?.afgehandeld?.facturen.length
      ).toBe(1);
    });
  });
});

describe('isPostedTodayAndBefore', () => {
  // Mentioned time that it has to be is to be read inside the tested function.
  afterAll(() => {
    Mockdate.reset();
  });

  describe('Should not display', () => {
    test('Posted today but it is not yet time', () => {
      Mockdate.set('2020-03-01T18:59:59');
      const result = forTesting.isDownloadAvailable('2020-03-01T18:59:59');
      expect(result).toBe(false);
    });

    test('Posted at the start of the day while it is the start of the day', () => {
      Mockdate.set('2020-03-01T00:00:00');
      const result = forTesting.isDownloadAvailable('2020-03-01T00:00:00');
      expect(result).toBe(false);
    });

    test('Posted into the future.', () => {
      Mockdate.set('2020-03-01T00:00:00');
      const result = forTesting.isDownloadAvailable('2020-03-01T00:00:01');
      expect(result).toBe(false);
    });
  });

  describe('Should display.', () => {
    test('Posted not today', () => {
      Mockdate.set('2020-03-01T00:00:00');
      const result = forTesting.isDownloadAvailable('2020-02-28T10:00:00');
      expect(result).toBe(true);
    });

    test('Posted at the start of the day, but its now time to display', () => {
      Mockdate.set('2020-03-01T19:00:00');
      const result = forTesting.isDownloadAvailable('2020-03-01T00:00:00');
      expect(result).toBe(true);
    });

    test('Posted after time to display, but its time to display', () => {
      Mockdate.set('2020-03-01T19:00:00');
      const result = forTesting.isDownloadAvailable('2020-03-01T19:00:00');
      expect(result).toBe(true);
    });
  });
});

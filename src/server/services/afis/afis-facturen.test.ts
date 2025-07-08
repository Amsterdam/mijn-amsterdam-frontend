import Decimal from 'decimal.js';
import Mockdate from 'mockdate';

import { fetchAfisDocument } from './afis-documents.ts';
import {
  fetchAfisFacturen,
  fetchAfisFacturenByState,
  fetchAfisFacturenOverview,
  forTesting,
} from './afis-facturen.ts';
import {
  AfisFacturenParams,
  AfisFactuur,
  AfisFactuurPropertiesSource,
  AfisInvoicesPartialPaymentsSource,
  XmlNullable,
} from './afis-types.ts';
import AFIS_AFGEHANDELDE_FACTUREN from './test-fixtures/afgehandelde-facturen.json';
import AFIS_OPENSTAAANDE_FACTUREN from './test-fixtures/openstaande-facturen.json';
import ARC_DOC from '../../../../mocks/fixtures/afis/arc-doc-id.json';
import DOCUMENT_DOWNLOAD_RESPONSE from '../../../../mocks/fixtures/afis/document.json';
import { getAuthProfileAndToken, remoteApi } from '../../../testing/utils.ts';

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

const SESSION_ID = '0987';
const FACTUUR_NUMMER = '12346789';
const GENERIC_ID = '12346789';

function isQueryStringIncludedInUri(uri: string, queryString: string) {
  return decodeURI(uri).includes(queryString.replace(/\s/g, '+'));
}

const ROUTES = {
  openstaandeFacturen: (uri: string) => {
    return isQueryStringIncludedInUri(
      uri,
      `IsCleared eq false and (AccountingDocumentType eq 'DR'`
    );
  },
  afgehandeldeFacturen: (uri: string) => {
    return isQueryStringIncludedInUri(
      uri,
      `and IsCleared eq true and (DunningLevel ne '3' or ReverseDocument ne '')`
    );
  },
  overgedragenFacturen: (uri: string) => {
    return isQueryStringIncludedInUri(
      uri,
      `and IsCleared eq true and DunningLevel eq '3'`
    );
  },
  documentDownload: (uri: string) => {
    return decodeURI(uri).includes('API_CV_ATTACHMENT_SRV');
  },
  documentID: (uri: string) => {
    return decodeURI(uri).includes('ZFI_CDS_TOA02');
  },
  deelbetalingen: (uri: string) =>
    isQueryStringIncludedInUri(
      uri,
      `IsCleared eq false and InvoiceReference ne '' and`
    ),
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
                AmountInBalanceTransacCrcy: '-27.50',
              },
            },
          },
        ],
      },
    };

    remoteApi.get(ROUTES.deelbetalingen).reply(200, deelbetalingenResponse);

    const response = await fetchAfisFacturen(
      authProfileAndToken.profile.sid,
      openParams
    );

    // All fields are listed here to test correct formatting.
    const openFactuur = response.content?.facturen[0];
    expect(openFactuur).toStrictEqual({
      afzender: 'Bedrijf: Ok',
      amountOriginal: '343.00',
      amountOriginalFormatted: '€ 343,00',
      amountPayed: '315.50',
      amountPayedFormatted: '€ 315,50',
      datePublished: '2023-11-21T00:00:00',
      datePublishedFormatted: '21 november 2023',
      debtClearingDate: null,
      debtClearingDateFormatted: null,
      documentDownloadLink:
        'http://bff-api-host/api/v1/services/afis/facturen/document?id=xx-encrypted-xx',
      factuurDocumentId: '1234567890',
      factuurNummer: '1234567890',
      id: '1234567890',
      link: {
        title: 'Factuur 1234567890',
        to: 'http://bff-api-host/api/v1/services/afis/facturen/document?id=xx-encrypted-xx',
      },
      paylink: 'http://localhost:3100/mocks-server/afis/paylink',
      paymentDueDate: '2023-12-21T00:00:00',
      paymentDueDateFormatted: '21 december 2023',
      status: 'gedeeltelijke-betaling',
      statusDescription:
        'Uw factuur van € 343,00 is nog niet volledig betaald. Maak het resterend bedrag van € 315,50 over onder vermelding van de gegevens op uw factuur.',
    });

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
    const deelbetalingenResponse: AfisInvoicesPartialPaymentsSource = {};

    remoteApi
      .get((uri) =>
        decodeURI(uri).includes(
          `IsCleared eq false and (AccountingDocumentType eq 'AB')`
        )
      )
      .reply(200, deelbetalingenResponse);

    remoteApi
      .get(ROUTES.afgehandeldeFacturen)
      .reply(200, AFIS_AFGEHANDELDE_FACTUREN);

    const closedParams: AfisFacturenParams = {
      state: 'afgehandeld',
      businessPartnerID: GENERIC_ID,
      top: undefined,
    };

    const response = await fetchAfisFacturen(
      authProfileAndToken.profile.sid,
      closedParams
    );

    const geannuleerdeInvoice = response.content?.facturen[0];
    expect(geannuleerdeInvoice).toMatchInlineSnapshot(`
      {
        "afzender": "Lisan al Gaib inc.",
        "amountOriginal": "0.00",
        "amountOriginalFormatted": "€ 0,00",
        "amountPayed": "0.00",
        "amountPayedFormatted": "€ 0,00",
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
        "statusDescription": "€ 0,00 geannuleerd op null",
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

  test('Download document success response but no DocumentId', async () => {
    const noArcDocId = structuredClone(ARC_DOC);
    delete noArcDocId.feed.entry[0];

    remoteApi.get(ROUTES.documentID).reply(200, noArcDocId);

    const response = await fetchAfisDocument(
      getAuthProfileAndToken('private'),
      FACTUUR_NUMMER
    );

    expect(response).toMatchInlineSnapshot(`
      {
        "code": 404,
        "content": null,
        "message": "ArcDocumentID not found",
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
      getAuthProfileAndToken('private'),
      FACTUUR_NUMMER
    );

    expect(response.status).toBe('OK');
    expect(response.content?.data.length).toBeGreaterThan(0);
    expect(response.content?.mimetype).toBe('application/pdf');
    expect(response.content?.filename).toStrictEqual('FACTUUR.PDF');
  });

  test('getFactuurRequestQueryParams formats URL correctly', () => {
    const params = forTesting.getFactuurRequestQueryParams({
      state: 'open',
      businessPartnerID: GENERIC_ID,
    });
    expect(params.$filter).toContain('IsCleared eq false');
    expect(params.$filter).toContain(`Customer eq '${GENERIC_ID}'`);
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
              },
            },
          },
          {
            content: {
              properties: {
                InvoiceReference: '123',
                AmountInBalanceTransacCrcy: '-75.40',
              },
            },
          },
          {
            content: {
              properties: {
                InvoiceReference: '321',
                AmountInBalanceTransacCrcy: '-100',
              },
            },
          },
        ],
      },
    };
    const result = forTesting.transformDeelbetalingenResponse(response);

    expect(['123', '321'].every((id) => id in result)).toBe(true);

    expect(result['123'].toFixed(2)).toEqual('-175.50');
    expect(result['321'].toFixed(2)).toEqual('-100.00');
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
      Paylink: null,
      PostingDate: { '@null': true },
      ProfitCenterName: '',
      SEPAMandate: '',
      PaymentMethod: null,
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
        "Paylink": null,
        "PaymentMethod": null,
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
      Paylink: 'http://example.com/pay',
      PaymentMethod: 'B',
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
        Paylink: 'http://example.com/pay',
        PaymentMethod: 'X',
        PostingDate: '2023-11-22T00:00:00',
        ProfitCenterName: 'Profit Center 2',
        ReverseDocument: '',
        SEPAMandate: 'SEPA123',
      },
      'handmatig-betalen': {
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
        Paylink: '',
        PaymentMethod: 'B',
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
        Paylink: 'http://example.com/pay',
        PaymentMethod: 'B',
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
        Paylink: 'http://example.com/pay',
        PaymentMethod: 'B',
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
        Paylink: null,
        PaymentMethod: 'B',
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
        Paylink: null,
        PaymentMethod: 'B',
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
        Paylink: null,
        PaymentMethod: 'B',
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
        Paylink: 'http://example.com/pay',
        PaymentMethod: 'B',
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
        PaymentMethod: 'B',
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

    test('determineFactuurStatus determines Openstaande status description correctly', () => {
      const statusDescriptions = Object.keys(sourceInvoices)
        .filter((status) => !['betaald', 'geannuleerd'].includes(status))
        .map((status) => {
          const IS_CLEARED = false;
          const statusDescription =
            forTesting.determineFactuurStatusDescription(
              status as AfisFactuur['status'],
              '€ 123,40',
              '€ 210,40',
              IS_CLEARED,
              '16 juni 2024'
            );
          return [status, statusDescription];
        });

      expect(statusDescriptions).toEqual([
        ['openstaand', '€ 210,40 betaal nu'],
        [
          'automatische-incasso',
          '€ 210,40 wordt automatisch van uw rekening afgeschreven.',
        ],
        [
          'handmatig-betalen',
          'Uw factuur is nog niet betaald. Maak het bedrag van € 210,40 over onder vermelding van de gegevens op uw factuur.',
        ],
        ['in-dispuut', '€ 210,40 in dispuut'],
        [
          'gedeeltelijke-betaling',
          'Uw factuur van € 210,40 is nog niet volledig betaald. Maak het resterend bedrag van € 123,40 over onder vermelding van de gegevens op uw factuur.',
        ],
        [
          'overgedragen-aan-belastingen',
          '€ 210,40 is overgedragen aan het incasso- en invorderingstraject van directie Belastingen op 16 juni 2024',
        ],
        [
          'geld-terug',
          'Het bedrag van € 210,40 wordt verrekend met openstaande facturen of teruggestort op uw rekening.',
        ],
        [
          'herinnering',
          '€ 210,40 betaaltermijn verstreken: gelieve te betalen volgens de instructies in de herinneringsbrief die u per e-mail of post heeft ontvangen.',
        ],
        ['onbekend', 'Onbekend'],
      ]);
    });

    test('determineFactuurStatus determines Afgehandelde status description correctly', () => {
      const IS_CLEARED = true;
      const statusDescriptions = Object.keys(sourceInvoices)
        .filter((status) =>
          [
            'betaald',
            'automatische-incasso',
            'geld-terug',
            'geannuleerd',
          ].includes(status)
        )
        .map((status) => {
          const statusDescription =
            forTesting.determineFactuurStatusDescription(
              status as AfisFactuur['status'],
              '€ 123,40',
              '€ 210,40',
              IS_CLEARED,
              '16 juni 2024'
            );
          return [status, statusDescription];
        });

      expect(statusDescriptions).toStrictEqual([
        [
          'automatische-incasso',
          '€ 210,40 is door middel van een automatisch incasso op 16 juni 2024 van uw rekening afgeschreven.',
        ],
        [
          'geld-terug',
          'Het bedrag van € 210,40 is verrekend met openstaande facturen of teruggestort op uw rekening.',
        ],
        ['betaald', '€ 210,40 betaald op 16 juni 2024'],
        ['geannuleerd', '€ 210,40 geannuleerd op 16 juni 2024'],
      ]);
    });
  });

  test('getInvoiceAmount calculates amountPayed owed correctly', () => {
    const invoice: Pick<
      AfisFactuurPropertiesSource,
      'AmountInBalanceTransacCrcy'
    > = {
      AmountInBalanceTransacCrcy: '50.00',
    };

    const result = forTesting.getInvoiceAmount(invoice);
    expect(result).toEqual(new Decimal(50));

    const amountPayed = forTesting.getInvoiceAmount(
      invoice,
      new Decimal('-10.35')
    );
    expect(amountPayed.toFixed(2)).toEqual('39.65');
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

  describe('getFactuurDocumentId returns correct factuurDocumentId', () => {
    const properID = '1234567890';
    const oldID = '98765432';
    const migratedID = `00${oldID}`;

    test('Returns same ID', () => {
      expect(forTesting.getFactuurDocumentId(properID)).toBe(properID);
    });

    test('Converts oldID to migratedID', () => {
      const rs = forTesting.getFactuurDocumentId(oldID);
      expect(rs).toBe(migratedID);
      expect(rs.length).toBe(10);
    });
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
              },
            },
          },
        ],
      },
    };

    remoteApi.get(ROUTES.deelbetalingen).reply(200, deelbetalingenResponse);

    const params: AfisFacturenParams = {
      state: 'deelbetalingen',
      businessPartnerID: GENERIC_ID,
    };

    const response = await forTesting.fetchAfisFacturenDeelbetalingen(params);

    expect(response.status).toBe('OK');
    expect(response.content).toEqual({
      '123': new Decimal(100.0),
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
      // remoteApi.get(ROUTES.deelbetalingen).times(3).reply(200, {});

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

      const response = await fetchAfisFacturenOverview(SESSION_ID, {
        businessPartnerID: GENERIC_ID,
      });
      const byStateValues =
        response.content !== null ? Object.values(response.content) : [];

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

      const response = await fetchAfisFacturenByState(SESSION_ID, {
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

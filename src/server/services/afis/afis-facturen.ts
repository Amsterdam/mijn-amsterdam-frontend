import {
  ApiResponse,
  apiSuccessResult,
  getFailedDependencies,
  getSettledResult,
} from '../../../universal/helpers/api';
import {
  defaultDateFormat,
  isDateInPast,
} from '../../../universal/helpers/date';
import displayAmount, {
  capitalizeFirstLetter,
} from '../../../universal/helpers/text';
import { encryptSessionIdWithRouteIdParam } from '../../helpers/encrypt-decrypt';
import { requestData } from '../../helpers/source-api-request';
import { BffEndpoints } from '../../routing/bff-routes';
import { generateFullApiUrlBFF } from '../../routing/route-helpers';
import { captureMessage } from '../monitoring';
import { getAfisApiConfig, getFeedEntryProperties } from './afis-helpers';
import {
  AfisFacturenByStateResponse,
  AfisFacturenParams,
  AfisFacturenResponse,
  AfisFactuur,
  AfisFactuurPropertiesSource,
  AfisFactuurState,
  AfisOpenInvoiceSource,
} from './afis-types';

const DEFAULT_PROFIT_CENTER_NAME = 'Gemeente Amsterdam';

export const FACTUUR_STATE_KEYS: AfisFactuurState[] = [
  'open',
  'afgehandeld',
  'overgedragen',
];

export async function fetchAfisFacturen(
  requestID: RequestID,
  sessionID: SessionID,
  params: AfisFacturenParams
): Promise<ApiResponse<AfisFacturenResponse | null>> {
  const config = await getAfisApiConfig({
    formatUrl: ({ url }) => formatFactuurRequestURL(url, params),
    transformResponse: (responseData) =>
      transformFacturen(responseData, sessionID),
  });

  return requestData<AfisFacturenResponse>(config, requestID);
}

const accountingDocumentTypesByState: Record<AfisFactuurState, string[]> = {
  open: ['DR', 'DG', 'DM', 'DE', 'DF', 'DV', 'DW'],
  afgehandeld: ['DR', 'DE', 'DM', 'DV', 'DG', 'DF', 'DM', 'DW'],
  overgedragen: ['DR', 'DE', 'DM', 'DV', 'DG', 'DF', 'DM', 'DW'],
};

function getAccountingDocumentTypesFilter(state: AfisFactuurState) {
  const docTypeFilters = accountingDocumentTypesByState[state]
    .map((type) => `AccountingDocumentType eq '${type}'`)
    .join(' or ');

  return ` and (${docTypeFilters})`;
}

function formatFactuurRequestURL(
  baseUrl: string | undefined,
  params: AfisFacturenParams
): string {
  const baseRoute = '/API/ZFI_OPERACCTGDOCITEM_CDS/ZFI_OPERACCTGDOCITEM';

  const filters: Record<AfisFacturenParams['state'], string> = {
    // Openstaaand (met betaallink of sepamandaat)
    open: `$filter=Customer eq '${params.businessPartnerID}' and IsCleared eq false`,
    // Afgehandeld (ge-incasseerd, betaald, geannuleerd)
    afgehandeld: `$filter=Customer eq '${params.businessPartnerID}' and IsCleared eq true and (DunningLevel ne '3' or ReverseDocument ne '')`,
    // Overgedragen aan belastingen
    overgedragen: `$filter=Customer eq '${params.businessPartnerID}' and IsCleared eq true and DunningLevel eq '3'`,
  };

  const select = `$select=IsCleared,ReverseDocument,Paylink,PostingDate,ProfitCenterName,DocumentReferenceID,AccountingDocument,AmountInBalanceTransacCrcy,NetPaymentAmount,NetDueDate,DunningLevel,DunningBlockingReason,SEPAMandate,ClearingDate`;
  const orderBy = '$orderBy=NetDueDate asc, PostingDate asc';

  let query = `?$inlinecount=allpages&${filters[params.state]}${getAccountingDocumentTypesFilter(params.state)}&${select}&${orderBy}`;

  if (params.top) {
    query += `&$top=${params.top}`;
  }
  const fullUrl = `${baseUrl}${baseRoute}${query}`;
  console.log('fullUrl', fullUrl);
  return fullUrl;
}

export async function fetchAfisFacturenOverview(
  requestID: RequestID,
  sessionID: SessionID,
  params: Omit<AfisFacturenParams, 'state' | 'top'>
) {
  const facturenOpenRequest = fetchAfisFacturen(requestID, sessionID, {
    state: 'open',
    businessPartnerID: params.businessPartnerID,
  });

  const facturenClosedRequest = fetchAfisFacturen(requestID, sessionID, {
    state: 'afgehandeld',
    businessPartnerID: params.businessPartnerID,
    top: '3',
  });

  const facturenTransferredRequest = fetchAfisFacturen(requestID, sessionID, {
    state: 'overgedragen',
    businessPartnerID: params.businessPartnerID,
    top: '3',
  });

  const [
    facturenOpenResponse,
    facturenClosedResponse,
    facturenTransferredResponse,
  ] = await Promise.allSettled([
    facturenOpenRequest,
    facturenClosedRequest,
    facturenTransferredRequest,
  ]);

  const facturenOpenResult = getSettledResult(facturenOpenResponse);
  const facturenClosedResult = getSettledResult(facturenClosedResponse);
  const facturenTransferredResult = getSettledResult(
    facturenTransferredResponse
  );

  const facturenOverview: AfisFacturenByStateResponse = {
    open: facturenOpenResult.content ?? null,
    afgehandeld: facturenClosedResult.content ?? null,
    overgedragen: facturenTransferredResult.content ?? null,
  };

  return apiSuccessResult(
    facturenOverview,
    getFailedDependencies({
      open: facturenOpenResult,
      afgehandeld: facturenClosedResult,
      overgedragen: facturenTransferredResult,
    })
  );
}

export async function fetchAfisFacturenByState(
  requestID: RequestID,
  sessionID: SessionID,
  params: AfisFacturenParams
) {
  const facturenResponse = await fetchAfisFacturen(
    requestID,
    sessionID,
    params
  );
  if ((await facturenResponse.status) === 'OK') {
    return apiSuccessResult({
      [params.state]: facturenResponse.content,
    });
  }
  return facturenResponse;
}

function transformFacturen(
  responseData: AfisOpenInvoiceSource,
  sessionID: SessionID
): AfisFacturenResponse {
  const feedProperties = getFeedEntryProperties(responseData);
  const count = responseData?.feed?.count ?? feedProperties.length;
  const facturenTransformed = feedProperties.map((invoiceProperties) => {
    return transformFactuur(invoiceProperties, sessionID);
  });
  return {
    count,
    facturen: facturenTransformed,
  };
}

function transformFactuur(
  sourceInvoice: XmlNullable<AfisFactuurPropertiesSource>,
  sessionID: SessionID
): AfisFactuur {
  const invoice = replaceXmlNulls(sourceInvoice);
  const factuurDocumentId = invoice.AccountingDocument;
  const factuurNummer = factuurDocumentId || invoice.DocumentReferenceID; // NOTE: This has to be verified with proper test data.
  const factuurDocumentIdEncrypted = factuurDocumentId
    ? encryptSessionIdWithRouteIdParam(sessionID, factuurDocumentId)
    : null;
  const MULTIPLY_WITH_100 = 100;
  const netPaymentAmountInCents =
    parseFloat(invoice.NetPaymentAmount) * MULTIPLY_WITH_100;
  const amountInBalanceTransacCrcyInCents =
    parseFloat(invoice.AmountInBalanceTransacCrcy) * MULTIPLY_WITH_100;

  const amountOwed =
    (amountInBalanceTransacCrcyInCents + netPaymentAmountInCents) /
    MULTIPLY_WITH_100;
  const amountOwedFormatted = `€ ${amountOwed ? displayAmount(amountOwed) : 0}`;

  let debtClearingDate = null;
  let debtClearingDateFormatted = null;
  if (invoice.ClearingDate) {
    debtClearingDate = invoice.ClearingDate;
    debtClearingDateFormatted = defaultDateFormat(debtClearingDate);
  }

  const status = determineFactuurStatus(
    invoice,
    amountInBalanceTransacCrcyInCents
  );

  return {
    id: factuurDocumentId,
    afzender: invoice.ProfitCenterName || DEFAULT_PROFIT_CENTER_NAME,
    datePublished: invoice.PostingDate || null,
    datePublishedFormatted: defaultDateFormat(invoice.PostingDate) || null,
    paymentDueDate: invoice.NetDueDate,
    paymentDueDateFormatted: defaultDateFormat(invoice.NetDueDate),
    debtClearingDate,
    debtClearingDateFormatted,
    amountOwed: amountOwed ? amountOwed : 0,
    amountOwedFormatted,
    factuurNummer,
    factuurDocumentId,
    status,
    statusDescription: determineFactuurStatusDescription(
      status,
      amountOwedFormatted,
      debtClearingDateFormatted
    ),
    paylink: invoice.Paylink ? invoice.Paylink : null,
    documentDownloadLink: factuurDocumentIdEncrypted
      ? `${generateFullApiUrlBFF(BffEndpoints.AFIS_DOCUMENT_DOWNLOAD)}?id=${factuurDocumentIdEncrypted}`
      : null,
  };
}

type XmlNullable<T extends Record<string, unknown>> = {
  [key in keyof T]: { '@null': true } | T[key];
};

/** Replace all values that is an XML Null value with just the value `null`. */
function replaceXmlNulls(
  sourceInvoice: XmlNullable<AfisFactuurPropertiesSource>
): AfisFactuurPropertiesSource {
  const withoutXmlNullable = Object.entries(sourceInvoice).map(([key, val]) => {
    if (typeof val === 'object' && val !== null && val['@null']) {
      return [key, null];
    }
    return [key, val];
  });
  return Object.fromEntries(withoutXmlNullable);
}

const DUNNING_BLOCKING_LEVEL_OVERGEDRAGEN_AAN_BELASTINGEN = 3;

function determineFactuurStatus(
  sourceInvoice: AfisFactuurPropertiesSource,
  amountInBalanceTransacCrcyInCents: number
): AfisFactuur['status'] {
  switch (true) {
    // Closed invoices
    case !!sourceInvoice.ReverseDocument:
      return 'geannuleerd';

    case sourceInvoice.IsCleared &&
      sourceInvoice.DunningLevel ===
        DUNNING_BLOCKING_LEVEL_OVERGEDRAGEN_AAN_BELASTINGEN:
      return 'overgedragen-aan-belastingen';

    case sourceInvoice.IsCleared && sourceInvoice.DunningLevel === 0:
      return 'betaald';

    // Open invoices
    case amountInBalanceTransacCrcyInCents < 0:
      return 'geld-terug';

    case !!sourceInvoice.NetDueDate &&
      isDateInPast(sourceInvoice.NetDueDate) &&
      (sourceInvoice.DunningLevel == 1 || sourceInvoice.DunningLevel == 2):
      return 'herinnering';

    case sourceInvoice.DunningBlockingReason === 'D':
      return 'in-dispuut';

    case sourceInvoice.DunningBlockingReason === 'BA':
      return 'gedeeltelijke-betaling';

    case !!sourceInvoice.SEPAMandate:
      return 'automatische-incasso';

    case !sourceInvoice.IsCleared && sourceInvoice.DunningLevel === 0:
      return 'openstaand';

    default:
      captureMessage(
        `Error: invoice status 'onbekend' (unknown)
Source Invoice Properties that determine this are:
\tReverseDocument: ${sourceInvoice.ReverseDocument}
\tIsCleared: ${sourceInvoice.IsCleared}
\tDunningLevel: ${sourceInvoice.DunningLevel}
\tDunningBlockingReason: ${sourceInvoice.DunningBlockingReason}`,
        { severity: 'error' }
      );
      // Unknown status
      return 'onbekend';
  }
}

function determineFactuurStatusDescription(
  status: AfisFactuur['status'],
  amountOwedFormatted: AfisFactuur['amountOwedFormatted'],
  debtClearingDateFormatted: AfisFactuur['debtClearingDateFormatted']
) {
  switch (status) {
    case 'openstaand':
      return `${amountOwedFormatted} betaal nu`;
    case 'herinnering':
      return 'Betaaltermijn verstreken: betaal via de herinneringsbrief';
    case 'in-dispuut':
      return 'In dispuut';
    case 'gedeeltelijke-betaling':
      return `Automatische incasso - Betaal het openstaande bedrag van ${amountOwedFormatted} via bankoverschrijving`;
    case 'geld-terug':
      return `U krijgt ${amountOwedFormatted.replace('-', '')} terug`;
    case 'betaald':
      return `Betaald ${debtClearingDateFormatted ? `op ${debtClearingDateFormatted}` : ''}`;
    case 'automatische-incasso':
      return `${amountOwedFormatted} wordt automatisch van uw rekening afgeschreven`;
    case 'overgedragen-aan-belastingen':
      return `Overgedragen aan belastingen ${debtClearingDateFormatted ? `op ${debtClearingDateFormatted}` : ''}`;
    default:
      return capitalizeFirstLetter(status ?? '');
  }
}

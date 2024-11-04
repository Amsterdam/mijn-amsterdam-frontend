import { firstBy } from 'thenby';

import {
  ApiResponse,
  apiSuccessResult,
  getFailedDependencies,
  getSettledResult,
} from '../../../universal/helpers/api';
import {
  dateSort,
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
  AccountingDocumentType,
  AfisAmountPropertiesSource,
  AfisFacturenByStateResponse,
  AfisFacturenParams,
  AfisFacturenResponse,
  AfisFactuur,
  AfisFactuurDeelbetalingen,
  AfisFactuurPropertiesSource,
  AfisFactuurState,
  AfisInvoicesPartialPaymentsSource,
  AfisInvoicesSource,
  InvoiceAmountOwed,
  XmlNullable,
} from './afis-types';
import { AppRoutes } from '../../../universal/config/routes';
import { FeatureToggle } from '../../../universal/config/feature-toggles';

const DEFAULT_PROFIT_CENTER_NAME = 'Gemeente Amsterdam';
const AFIS_MAX_FACTUREN_TOP = 2000;

export const FACTUUR_STATE_KEYS: AfisFactuurState[] = [
  'open',
  'afgehandeld',
  'overgedragen',
];

const accountingDocumentTypesByState: Record<
  AfisFacturenParams['state'],
  AccountingDocumentType[]
> = {
  open: ['DR', 'DG', 'DM', 'DE', 'DF', 'DV', 'DW'],
  afgehandeld: ['DR', 'DE', 'DM', 'DV', 'DG', 'DF', 'DM', 'DW'],
  overgedragen: ['DR', 'DE', 'DM', 'DV', 'DG', 'DF', 'DM', 'DW'],
  deelbetalingen: ['AB'],
};

const select = `$select=IsCleared,ReverseDocument,Paylink,PostingDate,ProfitCenterName,DocumentReferenceID,AccountingDocument,AmountInBalanceTransacCrcy,NetPaymentAmount,NetDueDate,DunningLevel,DunningBlockingReason,SEPAMandate,ClearingDate`;

const selectFieldsQueryByState: Record<AfisFacturenParams['state'], string> = {
  open: select,
  afgehandeld: select,
  overgedragen: select,
  deelbetalingen:
    '$select=AmountInBalanceTransacCrcy,NetPaymentAmount,InvoiceReference',
};

const orderByQueryByState: Record<AfisFacturenParams['state'], string> = {
  open: '$orderby=NetDueDate asc, PostingDate asc',
  afgehandeld: '$orderby=ClearingDate desc',
  overgedragen: '$orderby=ClearingDate desc',
  deelbetalingen: '',
};

function getAccountingDocumentTypesFilter(state: AfisFacturenParams['state']) {
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

    // Deelbetalingen
    deelbetalingen: `$filter=Customer eq '${params.businessPartnerID}' and IsCleared eq false`,
  };

  const top = params.top
    ? Math.max(parseInt(params.top, 10), AFIS_MAX_FACTUREN_TOP)
    : AFIS_MAX_FACTUREN_TOP;
  const query = `?$inlinecount=allpages&${filters[params.state]}${getAccountingDocumentTypesFilter(params.state)}&${selectFieldsQueryByState[params.state]}&${orderByQueryByState[params.state]}&$top=${top}`;
  const fullUrl = `${baseUrl}${baseRoute}${query}`;

  return fullUrl;
}

function transformDeelbetalingenResponse(
  responseData: AfisInvoicesPartialPaymentsSource
): AfisFactuurDeelbetalingen {
  const feedProperties = getFeedEntryProperties(responseData);
  // Make a map of factuurnummers to total deelbetaling amounts
  const deelbetalingAmountByFactuurnummer: AfisFactuurDeelbetalingen = {};

  return feedProperties.reduce((acc, deelbetaling) => {
    const factuurNummer = deelbetaling.InvoiceReference;

    if (factuurNummer) {
      if (!acc[factuurNummer]) {
        acc[factuurNummer] = {
          NetPaymentAmount: new Decimal(0),
          AmountInBalanceTransacCrcy: new Decimal(0),
        };
      }

      if (deelbetaling.NetPaymentAmount) {
        acc[factuurNummer].NetPaymentAmount = acc[
          factuurNummer
        ].NetPaymentAmount.plus(deelbetaling.NetPaymentAmount);
      }

      if (deelbetaling.AmountInBalanceTransacCrcy) {
        acc[factuurNummer].AmountInBalanceTransacCrcy = acc[
          factuurNummer
        ].AmountInBalanceTransacCrcy.plus(
          deelbetaling.AmountInBalanceTransacCrcy
        );
      }
    }

    return acc;
  }, deelbetalingAmountByFactuurnummer);
}

async function fetchAfisFacturenDeelbetalingen(
  requestID: RequestID,
  params: AfisFacturenParams
): Promise<ApiResponse<AfisFactuurDeelbetalingen | null>> {
  const config = await getAfisApiConfig(
    {
      formatUrl: ({ url }) => formatFactuurRequestURL(url, params),
      transformResponse: transformDeelbetalingenResponse,
    },
    requestID
  );
  return requestData<AfisFactuurDeelbetalingen>(config, requestID);
}

function getFactuurnummer(
  invoice: Pick<
    AfisFactuurPropertiesSource,
    'AccountingDocument' | 'DocumentReferenceID'
  >
) {
  const factuurDocumentId = String(invoice.AccountingDocument);
  const factuurNummer = String(
    factuurDocumentId || invoice.DocumentReferenceID
  ); // NOTE: This has to be verified with proper test data.
  return factuurNummer;
}

function getAmountOwed(
  invoice: AfisAmountPropertiesSource<string>,
  deelbetaling?: AfisAmountPropertiesSource<Decimal>
): InvoiceAmountOwed {
  let netPaymentAmount = new Decimal(invoice.NetPaymentAmount ?? 0);
  let amountInBalanceTransacCrcy = new Decimal(
    invoice.AmountInBalanceTransacCrcy ?? 0
  );

  if (deelbetaling) {
    netPaymentAmount = netPaymentAmount.plus(deelbetaling.NetPaymentAmount);
    amountInBalanceTransacCrcy = amountInBalanceTransacCrcy.plus(
      deelbetaling.AmountInBalanceTransacCrcy
    );
  }

  const amountOwed = netPaymentAmount.plus(amountInBalanceTransacCrcy);

  return {
    amountOwed,
    // eslint-disable-next-line no-magic-numbers
    amountInBalanceTransacCrcyInCents: amountInBalanceTransacCrcy.times(100),
  };
}

function transformFactuur(
  sourceInvoice: XmlNullable<AfisFactuurPropertiesSource>,
  sessionID: SessionID,
  deelbetalingen?: AfisFactuurDeelbetalingen
): AfisFactuur {
  const invoice = replaceXmlNulls(sourceInvoice);
  const factuurDocumentId = String(invoice.AccountingDocument);
  const factuurNummer = getFactuurnummer(invoice);
  const factuurDocumentIdEncrypted = factuurDocumentId
    ? encryptSessionIdWithRouteIdParam(sessionID, factuurDocumentId)
    : null;

  const deelbetaling = deelbetalingen?.[factuurNummer];
  const hasDeelbetaling = !!deelbetaling;
  const { amountOwed, amountInBalanceTransacCrcyInCents } = getAmountOwed(
    invoice,
    deelbetaling
  );
  const amountOwedFormatted = `€ ${amountOwed ? displayAmount(parseFloat(amountOwed.toFixed(2))) : 0}`;

  let debtClearingDate = null;
  let debtClearingDateFormatted = null;

  if (invoice.ClearingDate) {
    debtClearingDate = invoice.ClearingDate;
    debtClearingDateFormatted = defaultDateFormat(debtClearingDate);
  }

  const status = determineFactuurStatus(
    invoice,
    amountInBalanceTransacCrcyInCents,
    hasDeelbetaling
  );

  const documentDownloadLink = factuurDocumentIdEncrypted
    ? `${generateFullApiUrlBFF(BffEndpoints.AFIS_DOCUMENT_DOWNLOAD)}?id=${factuurDocumentIdEncrypted}`
    : null;

  return {
    id: factuurDocumentId,
    afzender: invoice.ProfitCenterName || DEFAULT_PROFIT_CENTER_NAME,
    datePublished: invoice.PostingDate || null,
    datePublishedFormatted: defaultDateFormat(invoice.PostingDate) || null,
    paymentDueDate: invoice.NetDueDate,
    paymentDueDateFormatted: defaultDateFormat(invoice.NetDueDate),
    debtClearingDate,
    debtClearingDateFormatted,
    amountOwed: amountOwed.toFixed(2),
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
    documentDownloadLink,
    link: {
      to: documentDownloadLink ?? AppRoutes.AFIS,
      title: `Factuur ${factuurNummer}`,
    },
  };
}

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

function transformFacturen(
  responseData: AfisInvoicesSource,
  sessionID: SessionID,
  deelbetalingen?: AfisFactuurDeelbetalingen
): AfisFacturenResponse {
  const feedProperties = getFeedEntryProperties(responseData);
  const count = responseData?.feed?.count ?? feedProperties.length;
  const facturenTransformed = feedProperties
    .filter((invoiceProperties) => {
      return FeatureToggle.afisFilterOutUndownloadableFacturenActive
        ? isDownloadAvailable(invoiceProperties.PostingDate)
        : true;
    })
    .map((invoiceProperties) => {
      return transformFactuur(invoiceProperties, sessionID, deelbetalingen);
    });
  return {
    count,
    facturen: facturenTransformed,
  };
}

/** Checks if a factuur is available for download.
 *
 *  A factuur can only be downloaded after a certain time on the day it was posted. This because PDF's of invoices are generated by a batch job running at a later time.
 * */
function isDownloadAvailable(postingDate: string): boolean {
  if (!postingDate) {
    return true;
  }

  const datePosted = parseISO(postingDate);
  const now = new Date();

  const isPostedInTheFuture = datePosted.getTime() > now.getTime();
  if (isPostedInTheFuture) {
    return false;
  }

  if (isToday(datePosted)) {
    const FACTUUR_AVAILABLE_AFTER_N_OCLOCK = 19;
    return now.getHours() >= FACTUUR_AVAILABLE_AFTER_N_OCLOCK;
  }

  return true;
}

const DUNNING_BLOCKING_LEVEL_OVERGEDRAGEN_AAN_BELASTINGEN = 3;

function determineFactuurStatus(
  sourceInvoice: AfisFactuurPropertiesSource,
  amountInBalanceTransacCrcyInCents: Decimal,
  hasDeelbetaling: boolean
): AfisFactuur['status'] {
  switch (true) {
    case sourceInvoice.IsCleared === false &&
      !!sourceInvoice.DunningBlockingReason:
      return 'in-dispuut';

    case !!sourceInvoice.ReverseDocument:
      return 'geannuleerd';

    case sourceInvoice.IsCleared === true &&
      sourceInvoice.DunningLevel ===
        DUNNING_BLOCKING_LEVEL_OVERGEDRAGEN_AAN_BELASTINGEN:
      return 'overgedragen-aan-belastingen';

    case sourceInvoice.IsCleared && sourceInvoice.DunningLevel === 0:
      return 'betaald';

    case amountInBalanceTransacCrcyInCents.lt(0):
      return 'geld-terug';

    case !!sourceInvoice.NetDueDate &&
      isDateInPast(sourceInvoice.NetDueDate) &&
      (sourceInvoice.DunningLevel == 1 || sourceInvoice.DunningLevel == 2):
      return 'herinnering';

    case hasDeelbetaling:
      return 'gedeeltelijke-betaling';

    case !!sourceInvoice.SEPAMandate:
      return 'automatische-incasso';

    case sourceInvoice.IsCleared === false && sourceInvoice.DunningLevel === 0:
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
  const amount = amountOwedFormatted.replace('-', '');
  switch (status) {
    case 'openstaand':
      return `${amount} betaal nu`;
    case 'herinnering':
      return `${amount} betaaltermijn verstreken: gelieve te betalen volgens de instructies in de herinneringsbrief die u per e-mail of post heeft ontvangen.`;
    case 'in-dispuut':
      return `${amount} in dispuut`;
    case 'gedeeltelijke-betaling':
      return `Uw factuur is nog niet volledig betaald. Maak het resterend bedrag van ${amount} euro over onder vermelding van de gegevens op uw factuur.`;
    case 'geld-terug':
      return `Het bedrag van ${amount} wordt verrekend met openstaande facturen of teruggestort op uw rekening.`;
    case 'betaald':
      return `${amount} betaald ${debtClearingDateFormatted ? `op ${debtClearingDateFormatted}` : ''}`;
    case 'automatische-incasso':
      return `${amount} wordt automatisch van uw rekening afgeschreven.`;
    case 'overgedragen-aan-belastingen':
      return `${amount} is overgedragen aan het incasso- en invorderingstraject van directie Belastingen op ${debtClearingDateFormatted ? `op ${debtClearingDateFormatted}` : ''}`;
    default:
      return capitalizeFirstLetter(status ?? '');
  }
}

export async function fetchAfisFacturen(
  requestID: RequestID,
  sessionID: SessionID,
  params: AfisFacturenParams
): Promise<ApiResponse<AfisFacturenResponse | null>> {
  let deelbetalingen: AfisFactuurDeelbetalingen | undefined;

  if (params.state === 'open') {
    const facturenDeelbetalingenResponse =
      await fetchAfisFacturenDeelbetalingen(requestID, {
        state: 'deelbetalingen',
        businessPartnerID: params.businessPartnerID,
      });

    if (
      facturenDeelbetalingenResponse.status === 'OK' &&
      facturenDeelbetalingenResponse.content !== null
    ) {
      deelbetalingen = facturenDeelbetalingenResponse.content;
    }
  }

  const config = await getAfisApiConfig(
    {
      formatUrl: ({ url }) => formatFactuurRequestURL(url, params),
      transformResponse: (responseData) =>
        transformFacturen(responseData, sessionID, deelbetalingen),
    },
    requestID
  );

  return requestData<AfisFacturenResponse>(config, requestID);
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

  let openFacturenContent: AfisFacturenResponse | null | undefined =
    facturenOpenResult.content;

  if (facturenOpenResult.status === 'OK') {
    const facturenOpen = facturenOpenResult.content?.facturen ?? [];
    const openFacturenContentSorted: AfisFacturenResponse = {
      count: facturenOpenResult.content?.count ?? 0,
      facturen: facturenOpen.sort(
        firstBy(function (factuur: AfisFactuur) {
          return factuur.status === 'herinnering' ? -1 : 1;
        })
          .thenBy(function (factuur: AfisFactuur) {
            return factuur.status === 'openstaand' ? -1 : 1;
          })
          .thenBy(dateSort('paymentDueDate', 'asc'))
      ),
    };
    openFacturenContent = openFacturenContentSorted;
  }

  const facturenOverview: AfisFacturenByStateResponse = {
    open: openFacturenContent ?? null,
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

export const forTesting = {
  determineFactuurStatus,
  determineFactuurStatusDescription,
  fetchAfisFacturenDeelbetalingen,
  isDownloadAvailable,
  formatFactuurRequestURL,
  getAccountingDocumentTypesFilter,
  getAmountOwed,
  getFactuurnummer,
  replaceXmlNulls,
  transformDeelbetalingenResponse,
  transformFacturen,
  transformFactuur,
};

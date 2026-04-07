import { isToday } from 'date-fns/isToday';
import { parseISO } from 'date-fns/parseISO';
import { Decimal } from 'decimal.js';
import { generatePath } from 'react-router';
import slug from 'slugme';
import thenby from 'thenby';

import { getAfisApiConfig, getFeedEntryProperties } from './afis-helpers.ts';
import { featureToggle, routes } from './afis-service-config.ts';
import type {
  AfisFactuurState,
  AfisFacturenParams,
  AccountingDocumentType,
  AfisInvoicesPartialPaymentsSource,
  AfisFactuurDeelbetalingen,
  AfisFactuurPropertiesSource,
  XmlNullable,
  AfisFactuur,
  AfisInvoicesSource,
  AfisFacturenResponse,
  AfisFacturenOverviewResponse,
  AfisFactuurTermijn,
} from './afis-types.ts';
import { routeConfig } from '../../../client/pages/Thema/Afis/Afis-thema-config.ts';
import {
  apiErrorResult,
  apiSuccessResult,
  getFailedDependencies,
  getSettledResult,
  type ApiResponse,
} from '../../../universal/helpers/api.ts';
import {
  dateSort,
  defaultDateFormat,
  isDateInPast,
} from '../../../universal/helpers/date.ts';
import { toDateFormatted } from '../../../universal/helpers/date.ts';
import {
  displayAmount,
  capitalizeFirstLetter,
} from '../../../universal/helpers/text.ts';
import { entries, uniqueArray } from '../../../universal/helpers/utils.ts';
import { encryptSessionIdWithRouteIdParam } from '../../helpers/encrypt-decrypt.ts';
import {
  getRequestParamsFromQueryString,
  requestData,
} from '../../helpers/source-api-request.ts';
import { generateFullApiUrlBFF } from '../../routing/route-helpers.ts';
import { captureMessage, trackEvent } from '../monitoring.ts';

const DEFAULT_PROFIT_CENTER_NAME = 'Gemeente Amsterdam';
const AFIS_MAX_FACTUREN_TOP = 2000;
const FACTUUR_DOCUMENT_ID_LENGTH = 10;
const AFIS_FACTUUR_REQUEST_API_PATH =
  '/API/ZFI_OPERACCTGDOCITEM_CDS/ZFI_OPERACCTGDOCITEM';

export const FACTUUR_STATE_KEYS: AfisFactuurState[] = [
  'open',
  'afgehandeld',
  'overgedragen',
];

const ACCOUNTING_DOCUMENT_TYPES_DEFAULT: AccountingDocumentType[] = [
  'DR',
  'DE',
  'DM',
  'DV',
  'DG',
  'DF',
  'DW',
];

const accountingDocumentTypesByState: Record<
  AfisFacturenParams['state'],
  AccountingDocumentType[]
> = {
  open: ACCOUNTING_DOCUMENT_TYPES_DEFAULT,
  afgehandeld: ACCOUNTING_DOCUMENT_TYPES_DEFAULT,
  overgedragen: ACCOUNTING_DOCUMENT_TYPES_DEFAULT,
  afgehandeldeIncassoTermijnen: ACCOUNTING_DOCUMENT_TYPES_DEFAULT,
  deelbetalingen: ['AB', 'BA'],
};

const select = `$select=IsCleared,ReverseDocument,Paylink,PostingDate,AccountingDocumentCreationDate,ProfitCenterName,DocumentReferenceID,AccountingDocument,AmountInBalanceTransacCrcy,NetDueDate,DunningLevel,DunningBlockingReason,SEPAMandate,ClearingDate,PaymentMethod,PaymentTerms`;

const selectFieldsQueryByState: Record<AfisFacturenParams['state'], string> = {
  open: select,
  afgehandeld: select,
  overgedragen: select,
  afgehandeldeIncassoTermijnen: select,
  deelbetalingen: '$select=AmountInBalanceTransacCrcy,InvoiceReference',
};

const orderByQueryByState: Record<AfisFacturenParams['state'], string> = {
  open: '$orderby=NetDueDate asc, PostingDate asc',
  afgehandeldeIncassoTermijnen: '$orderby=NetDueDate asc, PostingDate asc',
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

function getIncludeAccountingDocumentIdsFilter(params: AfisFacturenParams) {
  if (!params.includeAccountingDocumentIds?.length) {
    return '';
  }
  const docIdFilters = params.includeAccountingDocumentIds
    .map((type) => `AccountingDocument eq '${type}'`)
    .join(' or ');

  return ` and (${docIdFilters})`;
}

function getExcludeAccountingDocumentIdsFilter(params: AfisFacturenParams) {
  if (!params.excludeAccountingDocumentIds?.length) {
    return '';
  }
  const docIdFilters = params.excludeAccountingDocumentIds
    .map((type) => `AccountingDocument ne '${type}'`)
    .join(' and ');

  return ` and (${docIdFilters})`;
}

function getDateRangeFilter(params: AfisFacturenParams) {
  if (!params.dateFrom && !params.dateTo) {
    return '';
  }

  let dateFilter = '';
  if (params.dateFrom) {
    dateFilter += ` and (AccountingDocumentCreationDate ge datetime'${params.dateFrom}')`;
  }
  if (params.dateTo) {
    dateFilter += ` and (AccountingDocumentCreationDate le datetime'${params.dateTo}')`;
  }
  return dateFilter;
}

function getFactuurRequestQueryParams(
  params: AfisFacturenParams
): Record<string, string> {
  const filters: Record<AfisFacturenParams['state'], string> = {
    // Openstaaand (met betaallink of sepamandaat)
    open: `$filter=Customer eq '${params.businessPartnerID}' and IsCleared eq false`,

    // Alle resterende afgehandelde termijnen so we can display a full set of termijnen
    afgehandeldeIncassoTermijnen: `$filter=Customer eq '${params.businessPartnerID}' and PaymentTerms gt 'B' and SEPAMandate ne '' and IsCleared eq true and (DunningLevel ne '3' or ReverseDocument ne '')`,

    // Afgehandeld (ge-incasseerd, betaald, geannuleerd)
    afgehandeld: `$filter=Customer eq '${params.businessPartnerID}' and IsCleared eq true and (DunningLevel ne '3' or ReverseDocument ne '')`,

    // Overgedragen aan belastingen
    overgedragen: `$filter=Customer eq '${params.businessPartnerID}' and IsCleared eq true and DunningLevel eq '3'`,

    // Deelbetalingen
    deelbetalingen: `$filter=Customer eq '${params.businessPartnerID}' and IsCleared eq false and InvoiceReference ne ''`,
  };

  const top = params.top
    ? Math.min(parseInt(params.top, 10), AFIS_MAX_FACTUREN_TOP)
    : AFIS_MAX_FACTUREN_TOP;
  const query = `?$inlinecount=allpages&${filters[params.state]}${getDateRangeFilter(params)}${getAccountingDocumentTypesFilter(params.state)}${getIncludeAccountingDocumentIdsFilter(params)}${getExcludeAccountingDocumentIdsFilter(params)}&${selectFieldsQueryByState[params.state]}&${orderByQueryByState[params.state]}&$top=${top}`;

  return getRequestParamsFromQueryString(query);
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
        acc[factuurNummer] = new Decimal(0);
      }

      if (deelbetaling.AmountInBalanceTransacCrcy) {
        acc[factuurNummer] = acc[factuurNummer].plus(
          deelbetaling.AmountInBalanceTransacCrcy
        );
      }
    }

    return acc;
  }, deelbetalingAmountByFactuurnummer);
}

async function fetchAfisFacturenDeelbetalingen(
  params: AfisFacturenParams
): Promise<ApiResponse<AfisFactuurDeelbetalingen | null>> {
  const config = await getAfisApiConfig({
    params: getFactuurRequestQueryParams(params),
    formatUrl: ({ url }) => url + AFIS_FACTUUR_REQUEST_API_PATH,
    transformResponse: transformDeelbetalingenResponse,
  });

  return requestData<AfisFactuurDeelbetalingen>(config);
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
  );
  return factuurNummer;
}

function getFactuurDocumentId(id: string) {
  return id.padStart(FACTUUR_DOCUMENT_ID_LENGTH, '0');
}

function isFactuurCreatedInAFIS(factuurDocumentId: string) {
  return factuurDocumentId.length >= FACTUUR_DOCUMENT_ID_LENGTH;
}

function getInvoiceAmount(
  invoice: Pick<AfisFactuurPropertiesSource, 'AmountInBalanceTransacCrcy'>,
  deelbetalingAmount?: Decimal
): Decimal {
  let amountInBalanceTransacCrcy = new Decimal(
    invoice.AmountInBalanceTransacCrcy ?? 0
  );

  if (deelbetalingAmount) {
    amountInBalanceTransacCrcy =
      amountInBalanceTransacCrcy.plus(deelbetalingAmount); // is a negative value
  }

  return amountInBalanceTransacCrcy;
}

function transformFactuur(
  state: AfisFactuurState,
  sourceInvoice: XmlNullable<AfisFactuurPropertiesSource>,
  sessionID: SessionID,
  deelbetalingen?: AfisFactuurDeelbetalingen
): AfisFactuur {
  const invoice = replaceXmlNulls(sourceInvoice);
  const accountingDocumentId = String(invoice.AccountingDocument);
  const factuurDocumentId = getFactuurDocumentId(accountingDocumentId);
  const factuurNummer = getFactuurnummer(invoice);

  let factuurDocumentIdEncrypted: string | null = null;

  if (isFactuurCreatedInAFIS(accountingDocumentId)) {
    factuurDocumentIdEncrypted = encryptSessionIdWithRouteIdParam(
      sessionID,
      factuurDocumentId
    );
  }

  const deelbetaling = deelbetalingen?.[factuurNummer];
  const hasDeelbetaling = !!deelbetaling;
  const eMandateId = invoice.SEPAMandate ?? null;
  const amountOriginal = getInvoiceAmount(invoice);
  const amountPayed = getInvoiceAmount(invoice, deelbetaling);
  const amountPayedFormatted = `€ ${amountPayed ? displayAmount(parseFloat(amountPayed.toFixed(2))) : '0,00'}`;
  const amountOriginalFormatted = `€ ${amountOriginal ? displayAmount(parseFloat(amountOriginal.toFixed(2))) : '0,00'}`;

  let debtClearingDate = null;
  let debtClearingDateFormatted = null;

  if (invoice.ClearingDate) {
    debtClearingDate = invoice.ClearingDate;
    debtClearingDateFormatted = defaultDateFormat(debtClearingDate);
  }

  const status = determineFactuurStatus(invoice, amountPayed, hasDeelbetaling);

  const documentDownloadLink = factuurDocumentIdEncrypted
    ? generateFullApiUrlBFF(routes.protected.AFIS_DOCUMENT_DOWNLOAD, [
        { id: factuurDocumentIdEncrypted },
      ])
    : null;

  const factuur: AfisFactuur = {
    id: slug(
      `${factuurDocumentId}-${factuurNummer}-${invoice.NetDueDate ?? invoice.PostingDate}`
    ),
    afzender: invoice.ProfitCenterName || DEFAULT_PROFIT_CENTER_NAME,
    datePublished:
      invoice.AccountingDocumentCreationDate || invoice.PostingDate || null,
    datePublishedFormatted: toDateFormatted(
      invoice.AccountingDocumentCreationDate || invoice.PostingDate
    ),
    paymentDueDate: invoice.NetDueDate,
    paymentDueDateFormatted: defaultDateFormat(invoice.NetDueDate),
    debtClearingDate,
    debtClearingDateFormatted,
    amountPayed: amountPayed.toFixed(2),
    amountPayedFormatted,
    amountOriginal: amountOriginal.toFixed(2),
    amountOriginalFormatted,
    factuurNummer,
    factuurDocumentId,
    status,
    statusDescription: '',
    paylink: invoice.Paylink ? invoice.Paylink : null,
    eMandateId,
    documentDownloadLink,
    link: {
      to: generatePath(routeConfig.detailPage.path, { state, factuurNummer }),
      title: `Factuur ${factuurNummer}`,
    },
  };

  factuur.statusDescription = determineFactuurStatusDescription(
    factuur,
    !!invoice.IsCleared,
    hasDeelbetaling
  );

  return factuur;
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

function getTermijnPaymentStatus(factuur: AfisFactuur): string {
  if (factuur.debtClearingDate) {
    return `Betaald op ${factuur.debtClearingDateFormatted}`;
  }
  if (
    factuur.paymentDueDate &&
    isDateInPast(factuur.paymentDueDate, new Date())
  ) {
    return `Openstaand - termijn verstreken`;
  }

  return 'Gepland';
}

function getTermijnStatusDescription(
  factuur: AfisFactuur,
  term: string
): string {
  if (factuur.debtClearingDate) {
    return `${term} - ${factuur.amountOriginalFormatted}\nBetaald op ${factuur.debtClearingDateFormatted}`;
  }
  if (
    factuur.paymentDueDate &&
    isDateInPast(factuur.paymentDueDate, new Date())
  ) {
    return `${term} - ${factuur.amountOriginalFormatted}\nOpenstaand - termijn verstreken`;
  }

  return `${term} - ${factuur.amountOriginalFormatted} Gepland`;
}

function combineTermijnFacturen(facturen: AfisFactuur[]): AfisFactuur[] {
  const grouped: { [key: string]: AfisFactuur[] } = {};

  for (const factuur of facturen) {
    const key = factuur.factuurNummer;
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(factuur);
  }

  const facturenUpdated: AfisFactuur[] = [];

  for (const facturen of Object.values(grouped)) {
    // Multiple facturen with the same factuurNummer means that these are termijn facturen.
    // We combine these into one main factuur with the rest as termijnen to be able to display them in a grouped way on the frontend.
    if (facturen.length > 1) {
      const facturenSorted = facturen.toSorted(
        dateSort('paymentDueDate', 'asc')
      );

      const termijnen: AfisFactuurTermijn[] = facturenSorted.map(
        (factuur, index) => {
          const term = `${index + 1}`.padStart(2, '0');
          return {
            id: factuur.id,
            paymentDueDate: factuur.paymentDueDate,
            paymentDueDateFormatted: factuur.paymentDueDateFormatted,
            debtClearingDate: factuur.debtClearingDate,
            debtClearingDateFormatted: factuur.debtClearingDateFormatted,
            amountOriginal: factuur.amountOriginal,
            amountOriginalFormatted: factuur.amountOriginalFormatted,
            term,
            statusDescription: getTermijnStatusDescription(factuur, term),
            paymentStatus: getTermijnPaymentStatus(factuur),
          };
        }
      );
      const lastTermijn = facturenSorted.at(-1)!;
      facturenUpdated.push({
        // Add the last factuur as "main" factuur. Assign the rest of the termijn facturen as termijnen to this main factuur.
        // We do this because the final payment due date should be the last one.
        ...lastTermijn,
        termijnen,
        statusDescription: `Factuur in ${termijnen.length} termijnen${lastTermijn.eMandateId ? ' per automatische incasso' : ''}.`,
      });
    } else {
      // These are not termijnen facturen, so we just add them as they are.
      facturenUpdated.push(...facturen);
    }
  }

  return facturenUpdated;
}

function transformFacturen(
  state: AfisFactuurState,
  responseData: AfisInvoicesSource,
  sessionID: SessionID,
  deelbetalingen?: AfisFactuurDeelbetalingen
): AfisFacturenResponse {
  const feedProperties = getFeedEntryProperties(responseData);
  const count = responseData?.feed?.count ?? feedProperties.length;
  const facturenTransformed = feedProperties
    .filter((invoiceProperties) => {
      return featureToggle.filterOutUndownloadableFacturenActive
        ? isDownloadAvailable(
            invoiceProperties.AccountingDocumentCreationDate ||
              invoiceProperties.PostingDate
          )
        : true;
    })
    .map((invoiceProperties) => {
      return transformFactuur(
        state,
        invoiceProperties,
        sessionID,
        deelbetalingen
      );
    });

  return {
    count,
    state,
    facturen: facturenTransformed,
  };
}

/** Checks if a factuur is available for download.
 *
 * A factuur can only be downloaded after a certain time on the day it was created.
 * This because PDF's of invoices are generated by a batch job running at a later time.
 * */
function isDownloadAvailable(documentDate: string): boolean {
  if (!documentDate) {
    // Return true if we cannot determine the documentDate.
    // This should not be the case. However if it does happen we at least show the factuur to the user.
    return true;
  }

  const dateCreated = parseISO(documentDate);
  const now = new Date();

  const isCreatedInTheFuture = dateCreated.getTime() > now.getTime();
  if (isCreatedInTheFuture) {
    return false;
  }

  if (isToday(dateCreated)) {
    const FACTUUR_AVAILABLE_AFTER_N_OCLOCK = 19;
    return now.getHours() >= FACTUUR_AVAILABLE_AFTER_N_OCLOCK;
  }

  return true;
}

const DUNNING_BLOCKING_LEVEL_OVERGEDRAGEN_AAN_BELASTINGEN = 3;
const paymentTermsRegex = /(B|0)\d{3}/;

function determineFactuurStatus(
  sourceInvoice: AfisFactuurPropertiesSource,
  amountPayed: Decimal,
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

    case amountPayed.lt(0):
      return 'geld-terug';

    case !!sourceInvoice.NetDueDate &&
      sourceInvoice.IsCleared === false &&
      isDateInPast(sourceInvoice.NetDueDate, new Date()) &&
      (sourceInvoice.DunningLevel == 1 || sourceInvoice.DunningLevel == 2):
      return 'herinnering';

    // Facturen from 2024 don't seem to have a SepaMandate coupled.
    case featureToggle.termijnFacturenActive &&
      sourceInvoice.PaymentMethod !== 'B' &&
      paymentTermsRegex.test(sourceInvoice.PaymentTerms):
      return 'factuur-in-termijnen';

    case !!sourceInvoice.SEPAMandate && sourceInvoice.PaymentMethod !== 'B':
      return 'automatische-incasso';

    case sourceInvoice.IsCleared === false &&
      sourceInvoice.PaymentMethod === 'B' &&
      !sourceInvoice.Paylink:
      return 'handmatig-betalen';

    case sourceInvoice.IsCleared === false && hasDeelbetaling:
      return 'gedeeltelijke-betaling';

    case sourceInvoice.IsCleared === false:
      return sourceInvoice.Paylink ? 'openstaand' : 'handmatig-betalen';

    case sourceInvoice.IsCleared === true:
      return 'betaald';

    default:
      captureMessage("Error: invoice status 'onbekend' (unknown)", {
        severity: 'error',
      });
      // Unknown status
      return 'onbekend';
  }
}

function determineFactuurStatusDescription(
  factuur: AfisFactuur,
  isCleared: boolean,
  hasDeelbetaling: boolean = false
) {
  const {
    status,
    amountPayedFormatted,
    amountOriginalFormatted,
    debtClearingDateFormatted,
  } = factuur;
  // Openstaand bedrag
  const amountPayed = amountPayedFormatted.replace('-', '');
  // Origineel bedrag
  const amountOriginal = amountOriginalFormatted.replace('-', '');

  switch (status) {
    case 'openstaand':
      return `${amountOriginal} betaal nu`;
    case 'herinnering':
      return `${amountOriginal} betaaltermijn verstreken: gelieve te betalen volgens de instructies in de herinneringsbrief die u per e-mail of post heeft ontvangen.`;
    case 'in-dispuut':
      return `${amountOriginal} in dispuut`;
    case 'gedeeltelijke-betaling':
      return `Uw factuur van ${amountOriginal} is nog niet volledig betaald. Maak het resterend bedrag van ${amountPayed} over onder vermelding van de gegevens op uw factuur.`;
    case 'handmatig-betalen':
      return `Uw factuur is nog niet betaald. Maak het bedrag van ${amountOriginal} over onder vermelding van de gegevens op uw factuur.`;
    case 'geld-terug':
      return `Het bedrag van ${amountOriginal} ${isCleared ? 'is' : 'wordt'} verrekend met openstaande facturen of teruggestort op uw rekening.`;
    case 'betaald':
      return hasDeelbetaling
        ? `Op ${debtClearingDateFormatted} heeft u het gehele bedrag van ${amountOriginal} voldaan.`
        : `${amountOriginal} betaald op ${debtClearingDateFormatted}`;
    case 'factuur-in-termijnen':
    case 'automatische-incasso': {
      if (factuur.eMandateId) {
        return isCleared
          ? `${amountOriginal} is door middel van een automatisch incasso op ${debtClearingDateFormatted} van uw rekening afgeschreven.`
          : `${amountOriginal} wordt automatisch van uw rekening afgeschreven.`;
      }
      return isCleared
        ? `${amountOriginal} betaald op ${debtClearingDateFormatted}`
        : `Uw factuur is nog niet geheel betaald. Maak het bedrag van de resterende termijn(en) over onder vermelding van de gegevens op uw factuur.`;
    }

    case 'geannuleerd':
      return `${amountOriginal} geannuleerd op ${debtClearingDateFormatted}`;
    case 'overgedragen-aan-belastingen':
      return `${amountOriginal} is overgedragen aan het incasso- en invorderingstraject van directie Belastingen op ${debtClearingDateFormatted}`;
    default:
      return capitalizeFirstLetter(status ?? '');
  }
}

export async function fetchAfisFacturen(
  sessionID: SessionID,
  params: AfisFacturenParams
): Promise<ApiResponse<AfisFacturenResponse | null>> {
  let deelbetalingen: AfisFactuurDeelbetalingen | undefined;

  if (params.state === 'open' || params.state === 'afgehandeld') {
    const facturenDeelbetalingenResponse =
      await fetchAfisFacturenDeelbetalingen({
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

  const config = await getAfisApiConfig({
    params: getFactuurRequestQueryParams(params),
    formatUrl: ({ url }) => url + AFIS_FACTUUR_REQUEST_API_PATH,
    transformResponse: (responseData) =>
      transformFacturen(params.state, responseData, sessionID, deelbetalingen),
  });

  return requestData<AfisFacturenResponse>(config);
}

function getTermijnFactuurAccountingDocumentIds(
  facturen: AfisFactuur[]
): string[] {
  return uniqueArray(
    facturen
      .filter((factuur) => 'factuur-in-termijnen' === factuur.status)
      .map((factuur) => factuur.factuurNummer)
  );
}

async function fetchAfisOpenFacturenIncludingAfgehandeldeTermijnFacturen(
  sessionID: SessionID,
  params: Omit<AfisFacturenParams, 'state'>
): Promise<ApiResponse<AfisFacturenResponse>> {
  const facturenOpenResponse = await fetchAfisFacturen(sessionID, {
    state: 'open',
    businessPartnerID: params.businessPartnerID,
  });

  if (facturenOpenResponse.status !== 'OK') {
    return facturenOpenResponse;
  }

  if (!featureToggle.termijnFacturenActive) {
    return facturenOpenResponse as ApiResponse<AfisFacturenResponse>;
  }

  const includeAccountingDocumentIds = getTermijnFactuurAccountingDocumentIds(
    facturenOpenResponse.content?.facturen ?? []
  );

  // Fetch the possibly afgehandeld termijn facturen. These are the termijnen of which at least 1 termijn is still open.
  // We want to include these termijnen in the open facturen overview, so we can show a complete overview of all termijnen of a factuur.
  // This query does not include termijnen from <= 2024 because these, migrated data, don't have a SEPAMandate coupled.
  const possiblyAfgehandeldTermijnenFacturenResponse = await fetchAfisFacturen(
    sessionID,
    {
      state: 'afgehandeldeIncassoTermijnen',
      businessPartnerID: params.businessPartnerID,
      includeAccountingDocumentIds,
    }
  );

  // Combine the open facturen with the possibly afgehandeld termijn facturen.
  const openAndTermijnFacturenCombined = combineTermijnFacturen(
    [
      facturenOpenResponse.content?.facturen ?? [],
      possiblyAfgehandeldTermijnenFacturenResponse.content?.facturen ?? [],
    ].flat()
  );

  return apiSuccessResult(
    {
      count: openAndTermijnFacturenCombined.length,
      state: 'open',
      facturen: openAndTermijnFacturenCombined,
    },
    getFailedDependencies({
      termijnen: possiblyAfgehandeldTermijnenFacturenResponse,
    })
  );
}

export async function fetchAfisFacturenOverview(
  sessionID: SessionID,
  params: Omit<AfisFacturenParams, 'state' | 'top'>
) {
  // Fetches all open facturen including related afgehandelde termijn facturen.
  const openstaandeFacturenResult =
    await fetchAfisOpenFacturenIncludingAfgehandeldeTermijnFacturen(sessionID, {
      businessPartnerID: params.businessPartnerID,
    });
  const afgehandeldeFacturenRequest = fetchAfisFacturenByState(sessionID, {
    ...params,
    top: '30', // Unlikely but the top 3 facturen could all be afgehandelde termijnfacturen consisting of 10 termijnen each.
    state: 'afgehandeld',
  });
  const overgedragenFacturenRequest = fetchAfisFacturenByState(sessionID, {
    ...params,
    top: '30', // Unlikely but the top 3 facturen could all be overgedragen termijnfacturen consisting of 10 termijnen each.
    state: 'overgedragen',
  });

  const [afgehandeldeFacturenResponse, overgedragenFacturenResponse] =
    await Promise.allSettled([
      afgehandeldeFacturenRequest,
      overgedragenFacturenRequest,
    ]);

  const afgehandeldeFacturenResult = getSettledResult(
    afgehandeldeFacturenResponse
  );
  const overgedragenFacturenResult = getSettledResult(
    overgedragenFacturenResponse
  );

  let openFacturenContent: AfisFacturenResponse | null =
    openstaandeFacturenResult.content;

  if (openstaandeFacturenResult.status === 'OK') {
    const facturenOpen = openFacturenContent?.facturen ?? [];
    const openFacturenContentSorted: AfisFacturenResponse = {
      count: openFacturenContent?.count ?? 0,
      state: 'open',
      facturen: facturenOpen.sort(
        thenby
          .firstBy(function (factuur: AfisFactuur) {
            return factuur.status === 'herinnering' ? -1 : 1;
          })
          .thenBy(function (factuur: AfisFactuur) {
            return [
              'gedeeltelijke-betaling',
              'handmatig-betalen',
              'openstaand',
            ].includes(factuur.status)
              ? -1
              : 1;
          })
          .thenBy(dateSort('paymentDueDate', 'asc'))
      ),
    };
    openFacturenContent = openFacturenContentSorted;
  }

  const facturenOverview: AfisFacturenOverviewResponse = {
    open: openFacturenContent ?? null,
    afgehandeld: afgehandeldeFacturenResult.content ?? null,
    overgedragen: overgedragenFacturenResult.content ?? null,
  };

  const failedDependencies = getFailedDependencies({
    open: openstaandeFacturenResult,
    afgehandeld: afgehandeldeFacturenResult,
    overgedragen: overgedragenFacturenResult,
  });

  if (
    failedDependencies &&
    Object.keys(facturenOverview).every((key) => key in failedDependencies)
  ) {
    return apiErrorResult('Facturen ophalen mislukt.', null);
  }

  // Prepare data for monitoring
  const countByState = entries(facturenOverview).reduce(
    (acc, [state, content]) => {
      if (content === null) {
        return acc;
      }
      return {
        ...acc,
        [state]: content?.count ?? -1,
      };
    },
    {}
  );

  if (Object.keys(countByState).length > 0) {
    // Log the count of facturen per state in Application Insights
    trackEvent('afis-facturen-per-categorie', countByState);
  }

  return apiSuccessResult(facturenOverview, failedDependencies);
}

export async function fetchAfisFacturenByState(
  sessionID: SessionID,
  params: Omit<AfisFacturenParams, 'state'> & {
    state: Exclude<AfisFactuurState, 'open'>;
  }
): Promise<ApiResponse<AfisFacturenResponse | null>> {
  let excludeAccountingDocumentIds: string[] = [];

  if (params.state === 'afgehandeld') {
    // We want to exclude afgehandelde termijnen if we still have them in the open facturen. This happens when some termijnen are afgehandeld and some are open.
    // So we get all open facturen including the afgehandelde termijn facturen and then we can exclude these from the afgehandeld request.
    const openAndRelatedAfgehandeldeTermijnFacturen =
      await fetchAfisOpenFacturenIncludingAfgehandeldeTermijnFacturen(
        sessionID,
        {
          businessPartnerID: params.businessPartnerID,
        }
      );

    if (
      openAndRelatedAfgehandeldeTermijnFacturen.status === 'OK' &&
      openAndRelatedAfgehandeldeTermijnFacturen.content
    ) {
      excludeAccountingDocumentIds = getTermijnFactuurAccountingDocumentIds(
        openAndRelatedAfgehandeldeTermijnFacturen.content.facturen
      );
    }
  }

  const facturenResponse = await fetchAfisFacturen(sessionID, {
    ...params,
    excludeAccountingDocumentIds,
  });

  if (
    facturenResponse.content !== null &&
    facturenResponse.status === 'OK' &&
    ['afgehandeld', 'overgedragen'].includes(params.state)
  ) {
    const facturen = combineTermijnFacturen(
      facturenResponse.content?.facturen ?? []
    );
    if (params.state === 'afgehandeld') {
      facturen.sort(dateSort('debtClearingDate', 'desc'));
    } else {
      facturen.sort(dateSort('paymentDueDate', 'asc'));
    }
    return apiSuccessResult({
      ...facturenResponse.content,
      facturen,
    });
  }

  return facturenResponse;
}

export const forTesting = {
  determineFactuurStatus,
  determineFactuurStatusDescription,
  fetchAfisFacturenDeelbetalingen,
  isDownloadAvailable,
  getFactuurRequestQueryParams,
  getAccountingDocumentTypesFilter,
  getInvoiceAmount,
  getFactuurnummer,
  getFactuurDocumentId,
  replaceXmlNulls,
  transformDeelbetalingenResponse,
  transformFacturen,
  transformFactuur,
};

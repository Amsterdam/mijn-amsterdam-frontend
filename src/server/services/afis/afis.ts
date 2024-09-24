import {
  apiErrorResult,
  apiSuccessResult,
  getFailedDependencies,
  getSettledResult,
} from '../../../universal/helpers/api';
import { defaultDateFormat } from '../../../universal/helpers/date';
import displayAmount, {
  capitalizeFirstLetter,
} from '../../../universal/helpers/text';
import { AuthProfileAndToken } from '../../auth/auth-types';
import { DataRequestConfig } from '../../config/source-api';
import { encryptSessionIdWithRouteIdParam } from '../../helpers/encrypt-decrypt';
import { getApiConfig } from '../../helpers/source-api-helpers';
import { requestData } from '../../helpers/source-api-request';
import { BffEndpoints } from '../../routing/bff-routes';
import { generateFullApiUrlBFF } from '../../routing/route-helpers';
import { captureMessage } from '../monitoring';
import {
  DEFAULT_DOCUMENT_DOWNLOAD_MIME_TYPE,
  DocumentDownloadData,
  DocumentDownloadResponse,
} from '../shared/document-download-route-handler';
import { getFeedEntryProperties } from './afis-helpers';
import {
  AfisApiFeedResponseSource,
  AfisArcDocID,
  AfisBusinessPartnerCommercialResponseSource,
  AfisBusinessPartnerDetails,
  AfisBusinessPartnerDetailsSource,
  AfisBusinessPartnerEmail,
  AfisBusinessPartnerEmailSource,
  AfisBusinessPartnerKnownResponse,
  AfisBusinessPartnerPhone,
  AfisBusinessPartnerPhoneSource,
  AfisBusinessPartnerPrivateResponseSource,
  AfisDocumentDownloadSource,
  AfisDocumentIDSource,
  AfisFactuur,
  AfisFactuurPropertiesSource,
  AfisFactuurState,
  AfisOpenInvoiceSource,
} from './afis-types';

const DEFAULT_PROFIT_CENTER_NAME = 'Gemeente Amsterdam';
export const FACTUUR_STATE_KEYS: AfisFactuurState[] = ['open', 'closed'];

/** Returns if the person logging in, is known in the AFIS source API */
export async function fetchIsKnownInAFIS(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const profileIdentifierType =
    authProfileAndToken.profile.profileType === 'commercial' ? 'KVK' : 'BSN';

  const additionalConfig: DataRequestConfig = {
    method: 'post',
    data: {
      [profileIdentifierType]: authProfileAndToken.profile.id,
    },
    transformResponse: (response) =>
      transformBusinessPartnerisKnownResponse(
        response,
        authProfileAndToken.profile.sid
      ),
    formatUrl(config) {
      return `${config.url}/businesspartner/${profileIdentifierType}/`;
    },
  };

  const dataRequestConfig = getApiConfig('AFIS', additionalConfig);

  const response = await requestData<AfisBusinessPartnerKnownResponse | null>(
    dataRequestConfig,
    requestID,
    authProfileAndToken
  );

  return response;
}

function transformBusinessPartnerisKnownResponse(
  response:
    | AfisBusinessPartnerPrivateResponseSource
    | AfisBusinessPartnerCommercialResponseSource
    | string,
  sessionID: SessionID
) {
  if (!response || typeof response === 'string') {
    return null;
  }

  let isKnown: boolean = false;
  let businessPartnerId: string | null = null;
  let businessPartnerIdEncrypted: string | null = null;

  if ('Record' in response) {
    // Responses can include multiple records or just one, for clarity we treat the response as always having an array of Records here.
    const records = !Array.isArray(response.Record)
      ? [response.Record]
      : response.Record;

    const record = records.find((record) => record.Gevonden === 'Ja');

    if (record) {
      isKnown = true;
      businessPartnerId = record.Zakenpartnernummer ?? null;
    }
  } else if ('BSN' in response) {
    isKnown = response.Gevonden === 'Ja';
    businessPartnerId = response.Zakenpartnernummer ?? null;
  }

  if (businessPartnerId) {
    businessPartnerIdEncrypted = encryptSessionIdWithRouteIdParam(
      sessionID,
      businessPartnerId
    );
  }

  return {
    isKnown,
    businessPartnerIdEncrypted,
  };
}

async function fetchBusinessPartner(
  requestID: RequestID,
  businessPartnerId: string
) {
  const additionalConfig: DataRequestConfig = {
    transformResponse: transformBusinessPartnerDetailsResponse,
    formatUrl(config) {
      return `${config.url}/API/ZAPI_BUSINESS_PARTNER_DET_SRV/A_BusinessPartner?$filter=BusinessPartner eq '${businessPartnerId}'&$select=BusinessPartner, FullName, AddressID, CityName, Country, HouseNumber, HouseNumberSupplementText, PostalCode, Region, StreetName, StreetPrefixName, StreetSuffixName`;
    },
  };

  const businessPartnerRequestConfig = getApiConfig('AFIS', additionalConfig);

  return requestData<AfisBusinessPartnerDetails>(
    businessPartnerRequestConfig,
    requestID
  );
}

function transformBusinessPartnerDetailsResponse(
  response: AfisApiFeedResponseSource<AfisBusinessPartnerDetailsSource>
) {
  const [businessPartnerEntry] = getFeedEntryProperties(response);

  if (businessPartnerEntry) {
    const transformedResponse: AfisBusinessPartnerDetails = {
      businessPartnerId: businessPartnerEntry.BusinessPartner?.toString() ?? '',
      fullName: businessPartnerEntry.FullName ?? null,
      addressId: businessPartnerEntry.AddressID ?? null,
    };

    return transformedResponse;
  }

  return null;
}

async function fetchPhoneNumber(
  requestID: RequestID,
  addressId: AfisBusinessPartnerDetails['addressId']
) {
  const additionalConfig: DataRequestConfig = {
    transformResponse: transformPhoneResponse,
    formatUrl(config) {
      return `${config.url}/API/ZAPI_BUSINESS_PARTNER_DET_SRV/A_AddressPhoneNumber?$filter=AddressID eq '${addressId}'`;
    },
  };

  const businessPartnerRequestConfig = getApiConfig('AFIS', additionalConfig);

  return requestData<AfisBusinessPartnerPhone>(
    businessPartnerRequestConfig,
    requestID
  );
}

function transformPhoneResponse(
  response: AfisApiFeedResponseSource<AfisBusinessPartnerPhoneSource>
) {
  const [phoneNumberEntry] = getFeedEntryProperties(response);

  const transformedResponse: AfisBusinessPartnerPhone = {
    phone: phoneNumberEntry?.InternationalPhoneNumber ?? null,
  };

  return transformedResponse;
}

async function fetchEmail(
  requestID: RequestID,
  addressId: AfisBusinessPartnerDetails['addressId']
) {
  const additionalConfig: DataRequestConfig = {
    transformResponse: transformEmailResponse,
    formatUrl(config) {
      return `${config.url}/API/ZAPI_BUSINESS_PARTNER_DET_SRV/A_AddressEmailAddress?$filter=AddressID eq '${addressId}'`;
    },
  };

  const businessPartnerRequestConfig = getApiConfig('AFIS', additionalConfig);

  return requestData<AfisBusinessPartnerEmail>(
    businessPartnerRequestConfig,
    requestID
  );
}

function transformEmailResponse(
  response: AfisApiFeedResponseSource<AfisBusinessPartnerEmailSource>
) {
  const [emailAddressEntry] = getFeedEntryProperties(response);

  const transformedResponse: AfisBusinessPartnerEmail = {
    email: emailAddressEntry?.SearchEmailAddress ?? null,
  };

  return transformedResponse;
}

/** Fetches the business partner details, phonenumber and emailaddress from the AFIS source API and combines then into a single response */
export async function fetchAfisBusinessPartnerDetails(
  requestID: RequestID,
  businessPartnerId: string
) {
  const detailsResponse = await fetchBusinessPartner(
    requestID,
    businessPartnerId
  );

  if (detailsResponse.status === 'OK' && detailsResponse.content?.addressId) {
    const phoneRequest = fetchPhoneNumber(
      requestID,
      detailsResponse.content.addressId
    );
    const emailRequest = fetchEmail(
      requestID,
      detailsResponse.content.addressId
    );

    const [phoneResponseSettled, emailResponseSettled] =
      await Promise.allSettled([phoneRequest, emailRequest]);

    const phoneResponse = getSettledResult(phoneResponseSettled);
    const emailResponse = getSettledResult(emailResponseSettled);

    const detailsCombined: AfisBusinessPartnerDetails = {
      ...detailsResponse.content,
      ...phoneResponse.content,
      ...emailResponse.content,
    };

    return apiSuccessResult(
      detailsCombined,
      getFailedDependencies({ email: emailResponse, phone: phoneResponse })
    );
  }

  // Returns error response or (partial) success response without phone/email.
  return detailsResponse;
}

type AfisFacturenParams = {
  state: AfisFactuurState;
  businessPartnerID: string;
  top?: string;
};

export async function fetchAfisFacturen(
  requestID: RequestID,
  sessionID: SessionID,
  params: AfisFacturenParams
) {
  const config = getApiConfig('AFIS', {
    formatUrl: ({ url }) => formatFactuurRequestURL(url, params),
    transformResponse: (responseData) =>
      transformFacturen(responseData, sessionID),
  });

  const response = await requestData<AfisFactuur[]>(config, requestID);
  return response;
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
    closed: `$filter=Customer eq '${params.businessPartnerID}' and IsCleared eq true and (DunningLevel ne '3' or ReverseDocument ne '')`,
    // Overgedragen aan belastingen
    transferred: `$filter=Customer eq '${params.businessPartnerID}' and IsCleared eq true and DunningLevel eq '3'`,
  };

  const select = `$select=IsCleared,ReverseDocument,Paylink,PostingDate,ProfitCenterName,DocumentReferenceID,AccountingDocument,AmountInBalanceTransacCrcy,NetPaymentAmount,NetDueDate,DunningLevel,DunningBlockingReason,SEPAMandate,InvoiceReference`;
  const orderBy = '$orderBy=NetDueDate asc, PostingDate asc';

  let query = `?$inlinecount=allpages&${filters[params.state]}&${select}&${orderBy}`;

  if (params.top) {
    query += `&$top=${params.top}`;
  }

  return `${baseUrl}${baseRoute}${query}`;
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
    state: 'closed',
    businessPartnerID: params.businessPartnerID,
    top: '3',
  });

  const facturenTransferredRequest = fetchAfisFacturen(requestID, sessionID, {
    state: 'transferred',
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

  const facturenOverview = {
    open: facturenOpenResult.content ?? [],
    closed: facturenClosedResult.content ?? [],
    transferred: facturenTransferredResult.content ?? [],
  };

  return apiSuccessResult(
    facturenOverview,
    getFailedDependencies({
      open: facturenOpenResult,
      closed: facturenClosedResult,
      transferred: facturenTransferredResult,
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
) {
  const feedProperties = getFeedEntryProperties(responseData);
  return feedProperties.map((invoiceProperties) => {
    return transformFactuur(invoiceProperties, sessionID);
  });
}

function transformFactuur(
  sourceInvoice: XmlNullable<AfisFactuurPropertiesSource>,
  sessionID: SessionID
): AfisFactuur {
  const invoice = replaceXmlNulls(sourceInvoice);
  const factuurDocumentId = invoice.AccountingDocument;
  const factuurNummer = invoice.DocumentReferenceID || factuurDocumentId; // NOTE: This has to be verified with proper test data.
  const factuurDocumentIdEncrypted = encryptSessionIdWithRouteIdParam(
    sessionID,
    factuurDocumentId
  );

  const netPaymentAmountInCents = parseFloat(invoice.NetPaymentAmount) * 100;
  const amountInBalanceTransacCrcyInCents =
    parseFloat(invoice.AmountInBalanceTransacCrcy) * 100;

  const amountOwed =
    (amountInBalanceTransacCrcyInCents + netPaymentAmountInCents) / 100;
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
    documentDownloadLink: generateFullApiUrlBFF(
      BffEndpoints.AFIS_DOCUMENT_DOWNLOAD,
      { id: factuurDocumentIdEncrypted }
    ),
  };
}

type XmlNullable<T extends Record<string, any>> = {
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

function determineFactuurStatus(
  sourceInvoice: AfisFactuurPropertiesSource,
  amountInBalanceTransacCrcyInCents: number
): AfisFactuur['status'] {
  switch (true) {
    // Closed invoices
    case !!sourceInvoice.ReverseDocument:
      return 'geannuleerd';

    case sourceInvoice.IsCleared && sourceInvoice.DunningLevel === 0:
      return 'betaald';

    // Open invoices
    case amountInBalanceTransacCrcyInCents < 0:
      return 'geld-terug';

    case sourceInvoice.DunningBlockingReason === 'D':
      return 'in-dispuut';

    case sourceInvoice.DunningBlockingReason === 'BA':
      return 'gedeeltelijke-betaling';

    case !!sourceInvoice.SEPAMandate:
      return 'automatische-incasso';

    case !sourceInvoice.IsCleared && sourceInvoice.DunningLevel === 0:
      return 'openstaand';

    case sourceInvoice.IsCleared && sourceInvoice.DunningLevel === 3:
      return 'overgedragen-aan-belastingen';

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

export async function fetchAfisDocument(
  requestID: RequestID,
  _authProfileAndToken: AuthProfileAndToken,
  factuurDocumentId: AfisFactuur['factuurDocumentId']
): Promise<DocumentDownloadResponse> {
  const ArchiveDocumentIDResponse = await fetchAfisDocumentID(
    requestID,
    factuurDocumentId
  );
  if (ArchiveDocumentIDResponse.status !== 'OK') {
    return ArchiveDocumentIDResponse;
  }

  const config = getApiConfig('AFIS', {
    formatUrl: ({ url }) => {
      return `${url}/getDebtorInvoice/API_CV_ATTACHMENT_SRV/`;
    },
    method: 'post',
    data: {
      Record: {
        ArchiveDocumentID: ArchiveDocumentIDResponse.id,
        BusinessObjectTypeName: 'BKPF',
      },
    },
    transformResponse: (
      data: AfisDocumentDownloadSource
    ): DocumentDownloadData => {
      if (typeof data?.Record?.attachment !== 'string') {
        throw new Error(
          'Afis document download - no valid response data provided'
        );
      }
      const decodedDocument = Buffer.from(data.Record.attachment, 'base64');
      return {
        data: decodedDocument,
        mimetype: DEFAULT_DOCUMENT_DOWNLOAD_MIME_TYPE,
        filename: data.Record.attachmentname ?? 'factuur.pdf',
      };
    },
  });

  return requestData<DocumentDownloadData>(config, requestID);
}

/** Retrieve an ArcDocID from the AFIS source API.
 *
 *  This ID uniquely identifies a document and can be used -
 *  to download one with our document downloading endpoint for example.
 *
 *  There can be more then one ArcDocID's pointing to the same document.
 */
async function fetchAfisDocumentID(
  requestID: RequestID,
  factuurDocumentId: AfisFactuur['factuurDocumentId']
) {
  const config = getApiConfig('AFIS', {
    formatUrl: ({ url }) => {
      return `${url}/API/ZFI_OPERACCTGDOCITEM_CDS/ZFI_CDS_TOA02?$filter=AccountNumber eq '${factuurDocumentId}'&$select=ArcDocId`;
    },
    transformResponse: (data: AfisDocumentIDSource) => {
      const entryProperties = getFeedEntryProperties(data);
      if (entryProperties.length) {
        return entryProperties[0].ArcDocId;
      }
      return null;
    },
  });

  return requestData<AfisArcDocID>(config, requestID);
}

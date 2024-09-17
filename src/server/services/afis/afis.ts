import {
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
import { encrypt } from '../../helpers/encrypt-decrypt';
import { getApiConfig } from '../../helpers/source-api-helpers';
import { requestData } from '../../helpers/source-api-request';
import { BffEndpoints } from '../../routing/bff-routes';
import { generateFullApiUrlBFF } from '../../routing/route-helpers';
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
    [businessPartnerIdEncrypted] = encrypt(`${sessionID}:${businessPartnerId}`);
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
    open: `$filter=Customer eq '${params.businessPartnerID}' and IsCleared eq false and (DunningLevel eq '0' or DunningBlockingReason eq 'D')`,
    closed: `$filter=Customer eq '${params.businessPartnerID}' and IsCleared eq true and (DunningLevel eq '0' or ReverseDocument ne '')`,
  };

  const select = `$select=ReverseDocument,Paylink,PostingDate,ProfitCenterName,InvoiceNo,AmountInBalanceTransacCrcy,NetPaymentAmount,NetDueDate,DunningLevel,DunningBlockingReason,SEPAMandate`;
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

  const [facturenOpenResponse, facturenClosedResponse] =
    await Promise.allSettled([facturenOpenRequest, facturenClosedRequest]);

  const facturenOpenResult = getSettledResult(facturenOpenResponse);
  const facturenClosedResult = getSettledResult(facturenClosedResponse);

  const facturenOverview = {
    open: facturenOpenResult.content ?? [],
    closed: facturenClosedResult.content ?? [],
  };

  return apiSuccessResult(
    facturenOverview,
    getFailedDependencies({
      open: facturenOpenResult,
      closed: facturenClosedResult,
    })
  );
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

  const [factuurNummerEncrypted] = encrypt(
    `${sessionID}:${sourceInvoice.InvoiceNo}`
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

  return {
    afzender: invoice.ProfitCenterName,
    datePublished: invoice.PostingDate || null,
    datePublishedFormatted: defaultDateFormat(invoice.PostingDate) || null,
    paymentDueDate: invoice.NetDueDate,
    paymentDueDateFormatted: defaultDateFormat(invoice.NetDueDate),
    debtClearingDate,
    debtClearingDateFormatted,
    amountOwed: amountOwed ? amountOwed : 0,
    amountOwedFormatted,
    factuurNummer: invoice.InvoiceNo,
    status: determineFactuurStatus(invoice),
    statusDescription: determineFactuurStatusDescription(
      determineFactuurStatus(invoice),
      amountOwedFormatted,
      debtClearingDateFormatted
    ),
    paylink: invoice.Paylink ? invoice.Paylink : null,
    documentDownloadLink: generateFullApiUrlBFF(
      BffEndpoints.AFIS_DOCUMENT_DOWNLOAD,
      { id: factuurNummerEncrypted }
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
  sourceInvoice: AfisFactuurPropertiesSource
): AfisFactuur['status'] {
  switch (true) {
    // Closed invoices
    case !!sourceInvoice.ReverseDocument:
      return 'geannuleerd';

    case sourceInvoice.IsCleared && sourceInvoice.DunningLevel === 0:
      return 'betaald';

    // Open invoices
    case sourceInvoice.DunningBlockingReason === 'D':
      return 'in-dispuut';

    case sourceInvoice.DunningBlockingReason === 'BA':
      return 'gedeeltelijke-betaling';

    case !!sourceInvoice.SEPAMandate:
      return 'automatische-incasso';

    case !sourceInvoice.IsCleared && sourceInvoice.DunningLevel === 0:
      return 'openstaand';

    // Unknown status
    default:
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
      return `Openstaand: ${amountOwedFormatted} betaal nu`;
    case 'in-dispuut':
      return 'In dispuut';
    case 'gedeeltelijke-betaling':
      return `Automatische incasso - Betaal het openstaande bedrag van ${amountOwedFormatted} via bankoverschrijving`;
    case 'betaald':
      return `Betaald ${debtClearingDateFormatted ? `op ${debtClearingDateFormatted}` : ''}`;
    case 'automatische-incasso':
      return `${amountOwedFormatted} wordt automatisch van uw rekening afgeschreven`;
    default:
      return capitalizeFirstLetter(status ?? '');
  }
}

export async function fetchAfisDocument(
  requestID: RequestID,
  _authProfileAndToken: AuthProfileAndToken,
  factuurNummer: AfisFactuur['factuurNummer']
): Promise<DocumentDownloadResponse> {
  const ArchiveDocumentIDResponse = await fetchAfisDocumentID(
    requestID,
    factuurNummer
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
  factuurNummer: AfisFactuur['factuurNummer']
) {
  const config = getApiConfig('AFIS', {
    formatUrl: ({ url }) =>
      `${url}/API/ZFI_OPERACCTGDOCITEM_CDS/ZFI_CDS_TOA02?$filter=AccountNumber eq '${factuurNummer}'&$select=ArcDocId`,
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

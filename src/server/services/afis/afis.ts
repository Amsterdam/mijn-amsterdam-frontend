import { Request, Response } from 'express';
import {
  apiErrorResult,
  apiSuccessResult,
  getFailedDependencies,
  getSettledResult,
} from '../../../universal/helpers/api';
import { defaultDateFormat } from '../../../universal/helpers/date';
import displayAmount from '../../../universal/helpers/text';
import { BffEndpoints, DataRequestConfig, getApiConfig } from '../../config';
import { AuthProfileAndToken, generateFullApiUrlBFF } from '../../helpers/app';
import { encrypt } from '../../helpers/encrypt-decrypt';
import { requestData } from '../../helpers/source-api-request';
import {
  DEFAULT_DOCUMENT_DOWNLOAD_MIME_TYPE,
  DocumentDownloadData,
  DocumentDownloadResponse,
} from '../shared/document-download-route-handler';
import { getFeedEntryProperties } from './afis-helpers';
import {
  AfisApiFeedResponseSource,
  AfisBusinessPartnerCommercialResponseSource,
  AfisBusinessPartnerDetails,
  AfisBusinessPartnerDetailsSource,
  AfisBusinessPartnerEmail,
  AfisBusinessPartnerEmailSource,
  AfisBusinessPartnerKnownResponse,
  AfisBusinessPartnerPhone,
  AfisBusinessPartnerPhoneSource,
  AfisBusinessPartnerPrivateResponseSource,
  AfisFactuur,
  AfisFactuurPropertiesSource,
  AfisOpenInvoiceSource,
  AfisDocumentIDSource,
  AfisArcDocID,
  AfisDocumentDownloadSource,
  AfisFactuurState,
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
    // RP TODO: sessie id toevoegen en encrypten met het BP ID
    transformResponse: transformBusinessPartnerisKnownResponse,
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
    | string
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
    [businessPartnerIdEncrypted] = encrypt(businessPartnerId);
  }

  return {
    isKnown,
    businessPartnerIdEncrypted,
  };
}

async function fetchBusinessPartner(
  businessPartnerId: AfisBusinessPartnerDetails['businessPartnerId']
) {
  const additionalConfig: DataRequestConfig = {
    transformResponse: transformBusinessPartnerDetailsResponse,
    formatUrl(config) {
      return `${config.url}/API/ZAPI_BUSINESS_PARTNER_DET_SRV/A_BusinessPartner?$filter=BusinessPartner eq '${businessPartnerId}'&$select=BusinessPartner, FullName, AddressID, CityName, Country, HouseNumber, HouseNumberSupplementText, PostalCode, Region, StreetName, StreetPrefixName, StreetSuffixName`;
    },
  };

  const businessPartnerRequestConfig = getApiConfig('AFIS', additionalConfig);
  const requestId = businessPartnerId.toString();

  return requestData<AfisBusinessPartnerDetails>(
    businessPartnerRequestConfig,
    requestId
  );
}

function transformBusinessPartnerDetailsResponse(
  response: AfisApiFeedResponseSource<AfisBusinessPartnerDetailsSource>
) {
  const [businessPartnerEntry] = getFeedEntryProperties(response);

  if (businessPartnerEntry) {
    const address = [
      businessPartnerEntry.StreetName,
      businessPartnerEntry.HouseNumber,
      businessPartnerEntry.HouseNumberSupplementText,
      businessPartnerEntry.PostalCode,
      businessPartnerEntry.CityName,
    ]
      .filter(Boolean)
      .join(' ');

    const transformedResponse: AfisBusinessPartnerDetails = {
      businessPartnerId: businessPartnerEntry.BusinessPartner ?? null,
      fullName: businessPartnerEntry.FullName ?? null,
      address,
      addressId: businessPartnerEntry.AddressID ?? null,
    };

    return transformedResponse;
  }

  return null;
}

async function fetchPhoneNumber(
  addressId: AfisBusinessPartnerDetails['addressId']
) {
  const additionalConfig: DataRequestConfig = {
    transformResponse: transformPhoneResponse,
    formatUrl(config) {
      return `${config.url}/API/ZAPI_BUSINESS_PARTNER_DET_SRV/A_AddressPhoneNumber?$filter=AddressID eq '${addressId}'`;
    },
  };

  const businessPartnerRequestConfig = getApiConfig('AFIS', additionalConfig);
  const requestId = addressId.toString();

  return requestData<AfisBusinessPartnerPhone>(
    businessPartnerRequestConfig,
    requestId
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

async function fetchEmail(addressId: AfisBusinessPartnerDetails['addressId']) {
  const additionalConfig: DataRequestConfig = {
    transformResponse: transformEmailResponse,
    formatUrl(config) {
      return `${config.url}/API/ZAPI_BUSINESS_PARTNER_DET_SRV/A_AddressEmailAddress?$filter=AddressID eq '${addressId}'`;
    },
  };

  const businessPartnerRequestConfig = getApiConfig('AFIS', additionalConfig);
  const requestId = addressId.toString();

  return requestData<AfisBusinessPartnerEmail>(
    businessPartnerRequestConfig,
    requestId
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
  businessPartnerId: AfisBusinessPartnerDetails['businessPartnerId']
) {
  const detailsResponse = await fetchBusinessPartner(businessPartnerId);

  if (detailsResponse.status === 'OK' && detailsResponse.content?.addressId) {
    const phoneRequest = fetchPhoneNumber(detailsResponse.content.addressId);
    const emailRequest = fetchEmail(detailsResponse.content.addressId);

    const [phoneResponseSettled, emailResponseSettled] =
      await Promise.allSettled([phoneRequest, emailRequest]);

    const phoneResponse = getSettledResult(phoneResponseSettled);
    const emailResponse = getSettledResult(emailResponseSettled);

    // Returns combined response
    if (phoneResponse.status === 'OK' && emailResponse.status === 'OK') {
      const detailsCombined: AfisBusinessPartnerDetails = {
        ...detailsResponse.content,
        ...phoneResponse.content,
        ...emailResponse.content,
      };
      return apiSuccessResult(detailsCombined);
    }
    return apiSuccessResult(
      detailsResponse.content,
      getFailedDependencies({ phone: phoneResponse, email: emailResponse })
    );
  }

  // Returns error response or (partial) success response without phone/email.
  return detailsResponse;
}

export type AfisFacturenQueryParams = {
  filter: string;
  select: string;
  orderBy?: string;
  top?: string;
};

export async function fetchAfisFacturen(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken,
  params: { state: AfisFactuurState; businessPartnerID: string; top?: string }
) {
  const config = getApiConfig('AFIS', {
    formatUrl: ({ url }) => {
      let queryParams = {
        filter: `$filter=Customer eq '${params.businessPartnerID}' and IsCleared eq false and (DunningLevel eq '0' or DunningBlockingReason eq 'D')`,
        select:
          '$select=Paylink,PostingDate,ProfitCenterName,InvoiceNo,AmountInBalanceTransacCrcy,NetPaymentAmount,NetDueDate,DunningLevel,DunningBlockingReason,SEPAMandate&$orderBy=NetDueDate asc, PostingDate asc',
        orderBy: '$orderBy=NetDueDate asc, PostingDate asc',
        top,
      };
      if (params.state === 'closed') {
        queryParams = {
          filter: `&$filter=Customer eq '${params.businessPartnerID}' and IsCleared eq true and (DunningLevel eq '0' or ReverseDocument ne '')`,
          select:
            '$select=ReverseDocument,ProfitCenterName,DunningLevel,InvoiceNo,NetDueDate',
          orderBy: '$orderBy=NetDueDate desc',
          top,
        };
      }

      const baseRoute = '/API/ZFI_OPERACCTGDOCITEM_CDS/ZFI_OPERACCTGDOCITEM';

      let query = `?$inlinecount=allpages`;
      if (queryParams.top) {
        query += `&$top=${top}`;
      }
      query += `&${queryParams.filter}&${queryParams.select}&${queryParams.orderBy}`;

      const fullRoute = `${url}${baseRoute}${query}`;
      return fullRoute;
    },
    transformResponse: (data: AfisOpenInvoiceSource) => {
      const feedProperties = getFeedEntryProperties(data);
      return feedProperties.map((invoiceProperties) => {
        return transformFacturen(
          invoiceProperties,
          authProfileAndToken.profile.sid
        );
      });
    },
  });

  const response = await requestData<AfisFactuur[]>(config, requestID);
  return response;
}

function transformFacturen(
  sourceInvoice: XmlNullable<AfisFactuurPropertiesSource>,
  sessionID: AuthProfileAndToken['profile']['sid']
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
  const amountOwedFormatted = amountOwed ? displayAmount(amountOwed) : 0;

  let clearingDate = null;
  let clearingDateFormatted = null;
  if (invoice.ClearingDate) {
    clearingDate = invoice.ClearingDate;
    clearingDateFormatted = defaultDateFormat(clearingDate);
  }

  return {
    afzender: invoice.ProfitCenterName,
    datePublished: invoice.PostingDate || null,
    datePublishedFormatted: defaultDateFormat(invoice.PostingDate) || null,
    dueDate: invoice.NetDueDate,
    dueDateFormatted: defaultDateFormat(invoice.NetDueDate),
    clearingDate,
    clearingDateFormatted,
    amountOwed: amountOwed ? amountOwed : 0,
    amountOwedFormatted: `€ ${amountOwedFormatted}`,
    factuurNummer: invoice.InvoiceNo,
    status: determineFactuurStatus(invoice),
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

/** Replace all values that is an XML Null value with just `null`. */
function replaceXmlNulls(
  sourceInvoice: XmlNullable<AfisFactuurPropertiesSource>
): AfisFactuurPropertiesSource {
  const withoutXmlNullable = Object.entries(sourceInvoice).map(([key, val]) => {
    if (typeof val === 'object' && val !== null && val['@null']) {
      return [key, null];
    }
    return [key, val];
  });
  const invoice: AfisFactuurPropertiesSource =
    Object.fromEntries(withoutXmlNullable);
  return invoice;
}

function determineFactuurStatus(
  fields: AfisFactuurPropertiesSource
): AfisFactuur['status'] {
  if (fields.IsCleared) {
    return geslotenFactuurStatus(fields);
  }
  return openstaandeFactuurStatus(fields);
}

function geslotenFactuurStatus(
  fields: AfisFactuurPropertiesSource
): AfisFactuur['status'] {
  if (fields.ReverseDocument) {
    return 'geannuleerd';
  }

  if (fields.DunningLevel === 0) {
    return 'betaald';
  }

  return 'onbekend';
}

function openstaandeFactuurStatus(
  fields: AfisFactuurPropertiesSource
): AfisFactuur['status'] {
  if (fields.DunningBlockingReason === 'D') {
    return 'in-dispuut';
  }

  if (fields.AccountingDocumentType === 'BA') {
    return 'gedeeltelijke-betaling';
  }

  if (fields.DunningLevel === 0) {
    if (fields.SEPAMandate) {
      return 'automatische-incasso';
    } else {
      return 'openstaand';
    }
  }

  return 'onbekend';
}

export async function fetchAfisDocument(
  requestID: RequestID,
  _authProfileAndToken: AuthProfileAndToken,
  factuurNummer: string
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
      const encodedDocument = Buffer.from(data.Record.attachment, 'base64');
      return {
        data: encodedDocument,
        mimetype: DEFAULT_DOCUMENT_DOWNLOAD_MIME_TYPE,
        filename: data.Record.attachmentname ?? 'factuur.pdf',
      };
    },
  });

  return await requestData<DocumentDownloadData>(config, requestID);
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
      `${url}/API/ZFI_OPERACCTGDOCITEM_CDS/ZFI_CDS_TOA02` +
      `?$filter=AccountNumber eq '${factuurNummer}'&$select=ArcDocId`,
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

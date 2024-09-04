import {
  apiErrorResult,
  apiSuccessResult,
  getFailedDependencies,
  getSettledResult,
} from '../../../universal/helpers/api';
import { defaultDateFormat } from '../../../universal/helpers/date';
import displayAmount from '../../../universal/helpers/text';
import { DataRequestConfig, getApiConfig } from '../../config';
import { AuthProfileAndToken } from '../../helpers/app';
import { encrypt } from '../../helpers/encrypt-decrypt';
import { requestData } from '../../helpers/source-api-request';
import { captureMessage } from '../monitoring';
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
  AfisOpenInvoice,
  AfisClosedInvoice,
  AfisClosedInvoicePropertiesSource,
  AfisOpenInvoicePropertiesSource,
  AfisOpenInvoiceSource,
  AfisCloseInvoiceSource,
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

export async function fetchAfisOpenInvoices(
  requestID: RequestID,
  businessPartnerID: number,
  top?: number
) {
  const fetchOpen = async (requestID: RequestID, config: DataRequestConfig) => {
    const filter = `$filter=Customer eq '${businessPartnerID}' and IsCleared eq false and (DunningLevel eq '0' or DunningBlockingReason eq 'D')`;
    const select =
      '$select=Paylink,PostingDate,ProfitCenterName,InvoiceNo,AmountInBalanceTransacCrcy,NetPaymentAmount,NetDueDate,DunningLevel,DunningBlockingReason,SEPAMandate&$orderBy=NetDueDate asc, PostingDate asc';
    const orderBy = '$orderBy=NetDueDate asc, PostingDate asc';

    let openInvoicesQuery = `${filter}&${select}&${orderBy}`;

    config.url = `${config.url}&${openInvoicesQuery}`;
    config.transformResponse = (data: AfisOpenInvoiceSource) =>
      getFeedEntryProperties(data).map((invoiceProperties) =>
        transformOpenInvoices(businessPartnerID, invoiceProperties)
      );

    const response = await requestData<AfisOpenInvoice[]>(config, requestID);
    return response;
  };

  return await fetchAfisFacturen(fetchOpen, requestID, businessPartnerID, top);
}

function transformOpenInvoices(
  businessPartnerID: number,
  fields: AfisOpenInvoicePropertiesSource
): AfisOpenInvoice {
  const [invoiceNoEncrypted] = encrypt(
    `${businessPartnerID}:${fields.InvoiceNo}`
  );
  const netPaymentAmount = parseInt(fields.NetPaymentAmount);
  // RP TODO: Why should I add these fields together and can I?
  //   AmountInBalanceTransacCrcy can be negative.
  //   And what do both number mean?
  const amount = parseInt(fields.AmountInBalanceTransacCrcy) + netPaymentAmount;

  return {
    profitCenterName: fields.ProfitCenterName,
    postingDate: fields.PostingDate,
    dueDate: fields.NetDueDate,
    dueDateFormatted: defaultDateFormat(fields.NetDueDate),
    amount,
    amountFormatted: `€ ${displayAmount(amount)}`,
    invoiceNoEncrypted,
    invoiceStatus: determineOpenInvoiceStatus(
      fields.DunningLevel,
      fields.DunningBlockingReason,
      fields.SEPAMandate,
      netPaymentAmount
    ),
    paylink: fields.Paylink,
  };
}

function determineOpenInvoiceStatus(
  dunningLevel: AfisOpenInvoicePropertiesSource['DunningLevel'],
  dunningBlockingReason: AfisOpenInvoicePropertiesSource['DunningBlockingReason'],
  sepaMandate: AfisOpenInvoicePropertiesSource['SEPAMandate'],
  netPaymentAmount: number
): AfisOpenInvoice['invoiceStatus'] {
  if (dunningLevel === 0 && !sepaMandate && netPaymentAmount > 0) {
    return 'open';
  } else if (dunningLevel === 0 && sepaMandate) {
    return 'automatische-incasso';
  } else if (dunningBlockingReason === 'D') {
    return 'dispuut';
  }

  const invoiceStatus = null;
  // RP TODO: Tellen dit als persoonsgegevens? Zijn de praktische overwegingen genoeg om dit te loggen?
  captureMessage(
    `invoiceStatus could not be determined; setting invoiceStatus to '${invoiceStatus}'\n` +
      `\tDunningBlockingReason = ${dunningBlockingReason}, SEPAMandata = ${sepaMandate}`,
    { severity: 'error' }
  );
  return invoiceStatus;
}

export async function fetchAfisClosedInvoices(
  requestID: RequestID,
  businessPartnerID: number,
  top?: number
) {
  const fetchClosed = async (
    requestID: RequestID,
    config: DataRequestConfig
  ) => {
    const filter = `&$filter=Customer eq '${businessPartnerID}' and IsCleared eq true and (DunningLevel eq '0' or ReverseDocument ne '')`;
    const select =
      '$select=ReverseDocument,ProfitCenterName,DunningLevel,InvoiceNo,NetDueDate';
    const orderBy = '$orderBy=NetDueDate desc';

    let closedInvoicesQuery = `${filter}&${select}&${orderBy}`;
    config.url = `${config.url}${closedInvoicesQuery}`;

    config.transformResponse = (data: AfisCloseInvoiceSource) =>
      getFeedEntryProperties(data).map((invoiceProperties) =>
        transformClosedInvoices(businessPartnerID, invoiceProperties)
      );

    const response = await requestData<AfisClosedInvoice[]>(config, requestID);
    return response;
  };

  return await fetchAfisFacturen(
    fetchClosed,
    requestID,
    businessPartnerID,
    top
  );
}

function transformClosedInvoices(
  businessPartnerID: number,
  fields: AfisClosedInvoicePropertiesSource
): AfisClosedInvoice {
  const [invoiceNoEncrypted] = encrypt(
    `${businessPartnerID}:${fields.InvoiceNo}`
  );
  return {
    profitCenterName: fields.ProfitCenterName,
    dueDate: fields.NetDueDate,
    dueDateFormatted: defaultDateFormat(fields.NetDueDate),
    invoiceNoEncrypted,
    invoiceStatus: determineClosedInvoiceStatus(
      fields.DunningLevel,
      fields.ReverseDocument
    ),
  };
}

function determineClosedInvoiceStatus(
  dunningLevel: AfisClosedInvoicePropertiesSource['DunningLevel'],
  reverseDocument: AfisClosedInvoicePropertiesSource['ReverseDocument']
): AfisClosedInvoice['invoiceStatus'] {
  if (reverseDocument) {
    return 'geannuleerd';
  } else if (dunningLevel === 0) {
    return 'betaald';
  }

  const invoiceStatus = null;
  // RP TODO: Tellen dit als persoonsgegevens? Zijn de praktische overwegingen genoeg om dit te loggen?
  captureMessage(
    `invoiceStatus could not be determined; setting invoiceStatus to '${invoiceStatus}'\n` +
      `\treverseDocument was ${reverseDocument ? 'found' : 'not found'}, DunningLevel = ${dunningLevel}`,
    { severity: 'error' }
  );
  return invoiceStatus;
}

async function fetchAfisFacturen(
  fetchSpecificFacturenFn: (
    requestID: RequestID,
    config: DataRequestConfig,
    businessPartnerID: number
  ) => any,
  requestID: RequestID,
  businessPartnerID: number,
  top?: number
) {
  const invoices_detail_route =
    '/API/ZFI_OPERACCTGDOCITEM_CDS/ZFI_OPERACCTGDOCITEM';
  const config = getApiConfig('AFIS');

  config.url = `${config.url}${invoices_detail_route}?$inlinecount=allpages`;
  if (top) {
    config.url += `&$top=${top.toString()}`;
  }

  return await fetchSpecificFacturenFn(requestID, config, businessPartnerID);
}

export async function fetchAfisInvoiceDocumentID(
  requestID: RequestID,
  businessPartnerID: number
) {
  const config = getApiConfig('AFIS', {
    formatUrl: (url) =>
      `${url}/API/ZFI_OPERACCTGDOCITEM_CDS/ZFI_CDS_TOA02` +
      `?$filter=AccountNumber eq '${businessPartnerID}'&$select=ArcDocId`,
    transformResponse: (data) => {
      const entryProperties = getFeedEntryProperties(data);
      // AccountNumber what is that?
      // - Longer then the businessPartnerID I have in other request
      // - Only get one item at the moment
      // - Link together with factuurnummer?
    },
  });

  const response = await requestData(config, requestID);
}

export async function fetchAfisInvoiceDocumentContent(
  requestID: RequestID,
  archiveDocumentID: string
) {
  const config = getApiConfig('AFIS', {
    method: 'post',
    formatUrl: (url) => `${url}/getDebtorInvoice/API_CV_ATTACHMENT_SRV/`,
    transformResponse: (data) => {
      return data.Record.attachment;
    },
    data: {
      Record: {
        // Optional but maybe handy for linking docs?
        DocumentInfoRecordDocNumber: 'invoiceNo123456789',
        // Good identifier, but keep in mind an invoice can have multiple of these pointing to it.
        ArchiveDocumentID: '89FCDF05B51F1EEEA3BB8E189D924A45',
        BusinessObjectTypeName: 'BKPF',
      },
    },
  });

  const response = await requestData(config, requestID);
}

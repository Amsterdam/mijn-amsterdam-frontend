import {
  apiErrorResult,
  apiSuccessResult,
  getFailedDependencies,
  getSettledResult,
} from '../../../universal/helpers/api';
import { DataRequestConfig, getApiConfig } from '../../config';
import { AuthProfileAndToken } from '../../helpers/app';
import { encrypt } from '../../helpers/encrypt-decrypt';
import { requestData } from '../../helpers/source-api-request';
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
  AfisFactuurOpen,
  AfisFactuurAfgehandeld,
  AfisFactuurAfgehandeldPropertiesSource,
  AfisFactuurOpenPropertiesSource,
  AfisFactuurOpenSource,
  AfisFactuurAfgehandeldSource,
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

export async function fetchAfisOpenFacturen(
  requestID: RequestID,
  businessPartnerID: number,
  top?: number
) {
  if (top && top < 1) {
    return apiErrorResult(
      `Argument top has to be a positive integer; top: ${top}`,
      null
    );
  }

  const INVOICES_DETAIL_ROUTE =
    '/API/ZFI_OPERACCTGDOCITEM_CDS/ZFI_OPERACCTGDOCITEM';

  const config = getApiConfig('AFIS');

  config.url = `${config.url}${INVOICES_DETAIL_ROUTE}`;

  const filter = `$filter=Customer eq '${businessPartnerID}' and IsCleared eq false and (DunningLevel eq '0' or DunningBlockingReason eq 'D')&`;
  const select =
    '$select=Paylink,PostingDate,ProfitCenterName,InvoiceNo,AmountInBalanceTransacCrcy,NetPaymentAmount,NetDueDate,DunningBlockingReason,SEPAMandate&$orderBy=NetDueDate asc, PostingDate asc';
  const orderBy = '$orderBy=NetDueDate asc, PostingDate asc';

  let openInvoicesQuery = `?${filter}&${select}&${orderBy}`;
  if (top) {
    openInvoicesQuery += `&${top.toString()}`;
  }

  config.url = `${config.url}${openInvoicesQuery}`;
  config.transformResponse = (data: AfisFactuurOpenSource) =>
    getFeedEntryProperties(data).map((invoiceProperties) =>
      transformToOpenstaandeFacturen(businessPartnerID, invoiceProperties)
    );

  const response = await requestData<AfisFactuurOpen[]>(config, requestID);
  return response;
}

function transformToOpenstaandeFacturen(
  businessPartnerID: number,
  fields: AfisFactuurOpenPropertiesSource
): AfisFactuurOpen {
  const [invoiceNoEncrypted] = encrypt(
    `${businessPartnerID}:${fields.InvoiceNo}`
  );
  return {
    dunningBlockingReason: fields.DunningBlockingReason,
    profitCenterName: fields.ProfitCenterName,
    sepaMandate: fields.SEPAMandate,
    postingDate: fields.PostingDate,
    netDueDate: fields.NetDueDate,
    netPaymentAmount: fields.NetPaymentAmount,
    amountInBalanceTransacCrcy: fields.AmountInBalanceTransacCrcy,
    invoiceNo: fields.InvoiceNo,
    invoiceNoEncrypted,
    paylink: fields.Paylink,
  };
}

export async function fetchAfisClosedFacturen(
  requestID: RequestID,
  businessPartnerID: number,
  top?: number
) {
  if (top && top < 1) {
    return apiErrorResult(
      `Argument top has to be a positive integer; top: ${top}`,
      null
    );
  }

  const config = getApiConfig('AFIS');

  const invoicesDetailRoute =
    '/API/ZFI_OPERACCTGDOCITEM_CDS/ZFI_OPERACCTGDOCITEM';
  config.url = `${config.url}${invoicesDetailRoute}`;

  const filter = `$filter=Customer eq '${businessPartnerID}' and IsCleared eq true and (DunningLevel eq '0' or ReverseDocument ne '')`;
  const select =
    '$select=ReverseDocument,ProfitCenterName,InvoiceNo,NetDueDate';
  const orderBy = '$orderBy=NetDueDate desc';

  let closedInvoicesQuery = `?${filter}&${select}&${orderBy}`;
  if (top) {
    closedInvoicesQuery += `&${top.toString()}`;
  }

  config.url = `${config.url}${closedInvoicesQuery}`;

  config.transformResponse = (data: AfisFactuurAfgehandeldSource) =>
    getFeedEntryProperties(data).map((invoiceProperties) =>
      transformToAfgehandeldeFacturen(businessPartnerID, invoiceProperties)
    );

  const response = await requestData<AfisFactuurAfgehandeld[]>(
    config,
    requestID
  );
  return response;
}

function transformToAfgehandeldeFacturen(
  businessPartnerID: number,
  fields: AfisFactuurAfgehandeldPropertiesSource
): AfisFactuurAfgehandeld {
  const [invoiceNoEncrypted] = encrypt(
    `${businessPartnerID}:${fields.InvoiceNo}`
  );
  return {
    profitCenterName: fields.ProfitCenterName,
    netDueDate: fields.NetDueDate,
    reverseDocument: fields.ReverseDocument,
    invoiceNo: fields.InvoiceNo,
    invoiceNoEncrypted,
  };
}

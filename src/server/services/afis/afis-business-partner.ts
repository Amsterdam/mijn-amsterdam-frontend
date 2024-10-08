import { getFeedEntryProperties } from './afis-helpers';
import {
  AfisApiFeedResponseSource,
  AfisBusinessPartnerAddressId,
  AfisBusinessPartnerAddressSource,
  AfisBusinessPartnerDetails,
  AfisBusinessPartnerDetailsSource,
  AfisBusinessPartnerDetailsTransformed,
  AfisBusinessPartnerEmail,
  AfisBusinessPartnerEmailSource,
  AfisBusinessPartnerPhone,
  AfisBusinessPartnerPhoneSource,
} from './afis-types';
import {
  apiErrorResult,
  ApiResponse,
  apiSuccessResult,
  getFailedDependencies,
  getSettledResult,
} from '../../../universal/helpers/api';
import { DataRequestConfig } from '../../config/source-api';
import { getApiConfig } from '../../helpers/source-api-helpers';
import { requestData } from '../../helpers/source-api-request';

function transformBusinessPartnerAddressResponse(
  response: AfisApiFeedResponseSource<AfisBusinessPartnerAddressSource>
): string | null {
  const [addressEntry] = getFeedEntryProperties(response);

  if (addressEntry) {
    return addressEntry.AddressID;
  }

  return null;
}

async function fetchBusinessPartnerFullNameAddressId(
  requestID: RequestID,
  businessPartnerId: string
): Promise<ApiResponse<AfisBusinessPartnerAddressId>> {
  const additionalConfig: DataRequestConfig = {
    transformResponse: transformBusinessPartnerAddressResponse,
    formatUrl(config) {
      return `${config.url}/API/ZAPI_BUSINESS_PARTNER_DET_SRV/A_BusinessPartnerAddress?$filter=BusinessPartner eq '${businessPartnerId}'&$select=AddressID`;
    },
  };

  const businessPartnerRequestConfig = getApiConfig('AFIS', additionalConfig);

  return requestData<AfisBusinessPartnerAddressId>(
    businessPartnerRequestConfig,
    requestID
  );
}

function transformBusinessPartnerFullNameResponse(
  response: AfisApiFeedResponseSource<AfisBusinessPartnerDetailsSource>
) {
  const [businessPartnerEntry] = getFeedEntryProperties(response);

  if (businessPartnerEntry) {
    const transformedResponse: AfisBusinessPartnerDetails = {
      fullName: businessPartnerEntry.BusinessPartnerFullName ?? null,
    };

    return transformedResponse;
  }

  return null;
}

async function fetchBusinessPartnerFullName(
  requestID: RequestID,
  businessPartnerId: string
) {
  const additionalConfig: DataRequestConfig = {
    transformResponse: transformBusinessPartnerFullNameResponse,
    formatUrl(config) {
      return `${config.url}/API/ZAPI_BUSINESS_PARTNER_DET_SRV/A_BusinessPartner?$filter=BusinessPartner eq '${businessPartnerId}'&$select=BusinessPartnerFullName`;
    },
  };

  const businessPartnerRequestConfig = getApiConfig('AFIS', additionalConfig);

  return requestData<AfisBusinessPartnerDetails>(
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

async function fetchPhoneNumber(
  requestID: RequestID,
  addressId: AfisBusinessPartnerAddressId
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

function transformEmailResponse(
  response: AfisApiFeedResponseSource<AfisBusinessPartnerEmailSource>
) {
  const [emailAddressEntry] = getFeedEntryProperties(response);

  const transformedResponse: AfisBusinessPartnerEmail = {
    email: emailAddressEntry?.SearchEmailAddress ?? null,
  };

  return transformedResponse;
}

async function fetchEmail(
  requestID: RequestID,
  addressId: AfisBusinessPartnerAddressId
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

/** Fetches the business partner details, phonenumber and emailaddress from the AFIS source API and combines then into a single response */
export async function fetchAfisBusinessPartnerDetails(
  requestID: RequestID,
  businessPartnerId: string
) {
  const fullNameRequest = fetchBusinessPartnerFullName(
    requestID,
    businessPartnerId
  );
  const addressIdRequest = fetchBusinessPartnerFullNameAddressId(
    requestID,
    businessPartnerId
  );

  const [fullNameResult, addressIdResult] = await Promise.allSettled([
    fullNameRequest,
    addressIdRequest,
  ]);

  const fullNameResponse = getSettledResult(fullNameResult);
  const addressIdResponse = getSettledResult(addressIdResult);

  let phoneResponse: ApiResponse<AfisBusinessPartnerPhone | null>;
  let emailResponse: ApiResponse<AfisBusinessPartnerEmail | null>;

  if (addressIdResponse.status === 'OK' && !!addressIdResponse.content) {
    const phoneRequest = fetchPhoneNumber(requestID, addressIdResponse.content);
    const emailRequest = fetchEmail(requestID, addressIdResponse.content);

    const [phoneResponseSettled, emailResponseSettled] =
      await Promise.allSettled([phoneRequest, emailRequest]);

    phoneResponse = getSettledResult(phoneResponseSettled);
    emailResponse = getSettledResult(emailResponseSettled);
  } else {
    phoneResponse = apiErrorResult(
      'Could not get phone, missing required query param addressId',
      null
    );
    emailResponse = apiErrorResult(
      'Could not get email, missing required query param addressId',
      null
    );
  }

  const detailsCombined: AfisBusinessPartnerDetailsTransformed = {
    businessPartnerId,
    ...fullNameResponse.content,
    ...phoneResponse.content,
    ...emailResponse.content,
  };

  return apiSuccessResult(
    detailsCombined,
    getFailedDependencies({
      email: emailResponse,
      phone: phoneResponse,
      fullName: fullNameResponse,
    })
  );
}

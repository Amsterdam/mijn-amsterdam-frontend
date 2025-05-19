import { getAfisApiConfig, getFeedEntryProperties } from './afis-helpers';
import {
  AfisApiFeedResponseSource,
  AfisBusinessPartnerAddress,
  AfisBusinessPartnerAddressSource,
  AfisBusinessPartnerDetails,
  AfisBusinessPartnerDetailsSource,
  AfisBusinessPartnerDetailsTransformed,
  AfisBusinessPartnerEmail,
  AfisBusinessPartnerEmailSource,
  AfisBusinessPartnerPhone,
  AfisBusinessPartnerPhoneSource,
} from './afis-types';
import { FeatureToggle } from '../../../universal/config/feature-toggles';
import {
  apiErrorResult,
  ApiResponse_DEPRECATED,
  apiSuccessResult,
  getFailedDependencies,
  getSettledResult,
} from '../../../universal/helpers/api';
import { getFullAddress } from '../../../universal/helpers/brp';
import { DataRequestConfig } from '../../config/source-api';
import {
  getRequestParamsFromQueryString,
  requestData,
} from '../../helpers/source-api-request';

function transformBusinessPartnerAddressResponse(
  response: AfisApiFeedResponseSource<AfisBusinessPartnerAddressSource>
): AfisBusinessPartnerAddress | null {
  const [addressEntry] = getFeedEntryProperties(response);

  if (addressEntry) {
    const includePostCodeWoonplaats = true;
    const includeLand = true;
    return {
      id: addressEntry.AddressID,
      address: getFullAddress(
        {
          straatnaam: addressEntry.StreetName,
          huisnummer: addressEntry.HouseNumber?.toString() ?? '',
          huisletter: addressEntry.StreetSuffixName, // ? TODO: check if this is correct
          huisnummertoevoeging: addressEntry.HouseNumberSupplementText,
          postcode: addressEntry.PostalCode,
          woonplaatsNaam: addressEntry.CityName,
        },
        includePostCodeWoonplaats,
        includeLand
      ),
    };
  }

  return null;
}

async function fetchBusinessPartnerAddress(
  businessPartnerId: string
): Promise<ApiResponse_DEPRECATED<AfisBusinessPartnerAddress | null>> {
  const additionalConfig: DataRequestConfig = {
    params: getRequestParamsFromQueryString(
      `?$filter=BusinessPartner eq '${businessPartnerId}'&$select=AddressID,CityName,Country,HouseNumber,HouseNumberSupplementText,PostalCode,Region,StreetName,StreetPrefixName,StreetSuffixName`
    ),
    transformResponse: transformBusinessPartnerAddressResponse,
    formatUrl(config) {
      return `${config.url}/API/ZAPI_BUSINESS_PARTNER_DET_SRV/A_BusinessPartnerAddress`;
    },
  };

  const businessPartnerRequestConfig = await getAfisApiConfig(additionalConfig);

  return requestData<AfisBusinessPartnerAddress>(businessPartnerRequestConfig);
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

async function fetchBusinessPartnerFullName(businessPartnerId: string) {
  const additionalConfig: DataRequestConfig = {
    params: getRequestParamsFromQueryString(
      `?$filter=BusinessPartner eq '${businessPartnerId}'&$select=BusinessPartnerFullName`
    ),
    transformResponse: transformBusinessPartnerFullNameResponse,
    formatUrl(config) {
      return `${config.url}/API/ZAPI_BUSINESS_PARTNER_DET_SRV/A_BusinessPartner`;
    },
  };

  const businessPartnerRequestConfig = await getAfisApiConfig(additionalConfig);

  return requestData<AfisBusinessPartnerDetails>(businessPartnerRequestConfig);
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

async function fetchPhoneNumber(addressId: AfisBusinessPartnerAddress['id']) {
  const additionalConfig: DataRequestConfig = {
    transformResponse: transformPhoneResponse,
    params: getRequestParamsFromQueryString(
      `?$filter=AddressID eq '${addressId}'&$select=InternationalPhoneNumber`
    ),
    formatUrl(config) {
      return `${config.url}/API/ZAPI_BUSINESS_PARTNER_DET_SRV/A_AddressPhoneNumber`;
    },
    postponeFetch: !FeatureToggle.afisBusinesspartnerPhoneActive,
  };

  const businessPartnerRequestConfig = await getAfisApiConfig(additionalConfig);

  return requestData<AfisBusinessPartnerPhone>(businessPartnerRequestConfig);
}

function transformEmailResponse(
  response: AfisApiFeedResponseSource<AfisBusinessPartnerEmailSource>
) {
  const [emailAddressEntry] = getFeedEntryProperties(response);

  const transformedResponse: AfisBusinessPartnerEmail = {
    email: emailAddressEntry?.EmailAddress ?? null,
  };

  return transformedResponse;
}

async function fetchEmail(addressId: AfisBusinessPartnerAddress['id']) {
  const additionalConfig: DataRequestConfig = {
    transformResponse: transformEmailResponse,
    params: getRequestParamsFromQueryString(
      `?$filter=AddressID eq '${addressId}'&$select=EmailAddress`
    ),
    formatUrl(config) {
      return `${config.url}/API/ZAPI_BUSINESS_PARTNER_DET_SRV/A_AddressEmailAddress`;
    },
  };

  const businessPartnerRequestConfig = await getAfisApiConfig(additionalConfig);

  return requestData<AfisBusinessPartnerEmail>(businessPartnerRequestConfig);
}

/** Fetches the business partner details, phonenumber and emailaddress from the AFIS source API and combines then into a single response */
export async function fetchAfisBusinessPartnerDetails(
  businessPartnerId: string
) {
  const fullNameRequest = fetchBusinessPartnerFullName(businessPartnerId);
  const addressRequest = fetchBusinessPartnerAddress(businessPartnerId);

  const [fullNameResult, addressResult] = await Promise.allSettled([
    fullNameRequest,
    addressRequest,
  ]);

  const fullNameResponse = getSettledResult(fullNameResult);
  const addressResponse = getSettledResult(addressResult);

  let phoneResponse: ApiResponse_DEPRECATED<AfisBusinessPartnerPhone | null>;
  let emailResponse: ApiResponse_DEPRECATED<AfisBusinessPartnerEmail | null>;

  if (addressResponse.status === 'OK' && addressResponse.content) {
    const phoneRequest = fetchPhoneNumber(addressResponse.content.id);
    const emailRequest = fetchEmail(addressResponse.content.id);

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
    businessPartnerId: businessPartnerId,
    ...addressResponse.content,
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

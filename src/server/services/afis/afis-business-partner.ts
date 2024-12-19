import ibantools from 'ibantools';

import { getAfisApiConfig, getFeedEntryProperties } from './afis-helpers';
import {
  AfisApiFeedResponseSource,
  AfisBusinessPartnerAddress,
  AfisBusinessPartnerAddressSource,
  AfisBusinessPartnerBankAccount,
  AfisBusinessPartnerBankPayload,
  AfisBusinessPartnerDetails,
  AfisBusinessPartnerDetailsSource,
  AfisBusinessPartnerDetailsTransformed,
  AfisBusinessPartnerEmail,
  AfisBusinessPartnerEmailSource,
  AfisBusinessPartnerPhone,
  AfisBusinessPartnerPhoneSource,
  BusinessPartnerId,
  BusinessPartnerIdPayload,
} from './afis-types';
import { FeatureToggle } from '../../../universal/config/feature-toggles';
import {
  apiErrorResult,
  ApiResponse_DEPRECATED,
  ApiSuccessResponse,
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
  businessPartnerId: BusinessPartnerId
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
      firstName: businessPartnerEntry.FirstName ?? null,
      lastName: businessPartnerEntry.LastName ?? null,
    };

    return transformedResponse;
  }

  return null;
}

async function fetchBusinessPartnerFullName(businessPartnerId: BusinessPartnerId): Promise<ApiResponse<AfisBusinessPartnerDetails | null>> {
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
  payload: BusinessPartnerIdPayload
): Promise<ApiSuccessResponse<AfisBusinessPartnerDetailsTransformed>> {
  const businessPartnerId:BusinessPartnerId = payload.businessPartnerId;
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
    businessPartnerId,
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

export async function createBusinessPartnerBankAccount(
  requestID: RequestID,
  payload: AfisBusinessPartnerBankPayload
) {
  const iban = ibantools.extractIBAN(payload.iban);

  if (!iban.accountNumber) {
    throw new Error('Invalid IBAN');
  }

  const createBankAccountPayload: AfisBusinessPartnerBankAccount = {
    BusinessPartner: payload.businessPartnerId,
    BankIdentification: '0001', // How to?
    BankCountryKey: iban.countryCode ?? '',
    BankName: 'ING', // iban.bankIdentifier // TODO: What is this?
    BankNumber: iban.bankIdentifier ?? '',
    SWIFTCode: payload.swiftCode, //
    BankControlKey: '', // TODO: What is this?
    BankAccountHolderName: payload.senderName,
    BankAccountName: '', // TODO: What is this?
    ValidityStartDate: 'Date(1680825600000+0000)', // TODO: check if this is required, we can't possibly know this
    ValidityEndDate: 'Date(253402300799000+0000)', // TODO: check if this is required, we can't possibly know this
    IBAN: payload.iban,
    IBANValidityStartDate: 'Date(1680825600000)', // TODO: What is this?
    BankAccount: iban.accountNumber,
    BankAccountReferenceText: '', // TODO: What is this?
    CollectionAuthInd: false, // TODO: What is this?
    CityName: 'amsterdam', // TODO: What is this?
    AuthorizationGroup: '', // TODO: What is this?
  };

  const additionalConfig: DataRequestConfig = {
    method: 'POST',
    formatUrl(config) {
      return `${config.url}/API/ZAPI_BUSINESS_PARTNER_DET_SRV/A_BusinessPartnerBank`;
    },
    data: createBankAccountPayload,
  };

  const businessPartnerRequestConfig = await getAfisApiConfig(
    additionalConfig,
    requestID
  );

  return requestData<AfisBusinessPartnerEmail>(
    businessPartnerRequestConfig,
    requestID
  );
}

function transformBusinessPartnerBankAccounts(
  responseData: AfisApiFeedResponseSource<AfisBusinessPartnerBankAccount>
) {
  return [];
}

export async function fetchBusinessPartnerBankAccounts(
  requestID: RequestID,
  businessPartnerId: BusinessPartnerId
) {
  const additionalConfig: DataRequestConfig = {
    formatUrl(config) {
      return `${config.url}/API/ZAPI_BUSINESS_PARTNER_DET_SRV/A_BusinessPartnerBank?$filter=BusinessPartner eq '${businessPartnerId}'`;
    },
    transformResponse: transformBusinessPartnerBankAccounts,
  };

  const businessPartnerRequestConfig = await getAfisApiConfig(
    additionalConfig,
    requestID
  );

  return requestData<AfisBusinessPartnerBankAccount[]>(
    businessPartnerRequestConfig,
    requestID
  );
}

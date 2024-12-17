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
import { requestData } from '../../helpers/source-api-request';

const AFIS_IBAN_ACCOUNT_NUMBER_LENGTH = 8;

function transformBusinessPartnerAddressResponse(
  response: AfisApiFeedResponseSource<AfisBusinessPartnerAddressSource>
): AfisBusinessPartnerAddress | null {
  const [addressEntry] = getFeedEntryProperties(response);

  if (addressEntry) {
    const includePostCodeWoonplaats = true;
    const includeLand = true;
    return {
      id: addressEntry.AddressID,
      address: addressEntry,
      fullAddress: getFullAddress(
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
  requestID: RequestID,
  businessPartnerId: BusinessPartnerId
): Promise<ApiResponse<AfisBusinessPartnerAddresss | null>> {
  const additionalConfig: DataRequestConfig = {
    transformResponse: transformBusinessPartnerAddressResponse,
    formatUrl(config) {
      return `${config.url}/API/ZAPI_BUSINESS_PARTNER_DET_SRV/A_BusinessPartnerAddress?$filter=BusinessPartner eq '${businessPartnerId}'&$select=AddressID,CityName,Country,HouseNumber,HouseNumberSupplementText,PostalCode,Region,StreetName,StreetPrefixName,StreetSuffixName`;
    },
  };

  const businessPartnerRequestConfig = await getAfisApiConfig(
    additionalConfig,
    requestID
  );

  return requestData<AfisBusinessPartnerAddress>(
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
      firstName: businessPartnerEntry.FirstName ?? null,
      lastName: businessPartnerEntry.LastName ?? null,
    };

    return transformedResponse;
  }

  return null;
}

async function fetchBusinessPartnerFullName(
  requestID: RequestID,
  businessPartnerId: BusinessPartnerId
): Promise<ApiResponse<AfisBusinessPartnerDetails | null>> {
  const additionalConfig: DataRequestConfig = {
    transformResponse: transformBusinessPartnerFullNameResponse,
    formatUrl(config) {
      return `${config.url}/API/ZAPI_BUSINESS_PARTNER_DET_SRV/A_BusinessPartner?$filter=BusinessPartner eq '${businessPartnerId}'&$select=BusinessPartnerFullName,FirstName,LastName`;
    },
  };

  const businessPartnerRequestConfig = await getAfisApiConfig(
    additionalConfig,
    requestID
  );

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
  addressId: AfisBusinessPartnerAddress['id']
) {
  const additionalConfig: DataRequestConfig = {
    transformResponse: transformPhoneResponse,
    formatUrl(config) {
      return `${config.url}/API/ZAPI_BUSINESS_PARTNER_DET_SRV/A_AddressPhoneNumber?$filter=AddressID eq '${addressId}'&$select=InternationalPhoneNumber`;
    },
    postponeFetch: !FeatureToggle.afisBusinesspartnerPhoneActive,
  };

  const businessPartnerRequestConfig = await getAfisApiConfig(
    additionalConfig,
    requestID
  );

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
    email: emailAddressEntry?.EmailAddress ?? null,
  };

  return transformedResponse;
}

async function fetchEmail(
  requestID: RequestID,
  addressId: AfisBusinessPartnerAddress['id']
) {
  const additionalConfig: DataRequestConfig = {
    transformResponse: transformEmailResponse,
    formatUrl(config) {
      return `${config.url}/API/ZAPI_BUSINESS_PARTNER_DET_SRV/A_AddressEmailAddress?$filter=AddressID eq '${addressId}'&$select=EmailAddress`;
    },
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

/** Fetches the business partner details, phonenumber and emailaddress from the AFIS source API and combines then into a single response */
export async function fetchAfisBusinessPartnerDetails(
  requestID: RequestID,
  payload: BusinessPartnerIdPayload
): Promise<ApiSuccessResponse<AfisBusinessPartnerDetailsTransformed>> {
  const fullNameRequest = fetchBusinessPartnerFullName(
    requestID,
    payload.businessPartnerId
  );
  const addressRequest = fetchBusinessPartnerAddress(
    requestID,
    payload.businessPartnerId
  );

  const [fullNameResult, addressResult] = await Promise.allSettled([
    fullNameRequest,
    addressRequest,
  ]);

  const fullNameResponse = getSettledResult(fullNameResult);
  const addressResponse = getSettledResult(addressResult);

  let phoneResponse: ApiResponse_DEPRECATED<AfisBusinessPartnerPhone | null>;
  let emailResponse: ApiResponse_DEPRECATED<AfisBusinessPartnerEmail | null>;

  if (addressResponse.status === 'OK' && addressResponse.content) {
    const phoneRequest = fetchPhoneNumber(
      requestID,
      addressResponse.content.id
    );
    const emailRequest = fetchEmail(requestID, addressResponse.content.id);

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
    businessPartnerId: payload.businessPartnerId,
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

function extractBankAccountNumberFromIBAN(iban: string) {
  // Extract the last 8 characters from the IBAN to get the account number.
  return iban.slice(-AFIS_IBAN_ACCOUNT_NUMBER_LENGTH);
}

export async function createBusinessPartnerBankAccount(
  requestID: RequestID,
  payload: AfisBusinessPartnerBankPayload
) {
  const iban = ibantools.extractIBAN(payload.iban);
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
    BankAccount: extractBankAccountNumberFromIBAN(payload.iban),
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

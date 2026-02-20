import * as ibantools from 'ibantools';

import {
  formatBusinessPartnerId,
  getAfisApiConfig,
  getFeedEntryProperties,
} from './afis-helpers';
import { featureToggle } from './afis-service-config';
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
  type AfisEMandateBankAccountExistsResponse,
} from './afis-types';
import {
  apiErrorResult,
  ApiResponse_DEPRECATED,
  apiSuccessResult,
  getFailedDependencies,
  getSettledResult,
  type ApiResponse,
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
      address:
        typeof addressEntry === 'object' && 'AddressID' in addressEntry
          ? addressEntry
          : null,
      fullAddress: getFullAddress(
        {
          straatnaam: addressEntry.StreetName,
          huisnummer: addressEntry.HouseNumber?.toString() ?? '',
          huisletter: null, // Not provided by AFIS
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

async function fetchBusinessPartnerFullName(
  businessPartnerId: BusinessPartnerId
): Promise<ApiResponse<AfisBusinessPartnerDetails | null>> {
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
    postponeFetch: !featureToggle.businesspartnerPhoneActive,
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
): Promise<ApiResponse<AfisBusinessPartnerDetailsTransformed>> {
  const businessPartnerId: BusinessPartnerId = payload.businessPartnerId;
  const fullNameRequest = fetchBusinessPartnerFullName(businessPartnerId);
  const addressRequest = fetchBusinessPartnerAddress(businessPartnerId);

  const [fullNameResult, addressResult] = await Promise.allSettled([
    fullNameRequest,
    addressRequest,
  ]);

  const fullNameResponse = getSettledResult(fullNameResult);
  const addressResponse = getSettledResult(addressResult);

  if (
    fullNameResponse.status === 'ERROR' ||
    addressResponse.status === 'ERROR'
  ) {
    return apiErrorResult(
      `Could not get full name or address for business partner ${businessPartnerId}`,
      null
    );
  }

  let phoneResponse: ApiResponse_DEPRECATED<AfisBusinessPartnerPhone | null>;
  let emailResponse: ApiResponse_DEPRECATED<AfisBusinessPartnerEmail | null>;

  if (addressResponse.status === 'OK' && addressResponse.content?.id) {
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
      address: addressResponse,
    })
  );
}

export async function createBusinessPartnerBankAccount(
  payload: AfisBusinessPartnerBankPayload
) {
  if (!ibantools.isValidIBAN(payload.iban)) {
    throw new Error('Create bank account: Invalid IBAN');
  }

  const iban = ibantools.extractIBAN(payload.iban);

  // It's unlikely this will happen because of the IBAN validation above.
  if (!iban.accountNumber) {
    throw new Error('Create bank account: Invalid IBAN Account Number');
  }

  const createBankAccountPayload: AfisBusinessPartnerBankAccount = {
    BusinessPartner: formatBusinessPartnerId(payload.businessPartnerId),
    // We don't maintain a list of banks so we use the bank identifier as name and number.
    BankName: iban.bankIdentifier ?? '',
    BankNumber: iban.bankIdentifier ?? '', // This is not a bankrekeningnummer. Instead it's the number of the bank (id?).
    SWIFTCode: payload.swiftCode,
    BankAccountHolderName: payload.senderName,
    IBAN: payload.iban,
    BankAccount: iban.accountNumber,
    BankCountryKey: iban.countryCode ?? '',
    CollectionAuthInd: true,
    BankAccountReferenceText: `Bankrekening toegevoegd via Mijn Amsterdam voor E-Manaat afdeling ${payload.creditorName ?? 'onbekend'}.`,
  };

  const additionalConfig: DataRequestConfig = {
    method: 'POST',
    responseType: 'text', // AFIS api responds with xml so we prevent axios from trying to parse it as json.
    formatUrl(config) {
      return `${config.url}/BusinessPartner/ZAPI_BUSINESS_PARTNER_DET_SRV/A_BusinessPartnerBank`;
    },
    data: createBankAccountPayload,
  };

  const businessPartnerRequestConfig = await getAfisApiConfig(additionalConfig);

  return requestData<AfisBusinessPartnerBankAccount>(
    businessPartnerRequestConfig
  );
}

export async function fetchCheckIfIBANexists(
  IBAN: AfisBusinessPartnerBankAccount['IBAN'],
  businessPartnerID: BusinessPartnerId
): Promise<ApiResponse<AfisEMandateBankAccountExistsResponse>> {
  const additionalConfig: DataRequestConfig = {
    formatUrl(config) {
      return `${config.url}/API/ZAPI_BUSINESS_PARTNER_DET_SRV/A_BusinessPartnerBank?$filter=IBAN eq '${IBAN}' and BusinessPartner eq '${businessPartnerID}'&$orderBy=BankIdentification desc`;
    },
    transformResponse(
      response: AfisApiFeedResponseSource<AfisBusinessPartnerBankAccount>
    ) {
      return {
        exists: !!getFeedEntryProperties(response).length,
        eMandateCollectionEnabled: !!getFeedEntryProperties(response).findLast(
          (entry) => entry.CollectionAuthInd === true
        ),
      };
    },
  };

  const businessPartnerRequestConfig = await getAfisApiConfig(additionalConfig);

  return requestData<AfisEMandateBankAccountExistsResponse>(
    businessPartnerRequestConfig
  );
}

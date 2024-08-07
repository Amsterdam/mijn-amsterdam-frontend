import { DataRequestConfig, getApiConfig } from '../../config';
import { AuthProfileAndToken } from '../../helpers/app';
import { axiosRequest, requestData } from '../../helpers/source-api-request';
import {
  AfisBusinessPartnerCombinedResponse,
  AFISBusinessPartnerCommercialSourceResponse,
  AfisBusinessPartnerDetailsTransformedResponse,
  AfisBusinessPartnerPhoneTransformedResponse,
  AFISBusinessPartnerPrivateSourceResponse,
  AfisBusinessPartnerResponse,
  BusinessPartnerKnownResponse,
} from './afis-types';
import { AxiosResponse } from 'axios';
import { decrypt, encrypt } from '../../helpers/encrypt-decrypt';

/** Returns if the person logging in is known in the AFIS source API */
export async function fetchIsKnownInAFIS(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const profileIdentifierType =
    authProfileAndToken.profile.profileType === 'commercial' ? 'KVK' : 'BSN';

  const additionalConfig: DataRequestConfig = {
    data: {
      [profileIdentifierType]: authProfileAndToken.profile.id,
    },
    transformResponse: transformBusinessPartnerisKnown,
    formatUrl(config) {
      return `${config.url}/businesspartner/${profileIdentifierType}/`;
    },
  };

  const dataRequestConfig = getApiConfig('AFIS', additionalConfig);

  const response = await requestData<BusinessPartnerKnownResponse | null>(
    dataRequestConfig,
    requestID,
    authProfileAndToken
  );

  return response;
}

function transformBusinessPartnerisKnown(
  response:
    | AFISBusinessPartnerPrivateSourceResponse
    | AFISBusinessPartnerCommercialSourceResponse
    | string
): BusinessPartnerKnownResponse | null {
  if (!response || typeof response === 'string') {
    return null;
  }

  let transformedResponse: BusinessPartnerKnownResponse = {
    isKnown: false,
    businessPartnerIdEncrypted: null,
  };

  if ('Record' in response) {
    if (Array.isArray(response.Record)) {
      transformedResponse.isKnown = response.Record.some(
        (record) => record.Gevonden === 'Ja'
      );
      transformedResponse.businessPartnerIdEncrypted =
        response.Record.find((record) => record.Gevonden === 'Ja')
          ?.Zakenpartnernummer || null;
    } else {
      transformedResponse.isKnown = response.Record.Gevonden === 'Ja';
      transformedResponse.businessPartnerIdEncrypted =
        response.Record.Zakenpartnernummer || null;
    }
  } else if ('BSN' in response) {
    transformedResponse.isKnown = response.Gevonden === 'Ja';
    transformedResponse.businessPartnerIdEncrypted =
      response.Zakenpartnernummer || null;
  } else {
    console.debug("Known keys 'Record' or 'BSN' not found in API response");
    transformedResponse.isKnown = false;
    transformedResponse.businessPartnerIdEncrypted = null;
  }

  const [encryptedId] = encrypt(
    transformedResponse.businessPartnerIdEncrypted || ''
  );

  transformedResponse.businessPartnerIdEncrypted = encryptedId;

  return transformedResponse;
}

/** Fetches the business partner details and phonenumber from the AFIS source API and combines then into a single response */
export async function fetchAfisBusinessPartner(
  requestId: requestID,
  businessPartnerId: string
) {
  const decryptedId = decrypt(businessPartnerId);
  const response =
    await requestData<AfisBusinessPartnerDetailsTransformedResponse>(
      getBusinessDetailsRequestConfig(decryptedId),
      requestId
    );
  return response;
}

async function requestHandler<T>(
  requestConfig: DataRequestConfig,
  businessPartnerId: string
) {
  const urlBusinessPartner = `${requestConfig.url}/API/ZAPI_BUSINESS_PARTNER_DET_SRV/A_BusinessPartner?$filter=BusinessPartner eq '${businessPartnerId}'`;
  let responseBusinessDetailsResponse =
    await axiosRequest.request<AfisBusinessPartnerResponse<AfisBusinessPartnerCombinedResponse> | null>(
      {
        ...requestConfig,
        url: urlBusinessPartner,
      }
    );

  const properties =
    responseBusinessDetailsResponse.data?.feed?.entry[0]?.content?.properties;

  const addressID = properties?.AddressID;

  if (addressID) {
    const urlPhonenumber = `${requestConfig.url}/API/ZAPI_BUSINESS_PARTNER_DET_SRV/A_AddressPhoneNumber?$filter=AddressID eq '${addressID}'`;

    const responsePhonenumber =
      await axiosRequest.request<AfisBusinessPartnerResponse<AfisBusinessPartnerCombinedResponse> | null>(
        {
          ...requestConfig,
          url: urlPhonenumber,
        }
      );

    const transformedResponseDetails = transformRequestDetails(
      responseBusinessDetailsResponse.data
    );

    const transformedResponsePhonenumber = transformRequestPhonenumber(
      responsePhonenumber.data
    );

    if (transformedResponseDetails && transformedResponsePhonenumber) {
      const combinedResponse: AfisBusinessPartnerCombinedResponse = {
        ...transformedResponseDetails,
        ...transformedResponsePhonenumber,
      };

      (responseBusinessDetailsResponse as AxiosResponse).data =
        combinedResponse as any;
    } else {
      responseBusinessDetailsResponse.data = null;
    }
  } else {
    responseBusinessDetailsResponse.data = null;
  }

  delete (responseBusinessDetailsResponse as AxiosResponse).data?.AddressID;

  return <AxiosResponse<T>>responseBusinessDetailsResponse;
}

function getBusinessDetailsRequestConfig(businessPartnerId: string) {
  const additionalConfig: DataRequestConfig = {
    request: (config) => requestHandler(config, businessPartnerId),
    method: 'GET',
  };

  return getApiConfig('AFIS', additionalConfig);
}

function transformRequestDetails(
  response: AfisBusinessPartnerResponse<any> | null
) {
  let transformedResponse: AfisBusinessPartnerDetailsTransformedResponse | null;

  const properties = response?.feed?.entry[0]?.content?.properties;
  if (properties && properties.AddressID) {
    transformedResponse = {
      BusinessPartner: properties.BusinessPartner,
      BusinessPartnerFullName: properties.FullName,
      BusinessPartnerAddress: `${properties.StreetName} ${properties.HouseNumber}${properties.HouseNumberSupplementText ? ' ' + properties.HouseNumberSupplementText + ' ' : ''}${properties.PostalCode} ${properties.CityName}`,
      AddressID: properties.AddressID,
    };
  } else {
    transformedResponse = null;
  }
  return transformedResponse;
}

function transformRequestPhonenumber(
  response: AfisBusinessPartnerResponse<any> | null
) {
  let transformedResponse: AfisBusinessPartnerPhoneTransformedResponse | null;

  const properties = response?.feed?.entry[0]?.content?.properties;
  if (properties) {
    transformedResponse = {
      PhoneNumber: properties.InternationalPhoneNumber,
    };
  } else {
    transformedResponse = null;
  }
  return transformedResponse;
}

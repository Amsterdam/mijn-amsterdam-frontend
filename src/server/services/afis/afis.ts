import { AxiosError } from 'axios';
import { DataRequestConfig, getApiConfig } from '../../config';
import { requestData } from '../../helpers';
import { AuthProfile, AuthProfileAndToken } from '../../helpers/app';
import {
  OathResponseData,
  BusinessPartnerKnownResponse,
  AFISBusinessPartnerPrivateSourceResponse,
  AFISBusinessPartnerCommercialSourceResponse,
} from './afis-types';
import qs from 'qs';

/** Fetch a bearer token for use in succedent requests */
export async function fetchAFISBearerToken(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const baseConfig = {
    data: qs.stringify({
      client_id: process.env.BFF_AFIS_OAUTH_CLIENT_ID,
      grant_type: 'client_credentials',
      client_secret: process.env.BFF_AFIS_OAUTH_CLIENT_SECRET,
    }),
    transformResponse: (responseData: OathResponseData) =>
      `${responseData.token_type} ${responseData.access_token}`,
  };

  const dataRequestConfig = getApiConfig('AFIS_OAUTH', baseConfig);

  const response = await requestData<string>(
    dataRequestConfig,
    requestID,
    authProfileAndToken
  );

  return response;
}

/** Returns if the person logging in is known in the AFIS source API */
export async function fetchIsKnownInAFIS(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const bearerTokenResponse = await fetchAFISBearerToken(
    requestID,
    authProfileAndToken
  );
  if (bearerTokenResponse.status === 'ERROR') {
    return bearerTokenResponse;
  }

  let profileType: 'BSN' | 'KVK' = 'BSN';
  if (authProfileAndToken.profile.profileType === 'commercial') {
    profileType = 'KVK';
  }

  const baseConfig = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: bearerTokenResponse.content,
    },
    data: {
      [profileType]: authProfileAndToken.profile.id,
    },
    transformResponse: transformBusinessPartnerisKnown,
  };

  const dataRequestConfig = getApiConfig('AFIS_BUSINESSPARTNER', baseConfig);

  dataRequestConfig.url = appendBusinessPartnerEndpoint(
    // We know for sure this is defined in an environment variable.
    dataRequestConfig.url!,
    authProfileAndToken.profile
  );

  const response = await requestData<BusinessPartnerKnownResponse | null>(
    dataRequestConfig,
    requestID,
    authProfileAndToken
  );

  return response;
}

function appendBusinessPartnerEndpoint(url: string, authProfile: AuthProfile) {
  switch (authProfile.authMethod) {
    case 'digid':
      return `${url}/BSN/`;
    case 'eherkenning':
      return `${url}/KVK/`;
  }
}

function transformBusinessPartnerisKnown(
  response:
    | AFISBusinessPartnerPrivateSourceResponse
    | AFISBusinessPartnerCommercialSourceResponse
): BusinessPartnerKnownResponse | null {
  if (!response) {
    return null;
  }

  let transformedResponse: BusinessPartnerKnownResponse = { isKnown: false };

  if ('Record' in response) {
    if (Array.isArray(response.Record)) {
      transformedResponse.isKnown = response.Record.some(
        (record) => record.Gevonden === 'Ja'
      );
    } else {
      transformedResponse.isKnown = response.Record.Gevonden === 'Ja';
    }
  } else if ('BSN' in response) {
    transformedResponse.isKnown = response.Gevonden === 'Ja';
  } else {
    console.debug("Known keys 'Record' or 'BSN' not found in API response");
    transformedResponse.isKnown = false;
  }

  return transformedResponse;
}

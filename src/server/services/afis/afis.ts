import { DataRequestConfig, getApiConfig } from '../../config';
import { requestData } from '../../helpers';
import { AuthProfile, AuthProfileAndToken } from '../../helpers/app';
import qs from 'qs';

export type OathResponseData = {
  access_token: string;
  token_type: 'bearer';
  expires_in: number;
};

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

export type JaOfNee = 'Ja' | 'Nee';

/** Business partner private response from external AFIS API */
export type AFISBusinessPartnerPrivateSourceResponse = {
  BSN: number; // RP TODO: shouldnt this be a string? and how to we make sure our json doesnt cut off a leading zero while parsing?
  Gevonden: JaOfNee;
  Zakenpartnernummer?: string;
  Blokkade?: JaOfNee;
  Afnemers_indicatie?: JaOfNee;
};

/** Business partner commercial response from external AFIS API
 *
 *  # Property
 *
 *  Record.KVK - number can start with a zero and is made out of 8 digits
 */

type AFISBusinessPartnerRecord = {
  KVK: number; // RP TODO: Can KVK start with zero's? JA en het bestaat uit 8 cijvers
  Zakenpartnernummer: string;
  Vestigingsnummer?: string;
  Blokkade: JaOfNee;
  Gevonden: JaOfNee;
};

export type AFISBusinessPartnerCommercialSourceResponse = {
  Record: AFISBusinessPartnerRecord | AFISBusinessPartnerRecord[];
};

export type BusinessPartnerKnownResponse = { isKnown: boolean };

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

  const baseConfig: DataRequestConfig = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: bearerTokenResponse.content,
    },
    // RP TODO: eruit trekken
    data: {
      [authProfileAndToken.profile.profileType === 'private' ? 'BSN' : 'KVK']:
        authProfileAndToken.profile.id,
    },
    transformResponse: transformBusinessPartnerisKnown,
  };

  const dataRequestConfig = getApiConfig('AFIS_BUSINESSPARTNER', baseConfig);

  dataRequestConfig.url = appendBusinessPartnerEndpoint(
    dataRequestConfig.url,
    authProfileAndToken.profile
  );

  const response = await requestData<BusinessPartnerKnownResponse>(
    dataRequestConfig,
    requestID,
    authProfileAndToken
  );

  return response;
}

function appendBusinessPartnerEndpoint(
  url: string | undefined,
  authProfile: AuthProfile
) {
  // RP Note: Is there a better place to do a check like this?
  if (!url) {
    throw new Error(
      `url is ${url}, please define this in the ApiConfig (src/server/config.ts)`
    );
  }

  switch (authProfile.authMethod) {
    case 'digid': {
      return url + '/BSN/';
    }
    case 'eherkenning': {
      return url + '/KVK/';
    }
  }
}

function transformBusinessPartnerisKnown(
  response:
    | AFISBusinessPartnerPrivateSourceResponse
    | AFISBusinessPartnerCommercialSourceResponse
): BusinessPartnerKnownResponse {
  switch (true) {
    case 'Record' in response && Array.isArray(response.Record):
      return {
        isKnown: response.Record.some((record) => record.Gevonden === 'Ja'),
      };
    case 'Record' in response && !Array.isArray(response.Record):
      return { isKnown: response.Record.Gevonden === 'Ja' };
    case 'BSN' in response:
      return { isKnown: response.Gevonden === 'Ja' };
  }

  console.debug("Known keys 'Record' or 'BSN' not found in API response");
  return { isKnown: false };
}

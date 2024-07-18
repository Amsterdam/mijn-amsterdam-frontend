import { DataRequestConfig, getApiConfig } from '../../config';
import { AuthProfileAndToken } from '../../helpers/app';
import { requestData } from '../../helpers/source-api-request';
import {
  AFISBusinessPartnerCommercialSourceResponse,
  AFISBusinessPartnerPrivateSourceResponse,
  BusinessPartnerKnownResponse,
} from './afis-types';

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
      return `${config.url}/${profileIdentifierType}/`;
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

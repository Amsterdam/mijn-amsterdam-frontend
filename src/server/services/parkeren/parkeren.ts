import FormData from 'form-data';

import { FeatureToggle } from '../../../universal/config/feature-toggles';
import { apiSuccessResult } from '../../../universal/helpers/api';
import { isMokum } from '../../../universal/helpers/brp';
import { AuthProfileAndToken } from '../../auth/auth-types';
import { getFromEnv } from '../../helpers/env';
import { getApiConfig } from '../../helpers/source-api-helpers';
import { requestData } from '../../helpers/source-api-request';
import { fetchBRP } from '../brp';

export async function fetchParkeren(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const brpData = await fetchBRP(requestID, authProfileAndToken);
  const livesOutsideAmsterdam = !isMokum(brpData?.content);
  const isDigidUser = authProfileAndToken.profile.profileType === 'private';

  const shouldCheckForPermitsOrPermitRequests =
    isDigidUser &&
    livesOutsideAmsterdam &&
    FeatureToggle.parkerenCheckForProductAndPermitsActive;

  let isKnown = true;

  if (shouldCheckForPermitsOrPermitRequests) {
    isKnown = await hasPermitsOrPermitRequests(requestID, authProfileAndToken);
  }

  const url = await fetchSSOURL(requestID, authProfileAndToken);
  return apiSuccessResult({
    isKnown,
    url: url ?? getFromEnv('BFF_PARKEREN_PORTAAL_URL'),
  });
}

async function fetchSSOURL(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const config = getApiConfig('PARKEREN_FRONTOFFICE', {
    formatUrl(requestConfig) {
      return `${requestConfig.url}/sso/get_authentication_url?service=${authProfileAndToken.profile.authMethod}`;
    },
  });

  const response = await requestData<{ url: string }>(config, requestID);

  return response.content?.url;
}

type JWETokenSourceResponse = {
  token: string;
};

async function fetchJWEToken(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const idNumberType =
    authProfileAndToken.profile.profileType === 'private'
      ? 'bsn'
      : 'kvk_number';

  const formData = new FormData();
  formData.append(`data[${idNumberType}]`, authProfileAndToken.profile.id);

  const config = getApiConfig('PARKEREN', {
    method: 'POST',
    formatUrl: (config) => `${config.url}/v1/jwe/create`,
    transformResponse: (response: JWETokenSourceResponse): string => {
      return response.token;
    },
    data: formData,
  });

  return requestData<JWETokenSourceResponse>(config, requestID);
}

/**
 * This function checks whether the user has a parkeren products or permit requests (Vergunning aanvragen).
 *
 * We always return true when something goes wrong as to not deny the user a -
 * potentially useful tile in the frontend.
 */
async function hasPermitsOrPermitRequests(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const userType =
    authProfileAndToken.profile.profileType === 'private'
      ? 'private'
      : 'company';

  const jweTokenResponse = await fetchJWEToken(requestID, authProfileAndToken);
  if (jweTokenResponse.status !== 'OK' || !jweTokenResponse.content) {
    return true;
  }

  const [clientProductsResponse, permitRequestsResponse] = await Promise.all([
    requestData<ClientProductDetailsSourceResponse>(
      getApiConfig('PARKEREN', {
        formatUrl: (config) =>
          `${config.url}/v1/${userType}/client_product_details`,
        method: 'POST',
        data: {
          token: jweTokenResponse.content,
        },
      }),
      requestID
    ),
    requestData<ActivePermitSourceResponse>(
      getApiConfig('PARKEREN', {
        formatUrl: (config) =>
          `${config.url}/v1/${userType}/active_permit_request`,
        method: 'POST',
        data: {
          token: jweTokenResponse.content,
        },
      }),
      requestID
    ),
  ]);

  return (
    clientProductsResponse.status !== 'OK' ||
    permitRequestsResponse.status !== 'OK' ||
    !!clientProductsResponse.content.data.length ||
    !!permitRequestsResponse.content.data.length
  );
}

type BaseSourceResponse<T> = {
  result: 'success' | unknown;
  count: number;
  data: T;
};

type ActivePermitSourceResponse = BaseSourceResponse<
  ActivePermitRequestProps[]
>;

type ActivePermitRequestProps = {
  link: string;
  id: number;
  client_id: number;
  status: string;
  permit_name: string;
  permit_zone: string;
};

type ClientProductDetailsSourceResponse = BaseSourceResponse<
  ClientProductDetailsProps[]
>;

type ClientProductDetailsProps = {
  client_product_id: number;
  object: string;
  client_id: number;
  status: string;
  started_at: string;
  ended_at: string;
  zone: string;
  link: string;
  vrns: string;
};

export const forTesting = { hasPermitsOrPermitRequests };

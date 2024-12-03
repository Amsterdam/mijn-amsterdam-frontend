import FormData from 'form-data';

import { FeatureToggle } from '../../../universal/config/feature-toggles';
import { apiSuccessResult } from '../../../universal/helpers/api';
import { AuthProfileAndToken } from '../../auth/auth-types';
import { getFromEnv } from '../../helpers/env';
import { getApiConfig } from '../../helpers/source-api-helpers';
import { requestData } from '../../helpers/source-api-request';
import { captureMessage } from '../monitoring';

type ParkerenUrlTransformedResponse = {
  isKnown: boolean;
  url: string | null;
};

export async function fetchSSOParkerenURL(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const config = getApiConfig('PARKEREN', {
    formatUrl(requestConfig) {
      return `${requestConfig.url}/sso/get_authentication_url?service=${authProfileAndToken.profile.authMethod}`;
    },
  });

  const response = await requestData<ParkerenUrlTransformedResponse>(
    config,
    requestID
  );

  const fallBackURL = getFromEnv('BFF_PARKEREN_EXTERNAL_FALLBACK_URL');

  let isKnown: boolean;
  if (FeatureToggle.parkerenCheckForProductAndPermitsActive) {
    isKnown = await hasPermitsOrPermitRequests(requestID, authProfileAndToken);
  } else {
    isKnown = true;
  }

  return apiSuccessResult({
    isKnown,
    url: response.content?.url ?? fallBackURL,
  });
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

  const config = getApiConfig('PARKEREN', {
    method: 'POST',
    formatUrl: (config) => `${config.url}/v1/jwe/create`,
    transformResponse: (response: JWETokenSourceResponse): string => {
      return response.token;
    },
    data: new FormData().append(
      `data[${idNumberType}]`,
      authProfileAndToken.profile.id
    ),
  });

  return await requestData<JWETokenSourceResponse>(config, requestID);
}

/**
 * This function checks whether the user has a parkeren products or permit requests
 */
export async function hasPermitsOrPermitRequests(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const userType =
    authProfileAndToken.profile.profileType === 'private'
      ? 'private'
      : 'company';

  const jweTokenResponse = await fetchJWEToken(requestID, authProfileAndToken);
  if (jweTokenResponse.status !== 'OK' || !jweTokenResponse.content) {
    const errMsg = `Parkeren: Error in response. Content:\n${jweTokenResponse.content}`;
    captureMessage(errMsg, { severity: 'error' });
    return false;
  }

  const [clientProductsResponse, permitRequestsResponse] = await Promise.all([
    requestData<{ data: unknown[] }>(
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
    requestData<{ data: unknown[] }>(
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
    !!clientProductsResponse?.content?.data?.length ||
    !!permitRequestsResponse?.content?.data?.length
  );
}

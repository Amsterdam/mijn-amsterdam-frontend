import { FeatureToggle } from '../../../universal/config/feature-toggles';
import { ApiResponse, apiSuccessResult } from '../../../universal/helpers/api';
import { AuthProfileAndToken } from '../../auth/auth-types';
import { DataRequestConfig } from '../../config/source-api';
import { getFromEnv } from '../../helpers/env';
import { getApiConfig } from '../../helpers/source-api-helpers';
import { requestData } from '../../helpers/source-api-request';

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

type TokenSourceResponse = {
  token: JWEToken;
};

type JWEToken = string;

async function fetchJWEToken(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken
): ApiResponse<JWEToken> {
  const config = getApiConfig('PARKEREN', {
    url: '/v1/jwe/create',
    transformResponse: (responseData: TokenSourceResponse): JWEToken => {
      return responseData.token;
    },
  });

  const response = await requestData<TokenSourceResponse>(config, requestID);
  return response;
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

  const [clientProductsResponse, permitRequestsResponse] = await Promise.all([
    requestData<{ data: unknown[] }>(
      getApiConfig('PARKEREN', {
        formatUrl: (config) =>
          `${config.url}/v1/${userType}/client_product_details`,
        method: 'POST',
        data: {
          token: authProfileAndToken.profile.id,
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
          token: authProfileAndToken.profile.id,
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

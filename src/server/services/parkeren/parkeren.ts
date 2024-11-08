import { apiSuccessResult } from '../../../universal/helpers/api';
import { AuthProfileAndToken } from '../../auth/auth-types';
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

  const hasParkeren = await hasPermitsOrPermitRequests(
    requestID,
    authProfileAndToken
  );

  return apiSuccessResult({
    isKnown: hasParkeren,
    url: response.content?.url ?? fallBackURL,
  });
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
          `${config.url}/${userType}/client_product_details`,
      }),
      requestID
    ),
    requestData<{ data: unknown[] }>(
      getApiConfig('PARKEREN', {
        formatUrl: (config) =>
          `${config.url}/${userType}/active_permit_request`,
      }),
      requestID
    ),
  ]);

  return (
    !!clientProductsResponse?.content?.data?.length ||
    !!permitRequestsResponse?.content?.data?.length
  );
}

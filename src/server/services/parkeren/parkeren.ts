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

  /**
    TODO: Remove commercial user override after implementing proper hasParkeren check
    Currently returning true for all commercial users as a temporary solution.
    Remove: `|| authProfileAndToken.profile.profileType === 'commercial'`
   */
  const hasParkeren =
    (await hasPermitsOrPermitRequests(requestID, authProfileAndToken)) ||
    authProfileAndToken.profile.profileType === 'commercial';

  console.log(hasParkeren, 'hasParkeren');
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
  const profileType =
    authProfileAndToken.profile.profileType === 'private'
      ? 'private'
      : 'company';

  const clientProductsConfig = getApiConfig('PARKEREN', {
    formatUrl(requestConfig) {
      return `${requestConfig.url}/${profileType}/client_product_details`;
    },
  });

  const clientProductsResponse = await requestData<{ data: unknown[] }>(
    clientProductsConfig,
    requestID
  );

  const permitRequestsConfig = getApiConfig('PARKEREN', {
    formatUrl(requestConfig) {
      return `${requestConfig.url}/${profileType}/active_permit_request`;
    },
  });

  const permitRequestsResponse = await requestData<{ data: unknown[] }>(
    permitRequestsConfig,
    requestID
  );

  const hasPermits = (clientProductsResponse?.content?.data?.length ?? 0) > 0;
  const hasPermitRequests =
    (permitRequestsResponse?.content?.data?.length ?? 0) > 0;
  console.log(hasPermits, 'hasPermits');
  console.log(hasPermitRequests, 'hasPermitRequests');
  return hasPermits || hasPermitRequests;
}

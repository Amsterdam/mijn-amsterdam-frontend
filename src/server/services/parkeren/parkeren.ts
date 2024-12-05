import FormData from 'form-data';

import { apiSuccessResult } from '../../../universal/helpers/api';
import { AuthProfileAndToken } from '../../auth/auth-types';
import { getFromEnv } from '../../helpers/env';
import { getApiConfig } from '../../helpers/source-api-helpers';
import { requestData } from '../../helpers/source-api-request';
import { captureMessage } from '../monitoring';

export async function fetchParkeren(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken,
  // Mocking this function in different ways per test has issues, so this makes testing way easier.
  hasPermitsOrProductsFn: (
    requestID: RequestID,
    authProfileAndToken: AuthProfileAndToken
  ) => Promise<boolean> = hasPermitsOrProducts
) {
  const [isKnown, url] = await Promise.all([
    hasPermitsOrProductsFn(requestID, authProfileAndToken),
    fetchSSOURL(requestID, authProfileAndToken),
  ]);
  return apiSuccessResult({
    isKnown,
    url,
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

  if (!response.content?.url) {
    return getFromEnv('BFF_PARKEREN_EXTERNAL_FALLBACK_URL');
  }

  return response.content.url;
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
export async function hasPermitsOrProducts(
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
    !!clientProductsResponse?.content?.data?.length ||
    !!permitRequestsResponse?.content?.data?.length
  );
}

type BaseSourceResponse<T> = {
  result: 'success' | unknown;
  count: number;
  data: T;
};

type ActivePermitSourceResponse = BaseSourceResponse<
  Array<{
    link: string;
    id: number;
    client_id: number;
    status: string;
    permit_name: string;
    permit_zone: string;
  }>
>;

type ClientProductDetailsSourceResponse = BaseSourceResponse<
  Array<{
    client_product_id: number;
    object: string;
    client_id: number;
    status: string;
    started_at: string;
    ended_at: string;
    zone: string;
    link: string;
    vrns: string;
  }>
>;

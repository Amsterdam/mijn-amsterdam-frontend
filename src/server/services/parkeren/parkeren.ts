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

  return apiSuccessResult({
    isKnown: true,
    url: response.content?.url ?? fallBackURL,
  });
}

export async function fetchParkerenClientProductDetails(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const profileType =
    authProfileAndToken.profile.profileType === 'private'
      ? 'private'
      : 'company';

  const config = getApiConfig('PARKEREN', {
    formatUrl(requestConfig) {
      return `${requestConfig.url}/${profileType}/client_product_details`;
    },
  });

  const response = await requestData<{ data: unknown[] }>(config, requestID);

  if (response.status === 'OK') {
    return apiSuccessResult({
      data: response.content?.data,
    });
  }

  return response;
}

export async function fetchParkerenActivePermitRequests(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const profileType =
    authProfileAndToken.profile.profileType === 'private'
      ? 'private'
      : 'company';

  const config = getApiConfig('PARKEREN', {
    formatUrl(requestConfig) {
      return `${requestConfig.url}/${profileType}/active_permit_request`;
    },
  });

  const response = await requestData<{ data: unknown[] }>(config, requestID);

  if (response.status === 'OK') {
    return apiSuccessResult({
      data: response.content?.data,
    });
  }

  return response;
}

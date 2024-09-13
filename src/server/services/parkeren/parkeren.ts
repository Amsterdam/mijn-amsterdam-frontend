import { apiSuccessResult } from '../../../universal/helpers/api';
import { getApiConfig } from '../../config';
import { AuthProfileAndToken } from '../../auth/auth-types';
import { getFromEnv } from '../../helpers/env';
import { requestData } from '../../helpers/source-api-request';
import { captureMessage } from '../monitoring';

type ParkerenUrlSourceResponse = {
  url: string;
};

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

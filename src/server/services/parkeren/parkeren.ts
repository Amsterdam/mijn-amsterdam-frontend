import { getApiConfig } from '../../config';
import { AuthProfileAndToken } from '../../helpers/app';
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
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const config = getApiConfig('PARKEREN', {
    formatUrl(requestConfig) {
      return `${requestConfig.url}/sso/get_authentication_url?service=${authProfileAndToken.profile.authMethod}`;
    },
    transformResponse: (
      response: ParkerenUrlSourceResponse
    ): ParkerenUrlTransformedResponse => {
      if (!response.url) {
        captureMessage(
          'Recieved invalid SSO url response; using fallback URL.'
        );
        response.url = getFromEnv('BFF_PARKEREN_EXTERNAL_FALLBACK_URL')!;
      }
      // Parkeren tile is always shown.
      return { isKnown: true, url: response.url };
    },
  });

  return await requestData<ParkerenUrlTransformedResponse>(config, requestID);
}

import { getApiConfig } from '../../config';
import { AuthProfileAndToken } from '../../helpers/app';
import { requestData } from '../../helpers/source-api-request';

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
      return { isKnown: !!response.url, url: response.url };
    },
  });

  return await requestData<ParkerenUrlTransformedResponse>(config, requestID);
}

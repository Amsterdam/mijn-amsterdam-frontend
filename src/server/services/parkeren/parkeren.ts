import { apiErrorResult } from '../../../universal/helpers/api';
import { getApiConfig } from '../../config';
import { AuthProfileAndToken } from '../../helpers/app';
import { requestData } from '../../helpers/source-api-request';

type ParkerenUrlResponseSource = {
  url: string;
};

export async function fetchSSOParkerenURL(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const config = getApiConfig('PARKEREN', {
    formatUrl(requestConfig) {
      return `${requestConfig.url}/sso/get_authentication_url?service=${authProfileAndToken.profile.authMethod}`;
    },
    transformResponse: (response: ParkerenUrlResponseSource) => {
      return response.url;
    },
  });

  return requestData<ParkerenUrlResponse>(config, requestID);
}

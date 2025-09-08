import qs from 'qs';

import type { ApiResponse } from '../../../universal/helpers/api';
import type { DataRequestConfig, SourceApiName } from '../../config/source-api';
import { getApiConfig } from '../../helpers/source-api-helpers';
import { requestData } from '../../helpers/source-api-request';

type TokenRequestConfigOptions = {
  sourceApiName: SourceApiName;
  tokenValidityMS: number;
  url?: string;
};

type TokenAuthOptions = {
  clientID: string;
  clientSecret: string;
  tenantID?: string;
  scope?: string;
};

type TokenPayload = {
  client_id: string;
  client_secret: string;
  grant_type: 'client_credentials';
  scope?: string;
};

type TokenResponseSource = {
  access_token: string;
  token_type: string;
};

type TokenAuthHeader = {
  Authorization: `${string} ${string}`;
};

export async function fetchAuthTokenHeader(
  requestConfigOptions: TokenRequestConfigOptions,
  authOptions: TokenAuthOptions
): Promise<ApiResponse<TokenAuthHeader>> {
  const payload: TokenPayload = {
    client_id: authOptions.clientID,
    client_secret: authOptions.clientSecret,
    grant_type: 'client_credentials',
  };
  if (authOptions.scope) {
    payload.scope = authOptions.scope;
  }
  const additionalConfig: DataRequestConfig = {
    data: qs.stringify(payload),
    cacheKey_UNSAFE: `${requestConfigOptions.sourceApiName}-oauth-access-token`, // Every request to the service (identified by serviceID) will use the same access_token so we cache it with a static key.
    cacheTimeout: requestConfigOptions.tokenValidityMS,
    transformResponse: (response: TokenResponseSource | null) => {
      if (response?.access_token) {
        return {
          Authorization: `${response.token_type} ${response.access_token}`,
        };
      }
      throw new Error(
        `${requestConfigOptions.sourceApiName}: Invalid token response`
      );
    },
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  };

  if (!requestConfigOptions.url) {
    additionalConfig.formatUrl = (config) => {
      return `${config.url?.replaceAll(':tenant', authOptions.tenantID ?? 'common')}`;
    };
  } else {
    additionalConfig.url = requestConfigOptions.url;
  }

  const dataRequestConfig = getApiConfig('MS_OAUTH', additionalConfig);

  const tokenHeaderResponse =
    await requestData<TokenAuthHeader>(dataRequestConfig);

  return tokenHeaderResponse;
}

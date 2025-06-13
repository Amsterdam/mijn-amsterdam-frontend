import FormData from 'form-data';
import * as jose from 'jose';

import {
  ActivePermitSourceResponse,
  ClientProductDetailsSourceResponse,
} from './config-and-types';
import { IS_PRODUCTION } from '../../../universal/config/env';
import { AuthProfileAndToken } from '../../auth/auth-types';
import { getFromEnv } from '../../helpers/env';
import { getApiConfig } from '../../helpers/source-api-helpers';
import { requestData } from '../../helpers/source-api-request';
import { logger } from '../../logging';

export async function fetchSSOURL(authProfileAndToken: AuthProfileAndToken) {
  const config = getApiConfig('PARKEREN_FRONTOFFICE', {
    formatUrl(requestConfig) {
      return `${requestConfig.url}/sso/get_authentication_url?service=${authProfileAndToken.profile.authMethod}`;
    },
  });

  const response = await requestData<{ url: string }>(config);

  return response.content?.url;
}

type JWETokenSourceResponse = {
  token: string;
};

async function fetchJWEToken(authProfileAndToken: AuthProfileAndToken) {
  const idNumberType =
    authProfileAndToken.profile.profileType === 'private'
      ? 'bsn'
      : 'kvk_number';

  const formData = new FormData();
  formData.append(`data[${idNumberType}]`, authProfileAndToken.profile.id);

  const config = getApiConfig('PARKEREN', {
    method: 'POST',
    formatUrl: (config) => `${config.url}/v1/jwe/create`,
    transformResponse: (response: JWETokenSourceResponse): string => {
      return response.token;
    },
    data: formData,
  });

  return requestData<JWETokenSourceResponse>(config);
}

/**
 * This function checks whether the user has a parkeren products or permit requests (Vergunning aanvragen).
 *
 * We always return true when something goes wrong as to not deny the user a -
 * potentially useful tile in the frontend.
 */
export async function hasPermitsOrPermitRequests(
  authProfileAndToken: AuthProfileAndToken
) {
  const userType =
    authProfileAndToken.profile.profileType === 'private'
      ? 'private'
      : 'company';

  let JWT;
  if (IS_PRODUCTION) {
    const token = await createJWEToken(
      authProfileAndToken.profile.id,
      authProfileAndToken.profile.profileType
    );
    if (!token) {
      return true;
    }
    JWT = token;
  } else {
    const jweTokenResponse = await fetchJWEToken(authProfileAndToken);
    if (jweTokenResponse.status !== 'OK' || !jweTokenResponse.content) {
      return true;
    }
    JWT = jweTokenResponse.content;
  }

  const [clientProductsResponse, permitRequestsResponse] = await Promise.all([
    requestData<ClientProductDetailsSourceResponse>(
      getApiConfig('PARKEREN', {
        formatUrl: (config) =>
          `${config.url}/v1/${userType}/client_product_details`,
        method: 'POST',
        data: {
          token: JWT,
        },
      })
    ),
    requestData<ActivePermitSourceResponse>(
      getApiConfig('PARKEREN', {
        formatUrl: (config) =>
          `${config.url}/v1/${userType}/active_permit_request`,
        method: 'POST',
        data: {
          token: JWT,
        },
      })
    ),
  ]);

  return (
    clientProductsResponse.status !== 'OK' ||
    permitRequestsResponse.status !== 'OK' ||
    !!clientProductsResponse.content.data.length ||
    !!permitRequestsResponse.content.data.length
  );
}

async function createJWEToken(
  userID: AuthProfileAndToken['profile']['id'],
  profileType: ProfileType
): Promise<string | null> {
  const sharedKey = {
    kty: 'oct',
    k: getFromEnv('BFF_PARKEREN_JWT_KEY', true)!,
  };
  const JWK = await jose.importJWK(sharedKey);

  // eslint-disable-next-line no-magic-numbers
  const unixEpochInSeconds = Math.floor(Date.now() / 1000);

  const ONE_HOUR_IN_SECONDS = 3600;
  const payload: Record<string, string> = {
    iat: unixEpochInSeconds.toString(),
    exp: (unixEpochInSeconds + ONE_HOUR_IN_SECONDS).toString(),
    iss: getFromEnv('BFF_API_BASE_URL', true)!,
    aud: getFromEnv('BFF_PARKEREN_JWT_AUDIENCE', true)!,
  };
  if (profileType === 'private') {
    payload.bsn = userID;
  } else {
    payload.kvk_number = userID;
  }

  try {
    const jweToken = await new jose.CompactEncrypt(
      new TextEncoder().encode(JSON.stringify(payload))
    )
      .setProtectedHeader({
        alg: 'A256GCMKW',
        enc: 'A256CBC-HS512',
      })
      .encrypt(JWK);
    return jweToken;
  } catch (err) {
    logger.error(err);
    return null;
  }
}

export const forTesting = { fetchJWEToken };

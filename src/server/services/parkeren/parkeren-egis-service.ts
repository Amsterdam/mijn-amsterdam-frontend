import FormData from 'form-data';
import * as jose from 'jose';

import {
  ActivePermitSourceResponse,
  ClientProductDetailsSourceResponse,
} from './config-and-types';
import { AuthProfileAndToken } from '../../auth/auth-types';
import { ONE_MINUTE_MS } from '../../config/app';
import { getFromEnv } from '../../helpers/env';
import { getApiConfig } from '../../helpers/source-api-helpers';
import { requestData } from '../../helpers/source-api-request';
import { logger } from '../../logging';
import { IS_PRODUCTION } from '../../../universal/config/env';

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
    const token = await createJWEToken(authProfileAndToken.profile.id);
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

async function createJWEToken(bsn: string): Promise<string | null> {
  const JWK_SharedKey = Buffer.from(
    getFromEnv('TODO_BFF_PARKEREN_JWTKEY', true)!
  ).toString('base64');

  const EXPIRY = ONE_MINUTE_MS * 60;

  try {
    const accessToken = await new jose.SignJWT({
      iat: Date.now(),
      exp: Date.now() + EXPIRY,
      iss: 'mijn.amsterdam.nl',
      aud: 'TODO: parkeren audience??',
      bsn,
    })
      .setProtectedHeader({
        alg: 'A256GCMKW',
        enc: 'A256CBC-HS512',
        zip: 'DEF',
      })
      .setIssuedAt()
      .setExpirationTime('2h')
      .sign(Uint8Array.from(JWK_SharedKey));
    return accessToken;
  } catch (err) {
    logger.error(err);
  }

  return null;
}

export const forTesting = { fetchJWEToken };

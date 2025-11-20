import { HttpStatusCode } from 'axios';
import FormData from 'form-data';
import * as jose from 'jose';
import memoizee from 'memoizee';

import {
  ActivePermitSourceResponse,
  ClientProductDetailsSourceResponse,
} from './config-and-types';
import { featureToggle } from '../../../client/pages/Thema/Parkeren/Parkeren-thema-config';
import { ApiResponse } from '../../../universal/helpers/api';
import { AuthProfileAndToken } from '../../auth/auth-types';
import { ONE_HOUR_MS, ONE_SECOND_MS } from '../../config/app';
import { DataRequestConfig } from '../../config/source-api';
import { getFromEnv } from '../../helpers/env';
import { getApiConfig } from '../../helpers/source-api-helpers';
import { isSuccessStatus, requestData } from '../../helpers/source-api-request';
import { captureException } from '../monitoring';

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

async function fetchJWEToken(
  authProfileAndToken: AuthProfileAndToken
): Promise<ApiResponse<string>> {
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

  return requestData<string>(config);
}

/**
 * This function checks whether the user has a parkeren products or permit requests (Vergunning aanvragen).
 *
 * We always return true when something goes wrong as to not deny the user a -
 * potentially useful tile in the frontend.
 */
export async function hasPermitsOrPermitRequests(
  authProfileAndToken: AuthProfileAndToken
): Promise<boolean> {
  const JWT = await getJWEToken(authProfileAndToken);
  if (!JWT) {
    return true;
  }

  const userType =
    authProfileAndToken.profile.profileType === 'private'
      ? 'private'
      : 'company';

  const sharedConfig: DataRequestConfig = {
    method: 'POST',
    data: {
      token: JWT,
    },
    validateStatus: (statusCode) =>
      isSuccessStatus(statusCode) || statusCode === HttpStatusCode.NotFound,
    transformResponse(
      responseData:
        | ClientProductDetailsSourceResponse
        | ActivePermitSourceResponse,
      _headers,
      statusCode
    ) {
      if (statusCode === HttpStatusCode.NotFound) {
        return false;
      }
      return !!responseData.data.length;
    },
  };

  const [clientProductsResponse, permitRequestsResponse] = await Promise.all([
    requestData<boolean>(
      getApiConfig('PARKEREN', {
        ...sharedConfig,
        formatUrl: (config) =>
          `${config.url}/v1/${userType}/client_product_details`,
      })
    ),
    requestData<boolean>(
      getApiConfig('PARKEREN', {
        ...sharedConfig,
        formatUrl: (config) =>
          `${config.url}/v1/${userType}/active_permit_request`,
      })
    ),
  ]);

  return (
    clientProductsResponse.status !== 'OK' ||
    permitRequestsResponse.status !== 'OK' ||
    clientProductsResponse.content ||
    permitRequestsResponse.content
  );
}

async function getJWEToken(
  authProfileAndToken: AuthProfileAndToken
): Promise<string | null> {
  if (featureToggle.parkerenJWETokenCreationActive) {
    return createJWEToken(
      authProfileAndToken.profile.profileType,
      authProfileAndToken.profile.id
    );
  }

  const jweTokenResponse = await fetchJWEToken(authProfileAndToken);
  if (jweTokenResponse.status !== 'OK' || !jweTokenResponse.content) {
    return null;
  }
  return jweTokenResponse.content;
}

type JWEPayload = {
  iat: number;
  exp: number;
  iss: string;
  aud: string;
  bsn?: string;
  kvk_number?: string;
};

async function createJWEToken_(
  profileType: AuthProfileAndToken['profile']['profileType'],
  id: AuthProfileAndToken['profile']['id']
): Promise<string | null> {
  const sharedKey = {
    kty: 'oct',
    k: getFromEnv('BFF_PARKEREN_JWT_KEY', true)!,
  };
  const JWK = await jose.importJWK(sharedKey);

  const unixEpochInSeconds = Math.floor(Date.now() / ONE_SECOND_MS);

  const ONE_HOUR_IN_SECONDS = 3600;
  const payload: JWEPayload = {
    iat: unixEpochInSeconds,
    exp: unixEpochInSeconds + ONE_HOUR_IN_SECONDS,
    iss: getFromEnv('BFF_API_BASE_URL', true)!,
    aud: getFromEnv('BFF_PARKEREN_JWT_AUDIENCE', true)!,
  };
  if (profileType === 'private') {
    payload.bsn = id;
  } else {
    payload.kvk_number = id;
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
    captureException(err);
    return null;
  }
}

const TOKEN_VALIDITY_PERIOD = 1 * ONE_HOUR_MS;
const PERCENTAGE_DISTANCE_FROM_EXPIRY = 0.1;

const createJWEToken = memoizee(createJWEToken_, {
  maxAge: TOKEN_VALIDITY_PERIOD,
  preFetch: PERCENTAGE_DISTANCE_FROM_EXPIRY,
  promise: true,
});

export const forTesting = { fetchJWEToken };

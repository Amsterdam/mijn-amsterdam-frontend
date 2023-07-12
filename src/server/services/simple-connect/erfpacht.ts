import * as Sentry from '@sentry/node';
import crypto from 'crypto';
import { Chapters } from '../../../universal/config';
import { DataRequestConfig, getApiConfig } from '../../config';
import { AuthProfileAndToken } from '../../helpers/app';
import { fetchService, fetchTipsAndNotifications } from './api-service';
import { requestData } from '../../helpers';
import { getSettledResult } from '../../../universal/helpers';

function encryptPayload(payload: string) {
  const encryptionKey = process.env.BFF_MIJN_ERFPACHT_ENCRYPTION_KEY_V2 + '';
  const iv = crypto.randomBytes(16).toString('base64').slice(0, 16);
  const ivBuffer = Buffer.from(iv, 'utf-8');
  const cipher = crypto.createCipheriv('aes-128-cbc', encryptionKey, ivBuffer);
  const encrypted = Buffer.concat([cipher.update(payload), cipher.final()]);

  return [ivBuffer.toString(), encrypted.toString('base64url')] as const;
}

function encryptPayloadWithoutForwardSlashes(
  payload: string
): ReturnType<typeof encryptPayload> {
  const encrypted = encryptPayload(payload);
  if (encrypted[1] && encrypted[1].includes('/')) {
    return encryptPayloadWithoutForwardSlashes(payload);
  }
  return encrypted;
}

type ErfpachtSourceResponse = boolean;

function transformErfpachtResponse(isKnown: ErfpachtSourceResponse) {
  return {
    isKnown: isKnown ?? false,
  };
}

export function getConfigMain(
  authProfileAndToken: AuthProfileAndToken,
  requestID: requestID
): DataRequestConfig {
  const profile = authProfileAndToken.profile;
  const [iv, payload] = encryptPayloadWithoutForwardSlashes(profile.id + '');
  const type = profile.profileType === 'commercial' ? 'company' : 'user';
  const config = {
    url: `${process.env.BFF_MIJN_ERFPACHT_API_URL}/api/v2/check/groundlease/${type}/${payload}`,
    cacheKey: `erfpacht-main-${requestID}`,
    headers: {
      'X-RANDOM-IV': iv,
      'X-API-KEY': process.env.BFF_MIJN_ERFPACHT_API_KEY + '',
    },
    transformResponse: (response: ErfpachtSourceResponse) =>
      transformErfpachtResponse(response),
  };

  return getApiConfig('ERFPACHT', config);
}

export async function fetchErfpacht(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  return fetchService(
    requestID,
    getConfigMain(authProfileAndToken, requestID),
    false
  );
}

function getConfigNotifications(
  authProfileAndToken: AuthProfileAndToken,
  requestID: requestID
): DataRequestConfig {
  const profile = authProfileAndToken.profile;
  const [iv, payload] = encryptPayloadWithoutForwardSlashes(profile.id + '');
  const type = profile.profileType === 'commercial' ? 'kvk' : 'bsn';

  return getApiConfig('ERFPACHT', {
    url: `${process.env.BFF_MIJN_ERFPACHT_API_URL}/api/v2/notifications/${type}/${payload}`,
    cacheKey: `erfpacht-notifications-${requestID}`,
    headers: {
      'X-RANDOM-IV': iv,
      'X-API-KEY': process.env.BFF_MIJN_ERFPACHT_API_KEY + '',
    },
    transformResponse: (response) => {
      return { notifications: Array.isArray(response) ? response : [] };
    },
  });
}

export async function fetchErfpachtNotifications(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const response = await fetchTipsAndNotifications(
    requestID,
    getConfigNotifications(authProfileAndToken, requestID),
    Chapters.ERFPACHT
  );

  return response;
}

function getNamedResponseTransformer(apiName: string) {
  return function transformResponse(res: any) {
    Sentry.captureMessage(`${apiName}: response`, {
      extra: {
        data: JSON.stringify(res),
      },
    });

    return res;
  };
}

export async function fetchErfpachtV2(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const config = getApiConfig('ERFPACHTv2');

  const connectieAPIM = requestData(
    {
      ...config,
      url: `${config.url}/resource?param1=sample`,
      transformResponse: getNamedResponseTransformer('APIM'),
    },
    requestID,
    authProfileAndToken
  );

  const connectieVerniseHealth = requestData(
    {
      ...config,
      url: `${config.url}/vernise/management/health`,
      transformResponse: getNamedResponseTransformer('vernise-health'),
    },
    requestID,
    authProfileAndToken
  );

  const connectieErfpachter = requestData(
    {
      ...config,
      url: `${config.url}/vernise/api/erfpachter `,
      transformResponse: getNamedResponseTransformer('vernise-erfpachter'),
    },
    requestID,
    authProfileAndToken
  );

  const result = await Promise.allSettled([
    connectieAPIM,
    connectieVerniseHealth,
    connectieErfpachter,
  ]);

  return {
    content: {
      APIM: getSettledResult(result[0]),
      verniseHealth: getSettledResult(result[1]),
      erfpachter: getSettledResult(result[2]),
    },
  };
}

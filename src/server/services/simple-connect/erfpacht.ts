import { Chapters } from '../../../universal/config';
import { DataRequestConfig, getApiConfig } from '../../config';
import { AuthProfileAndToken } from '../../helpers/app';
import { fetchTipsAndNotifications, fetchService } from './api-service';
import crypto from 'crypto';

function encryptPayload(payload: string) {
  const encryptionKey = process.env.BFF_MIJN_ERFPACHT_ENCRYPTION_KEY_V2 + '';
  const iv = crypto.randomBytes(16).toString('base64').slice(0, 16);
  const ivBuffer = Buffer.from(iv);
  const cipher = crypto.createCipheriv('aes-128-cbc', encryptionKey, ivBuffer);
  const encrypted = Buffer.concat([cipher.update(payload), cipher.final()]);

  return [iv, encrypted.toString('base64')] as const;
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

type ErfpachtSourceResponse = 'true' | 'false';

function transformErfpachtResponse(response: ErfpachtSourceResponse) {
  return {
    isKnown: response === 'true',
  };
}

export function getConfigMain(
  authProfileAndToken: AuthProfileAndToken
): DataRequestConfig {
  const profile = authProfileAndToken.profile;
  const [iv, payload] = encryptPayloadWithoutForwardSlashes(profile.id + '');
  const type = profile.profileType === 'commercial' ? 'company' : 'user';
  const config = {
    url: `${process.env.BFF_MIJN_ERFPACHT_API_URL}/api/v2/check/groundlease/${type}/${payload}`,
    headers: {
      'X-RANDOM-IV': iv,
      'X-API-KEY': process.env.BFF_MIJN_ERFPACHT_API_KEY + '',
    },
    transformResponse: transformErfpachtResponse,
  };
  return getApiConfig('ERFPACHT', config);
}

export async function fetchErfpacht(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  return fetchService(requestID, getConfigMain(authProfileAndToken), false);
}

function getConfigNotifications(
  authProfileAndToken: AuthProfileAndToken
): DataRequestConfig {
  const profile = authProfileAndToken.profile;
  const [iv, payload] = encryptPayload(profile.id + '');
  const type = profile.profileType === 'commercial' ? 'kvk' : 'bsn';

  return getApiConfig('ERFPACHT', {
    url: `${process.env.BFF_MIJN_ERFPACHT_API_URL}/api/v2/notifications/${type}/${payload}`,
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
    getConfigNotifications(authProfileAndToken),
    Chapters.ERFPACHT
  );

  return response;
}

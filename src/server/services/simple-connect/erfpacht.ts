import { Chapters } from '../../../universal/config';
import { DataRequestConfig, getApiConfig } from '../../config';
import { AuthProfileAndToken } from '../../helpers/app';
import { fetchTipsAndNotifications, fetchService } from './api-service';
import { encrypt } from './subsidie';

function encryptPayload(payload: string) {
  return encrypt(payload, process.env.BFF_MIJN_ERFPACHT_ENCRYPTION_KEY_V2 + '');
}

type ErfpachtSourceResponse = 'true' | 'false';

function transformErfpachtResponse(response: ErfpachtSourceResponse) {
  return {
    isKnown: response === 'true',
  };
}

function getConfigMain(
  authProfileAndToken: AuthProfileAndToken
): DataRequestConfig {
  const profile = authProfileAndToken.profile;
  const [payload, iv] = encryptPayload(profile.id + '');
  const type = profile.profileType === 'commercial' ? 'company' : 'user';

  return getApiConfig('ERFPACHT', {
    url: `${process.env.BFF_MIJN_ERFPACHT_API_URL}/api/v2/check/groundlease/${type}/${payload}`,
    headers: {
      'X-RANDOM-IV': iv,
      'X-API-KEY': process.env.BFF_MIJN_ERFPACHT_API_KEY + '',
    },
    transformResponse: transformErfpachtResponse,
  });
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
  const [payload, iv] = encryptPayload(profile.id + '');
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

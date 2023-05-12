import jose from 'jose';
import { URL, URLSearchParams } from 'url';
import { Chapters } from '../../../universal/config';
import { apiSuccessResult } from '../../../universal/helpers/api';
import { MyNotification } from '../../../universal/types';
import { getApiConfig } from '../../config';
import { AuthProfile, AuthProfileAndToken } from '../../helpers/app';
import { fetchService, fetchTipsAndNotifications } from './api-service';
import { encrypt } from '../../../universal/helpers/encrypt-decrypt';

function getJWT() {
  return jose.JWT.sign(
    {
      iss: process.env.BFF_SISA_CLIENT_ID,
      iat: Date.now(),
    },
    jose.JWK.asKey(process.env.BFF_SISA_CLIENT_SECRET || ''),
    {
      algorithm: 'HS256',
    }
  );
}

function addAuthMethodToNotificationLinks(
  notifications: MyNotification[],
  authMethod: AuthProfile['authMethod']
): MyNotification[] {
  return notifications.map((notification) => {
    const urlTo = new URL(notification.link?.to || '/');
    const params = new URLSearchParams(urlTo.search);

    if (!params.get('authMethod')) {
      params.set('authMethod', authMethod);
    }

    const url = `${urlTo.origin}${urlTo.pathname}?${params.toString()}`;

    return Object.assign(notification, {
      link: {
        ...notification.link,
        to: new URL(url).toString(),
      },
    });
  });
}

function getConfig(
  authProfileAndToken: AuthProfileAndToken,
  requestID: requestID
) {
  const apiEndpointUrl =
    process.env.BFF_SISA_API_ENDPOINT +
    (authProfileAndToken.profile.authMethod === 'digid'
      ? 'citizen/'
      : 'company/');

  const [ivAndPayload] = encrypt(
    authProfileAndToken.profile.id + '',
    process.env.BFF_SISA_ENCRYPTION_KEY + ''
  );

  const url = apiEndpointUrl + ivAndPayload;

  return getApiConfig('SUBSIDIE', {
    url,
    cacheKey: apiEndpointUrl + requestID,
    headers: {
      Authorization: `Bearer ${getJWT()}`,
    },
  });
}

export async function fetchSubsidie(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  return fetchService(
    requestID,
    getConfig(authProfileAndToken, requestID),
    false
  );
}

export async function fetchSubsidieNotifications(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const response = await fetchTipsAndNotifications(
    requestID,
    getConfig(authProfileAndToken, requestID),
    Chapters.SUBSIDIE
  );

  if (response.status === 'OK' && response.content?.notifications) {
    return apiSuccessResult({
      ...response.content,
      notifications: addAuthMethodToNotificationLinks(
        response.content.notifications,
        authProfileAndToken.profile.authMethod
      ),
    });
  }

  return response;
}

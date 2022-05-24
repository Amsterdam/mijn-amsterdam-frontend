import { URL, URLSearchParams } from 'url';
import { Chapters } from '../../../universal/config';
import { apiSuccessResult } from '../../../universal/helpers/api';
import { MyNotification } from '../../../universal/types';
import { getApiConfig } from '../../config';
import { AuthProfile, AuthProfileAndToken } from '../../helpers/app';
import { fetchGenerated, fetchService } from './api-service';

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

export async function fetchSubsidie(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  return fetchService(requestID, getApiConfig('SUBSIDIE'), false);
}

export async function fetchSubsidieGenerated(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const response = await fetchGenerated(
    requestID,
    getApiConfig('SUBSIDIE'),
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

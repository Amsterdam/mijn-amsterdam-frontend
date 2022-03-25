import { URL, URLSearchParams } from 'url';
import { Chapters } from '../../universal/config';
import { omit } from '../../universal/helpers';
import {
  apiDependencyError,
  apiSuccessResult,
} from '../../universal/helpers/api';
import { MyNotification } from '../../universal/types';
import { getApiConfig } from '../config';
import { requestData } from '../helpers';
import { AuthProfile, AuthProfileAndToken } from '../helpers/app';

export interface SubsidieData {
  isKnown: boolean;
  notifications: MyNotification[];
}

interface SubsidieSourceDataContent {
  isKnown: boolean;
  notifications: MyNotification[];
}

interface SubsidieSourceData {
  status: 'OK' | 'ERROR';
  content?: SubsidieSourceDataContent;
  message?: string;
}

function transformSubsidieData(
  responseData: SubsidieSourceData,
  authMethod: AuthProfile['authMethod']
): SubsidieData {
  const { isKnown, notifications = [] } = responseData?.content || {
    isKnown: false,
    notifications: [],
  };

  return {
    isKnown,
    notifications: notifications.map((notification) => {
      const urlTo = new URL(notification.link?.to || '/');
      const params = new URLSearchParams(urlTo.search);

      if (!params.get('authMethod')) {
        params.set('authMethod', authMethod);
      }

      return Object.assign(notification, {
        link: {
          ...notification.link,
          to: new URL(
            `${urlTo.origin}${urlTo.pathname}?${params.toString()}`
          ).toString(),
        },
      });
    }),
  };
}

export async function fetchSource(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken,
  includeGenerated: boolean = false
) {
  const response = await requestData<SubsidieData>(
    getApiConfig('SUBSIDIE', {
      transformResponse: (responseData) => {
        return transformSubsidieData(
          responseData,
          authProfileAndToken.profile.authMethod
        );
      },
    }),
    requestID,
    authProfileAndToken
  );

  if (!includeGenerated) {
    return Object.assign({}, response, {
      content: response.content
        ? omit(response.content, ['notifications'])
        : null,
    });
  }

  return response;
}

export async function fetchSubsidie(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  return fetchSource(requestID, authProfileAndToken);
}

function transformSubsidieNotifications(notifications: MyNotification[]) {
  const notificationsTransformed = Array.isArray(notifications)
    ? notifications.map((notification) => ({
        ...notification,
        chapter: Chapters.SUBSIDIE,
        link: {
          title:
            notification.link?.title || 'Meer informatie over deze melding',
          to: notification.link?.to || '',
        },
      }))
    : [];

  return notificationsTransformed;
}

export async function fetchSubsidieGenerated(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const subsidie = await fetchSource(requestID, authProfileAndToken, true);
  if (subsidie.status === 'OK' && subsidie.content.notifications) {
    if (subsidie.content.notifications) {
      return apiSuccessResult({
        notifications: transformSubsidieNotifications(
          subsidie.content.notifications
        ),
      });
    }
  }
  return apiDependencyError({ subsidie });
}

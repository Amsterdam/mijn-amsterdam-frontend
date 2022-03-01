import { URL, URLSearchParams } from 'url';
import { Chapters } from '../../universal/config';
import { omit } from '../../universal/helpers';
import {
  apiDependencyError,
  apiSuccesResult,
} from '../../universal/helpers/api';
import { MyNotification } from '../../universal/types';
import { getApiConfig } from '../config';
import { requestData } from '../helpers';
import { getAuthTypeFromHeader } from '../helpers/app';

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
  authType: 'digid' | 'eherkenning'
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
        params.set('authMethod', authType);
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
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>,
  includeGenerated: boolean = false
) {
  const authType = getAuthTypeFromHeader(passthroughRequestHeaders);
  const response = await requestData<SubsidieData>(
    getApiConfig('SUBSIDIE', {
      transformResponse: (responseData) => {
        return transformSubsidieData(responseData, authType);
      },
    }),
    sessionID,
    passthroughRequestHeaders
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
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>
) {
  return fetchSource(sessionID, passthroughRequestHeaders);
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
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>
) {
  const subsidie = await fetchSource(
    sessionID,
    passthroughRequestHeaders,
    true
  );
  if (subsidie.status === 'OK' && subsidie.content.notifications) {
    if (subsidie.content.notifications) {
      return apiSuccesResult({
        notifications: transformSubsidieNotifications(
          subsidie.content.notifications
        ),
      });
    }
  }
  return apiDependencyError({ subsidie });
}

import { Chapters } from '../../universal/config';
import { omit } from '../../universal/helpers';
import { MyNotification } from '../../universal/types';
import { getApiConfig } from '../config';
import { requestData } from '../helpers';
import {
  apiDependencyError,
  apiSuccesResult,
} from '../../universal/helpers/api';

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

function transformSubsidieData(responseData: SubsidieSourceData): SubsidieData {
  const { isKnown, notifications = [] } = responseData?.content || {
    isKnown: false,
    notifications: [],
  };

  return {
    isKnown,
    notifications: notifications,
  };
}

async function fetchSource(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>,
  includeGenerated: boolean = false
) {
  const response = await requestData<SubsidieData>(
    getApiConfig('SUBSIDIE', {
      transformResponse: transformSubsidieData,
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

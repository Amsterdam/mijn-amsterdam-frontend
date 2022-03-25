import { Chapters } from '../../universal/config';
import { omit } from '../../universal/helpers';
import { MyNotification, MyTip } from '../../universal/types';
import { getApiConfig } from '../config';
import { requestData } from '../helpers';
import {
  apiDependencyError,
  apiSuccessResult,
} from '../../universal/helpers/api';
import { AuthProfileAndToken } from '../helpers/app';

export interface ERFPACHTData {
  isKnown: boolean;
  notifications?: MyNotification[];
}

interface ERFPACHTSourceDataContent {
  isKnown: boolean;
  meldingen: MyNotification[];
  tips: MyTip[];
}

interface ERFPACHTSourceData {
  status: 'OK' | 'ERROR';
  content?: ERFPACHTSourceDataContent;
  message?: string;
}

function transformERFPACHTNotifications(notifications?: MyNotification[]) {
  const notificationsTransformed = Array.isArray(notifications)
    ? notifications.map((notification) => ({
        ...notification,
        chapter: Chapters.ERFPACHT,
        link: {
          title:
            notification.link?.title || 'Meer informatie over deze melding',
          to: notification.link?.to || '',
        },
      }))
    : [];

  return notificationsTransformed;
}

function transformERFPACHTData(responseData: ERFPACHTSourceData): ERFPACHTData {
  const { isKnown, meldingen = [] } = responseData?.content || {
    isKnown: false,
    meldingen: [],
  };

  return {
    isKnown,
    notifications: transformERFPACHTNotifications(meldingen),
  };
}

async function fetchSource(
  sessionID: SessionID,
  authProfileAndToken: AuthProfileAndToken,
  includeGenerated: boolean = false
) {
  const response = await requestData<ERFPACHTData>(
    getApiConfig('ERFPACHT', {
      transformResponse: transformERFPACHTData,
    }),
    sessionID,
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

export async function fetchERFPACHT(
  sessionID: SessionID,
  authProfileAndToken: AuthProfileAndToken
) {
  return fetchSource(sessionID, authProfileAndToken);
}

export async function fetchERFPACHTGenerated(
  sessionID: SessionID,
  authProfileAndToken: AuthProfileAndToken
) {
  const ERFPACHT = await fetchSource(sessionID, authProfileAndToken, true);
  if (ERFPACHT.status === 'OK' && ERFPACHT.content.notifications) {
    if (ERFPACHT.content.notifications) {
      return apiSuccessResult({
        notifications: ERFPACHT.content.notifications,
      });
    }
  }
  return apiDependencyError({ ERFPACHT });
}

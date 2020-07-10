import { Chapters } from '../../universal/config';
import { omit } from '../../universal/helpers';
import { MyNotification, MyTip } from '../../universal/types';
import { getApiConfig } from '../config';
import { requestData } from '../helpers';

export interface MILIEUZONEData {
  isKnown: boolean;
  notifications?: MyNotification[];
}

interface MILIEUZONESourceDataContent {
  isKnown: boolean;
  meldingen: MyNotification[];
  tips: MyTip[];
}

interface MILIEUZONESourceData {
  status: 'OK' | 'ERROR';
  content?: MILIEUZONESourceDataContent;
  message?: string;
}

function transformMILIEUZONENotifications(notifications?: MyNotification[]) {
  const notificationsTransformed = Array.isArray(notifications)
    ? notifications.map(notification => ({
        ...notification,
        chapter: Chapters.MILIEUZONE,
      }))
    : [];

  return notificationsTransformed;
}

function transformMILIEUZONEData(
  responseData: MILIEUZONESourceData
): MILIEUZONEData {
  const { isKnown, meldingen } = responseData?.content || {
    isKnown: false,
    meldingen: [],
  };

  return {
    isKnown,
    notifications: transformMILIEUZONENotifications(meldingen),
  };
}

export async function fetchMILIEUZONE(
  sessionID: SessionID,
  samlToken: string,
  includeNotifications: boolean = false
) {
  const response = await requestData<MILIEUZONEData>(
    getApiConfig('MILIEUZONE', {
      transformResponse: transformMILIEUZONEData,
    }),
    sessionID,
    samlToken
  );

  if (!includeNotifications) {
    return Object.assign({}, response, {
      content: response.content
        ? omit(response.content, ['notifications'])
        : null,
    });
  }

  return response;
}

export async function fetchMILIEUZONEGenerated(
  sessionID: SessionID,
  samlToken: string
) {
  let notifications: MyNotification[] = [];

  const response = await fetchMILIEUZONE(sessionID, samlToken, true);
  if (response.status === 'OK' && response.content.notifications) {
    notifications = response.content.notifications;
  }
  return { notifications };
}

import { Chapters } from '../../universal/config';
import { omit } from '../../universal/helpers';
import { MyNotification, MyTip } from '../../universal/types';
import { getApiConfig } from '../config';
import { requestData } from '../helpers';
import {
  apiDependencyError,
  apiSuccesResult,
} from '../../universal/helpers/api';

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
  passthroughRequestHeaders: Record<string, string>,
  includeNotifications: boolean = false
) {
  const response = await requestData<MILIEUZONEData>(
    getApiConfig('MILIEUZONE', {
      transformResponse: transformMILIEUZONEData,
    }),
    sessionID,
    passthroughRequestHeaders
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
  passthroughRequestHeaders: Record<string, string>
) {
  const MILIEUZONE = await fetchMILIEUZONE(
    sessionID,
    passthroughRequestHeaders,
    true
  );
  if (MILIEUZONE.status === 'OK' && MILIEUZONE.content.notifications) {
    if (MILIEUZONE.content.notifications) {
      return apiSuccesResult({
        notifications: MILIEUZONE.content.notifications,
      });
    }
  }
  return apiDependencyError({ MILIEUZONE });
}

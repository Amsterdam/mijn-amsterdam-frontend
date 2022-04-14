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
    ? notifications.map((notification) => ({
        ...notification,
        title: `Milieuzone: ${notification.title}`,
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

async function fetchSource(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken,
  includeGenerated: boolean = false
) {
  const response = await requestData<MILIEUZONEData>(
    getApiConfig('MILIEUZONE', {
      transformResponse: transformMILIEUZONEData,
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

export async function fetchMILIEUZONE(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  return fetchSource(requestID, authProfileAndToken);
}

export async function fetchMILIEUZONEGenerated(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const MILIEUZONE = await fetchSource(requestID, authProfileAndToken, true);

  if (MILIEUZONE.status === 'OK' && MILIEUZONE.content.notifications) {
    return apiSuccessResult({
      notifications: MILIEUZONE.content.notifications,
    });
  }
  return apiDependencyError({ MILIEUZONE });
}

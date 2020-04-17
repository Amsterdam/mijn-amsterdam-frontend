import { ApiUrls, Chapters } from '../../universal/config';
import { getApiConfigValue } from '../../universal/helpers';
import { MyNotification } from '../../universal/types/App.types';
import { requestData } from '../helpers';
import { MyTip } from './tips';

export interface MILIEUZONEData {
  isKnown: boolean;
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
  const { isKnown } = responseData?.content || {
    isKnown: false,
  };

  return {
    isKnown,
  };
}

export function fetchMILIEUZONE(sessionID: SessionID) {
  return requestData<MILIEUZONEData>(
    {
      url: ApiUrls.MILIEUZONE,
      transformResponse: transformMILIEUZONEData,
    },
    sessionID,
    getApiConfigValue('MILIEUZONE', 'postponeFetch', true)
  );
}

function transformMILIEUZONEGenerated(responseData: MILIEUZONESourceData) {
  let notifications: MyNotification[] = [];

  if (responseData.status === 'OK') {
    if (responseData.content?.meldingen?.length) {
      notifications = transformMILIEUZONENotifications(
        responseData.content.meldingen
      );
    }
  }

  return {
    notifications,
  };
}

export async function fetchMILIEUZONEGenerated(sessionID: SessionID) {
  const response = await requestData<
    ReturnType<typeof transformMILIEUZONEGenerated>
  >(
    {
      url: ApiUrls.MILIEUZONE,
      transformResponse: transformMILIEUZONEGenerated,
    },
    sessionID,
    getApiConfigValue('MILIEUZONE', 'postponeFetch', true)
  );

  const notifications: MyNotification[] = [];

  return (
    response.content || {
      notifications,
    }
  );
}

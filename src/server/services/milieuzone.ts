import { ApiUrls } from '../../universal/config';

import { Chapters } from '../../universal/config/chapter';
import { requestData } from '../helpers';
import { MyNotification } from '../../universal/types/App.types';
import { getApiConfigValue } from '../../universal/helpers';

interface MILIEUZONESourceDataContent {
  isKnown: boolean;
  meldingen: MyNotification[];
}

interface MILIEUZONESourceData {
  status: 'OK' | 'ERROR';
  content?: MILIEUZONESourceDataContent;
  message?: string;
}

export interface MILIEUZONEData {
  isKnown: boolean;
  notifications: MyNotification[];
}

function transformMILIEUZONENotifications(notifications?: MyNotification[]) {
  return Array.isArray(notifications)
    ? notifications.map(notification => ({
        ...notification,
        chapter: Chapters.MILIEUZONE,
      }))
    : [];
}

function formatMILIEUZONEData(
  responseData: MILIEUZONESourceData
): MILIEUZONEData {
  const { meldingen, ...restData } = responseData?.content || {
    meldingen: [],
    isKnown: false,
  };

  return {
    ...restData,
    notifications: transformMILIEUZONENotifications(meldingen),
  };
}

export function fetchMILIEUZONE(sessionID: SessionID) {
  return requestData<MILIEUZONEData>(
    {
      url: ApiUrls.MILIEUZONE,
      transformResponse: formatMILIEUZONEData,
    },
    sessionID,
    getApiConfigValue('MILIEUZONE', 'postponeFetch', true)
  );
}

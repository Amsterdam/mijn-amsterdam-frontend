import { ApiUrls } from '../../universal/config';

import { Chapter } from '../../universal/config/chapter';
import { requestData } from '../helpers';
import { MyNotification } from '../../universal/types/App.types';

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

function formatMILIEUZONENotifications(notifications?: MyNotification[]) {
  return Array.isArray(notifications)
    ? notifications.map(notification => ({
        ...notification,
        chapter: 'MILIEUZONE' as Chapter,
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
    notifications: formatMILIEUZONENotifications(meldingen),
  };
}

export function fetchMILIEUZONE() {
  return requestData<MILIEUZONEData>({
    url: ApiUrls.MILIEUZONE,
    transformResponse: formatMILIEUZONEData,
  });
}

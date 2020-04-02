import { AxiosResponse } from 'axios';
import { MyNotification } from '../../../src/hooks/api/my-notifications-api.hook';
import { ApiUrls } from '../config/app';
import { requestSourceData } from '../helpers/requestSourceData';

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
        chapter: 'MILIEUZONE',
      }))
    : [];
}

function formatMILIEUZONEData(
  response: AxiosResponse<MILIEUZONESourceData>
): MILIEUZONEData {
  const { meldingen, ...restData } = response.data?.content || {
    meldingen: [],
    isKnown: false,
  };

  return {
    ...restData,
    notifications: formatMILIEUZONENotifications(meldingen),
  };
}

export function fetch() {
  return requestSourceData<MILIEUZONESourceData>({
    url: ApiUrls.MILIEUZONE,
  }).then(data => formatMILIEUZONEData(data));
}

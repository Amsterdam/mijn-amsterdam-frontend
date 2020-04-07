import { ApiUrls } from '../../universal/config';
import { AxiosResponse } from 'axios';
import { Chapter } from '../../universal/config/chapter';
import { MyNotification } from './services-notifications';
import { requestSourceData } from '../helpers';

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

export function fetchMILIEUZONE() {
  return requestSourceData<MILIEUZONESourceData>({
    url: ApiUrls.MILIEUZONE,
  }).then(data => formatMILIEUZONEData(data));
}

import { getApiUrl } from 'helpers/App';
import { Chapters } from '../../config/Chapter.constants';
import { useDataApi } from './api.hook';
import { ApiState } from './api.types';
import { MyNotification } from './my-notifications-api.hook';

interface MilieuzoneApiResponseContent {
  isKnown: boolean;
  meldingen: MyNotification[];
}

interface MilieuzoneApiResponse {
  status: 'OK' | 'ERROR';
  content?: MilieuzoneApiResponseContent;
  message?: string;
}

interface MilieuzoneApiContent {
  isKnown: boolean;
  notifications: MyNotification[];
}

export type MilieuzoneApiState = ApiState<MilieuzoneApiContent>;

function formatMILIEUZONENotifications(notifications?: MyNotification[]) {
  return Array.isArray(notifications)
    ? notifications.map(notification => ({
        ...notification,
        chapter: Chapters.MILIEUZONE,
      }))
    : [];
}

export default function useMilieuzoneApi(): MilieuzoneApiState {
  const content = { meldingen: [], isKnown: false };
  const [api] = useDataApi<MilieuzoneApiResponse>(
    {
      url: getApiUrl('MILIEUZONE'),
    },
    { content, status: 'OK' }
  );

  const { meldingen = [], ...restData } = api.data?.content || {};

  return {
    ...api,
    data: {
      ...content,
      ...restData,
      notifications: formatMILIEUZONENotifications(meldingen),
    },
  };
}

import { getApiUrl } from 'helpers/App';
import { Chapters } from '../../config/Chapter.constants';
import { useDataApi } from './api.hook';
import { ApiState } from './api.types';
import { MyNotification } from './my-notifications-api.hook';

interface MilieuzoneApiResponseContent {
  isKnown: boolean;
  UPDATES: MyNotification[];
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

function formatMilieuzoneNotifications(notifications?: MyNotification[]) {
  return Array.isArray(notifications)
    ? notifications.map(notification => ({
        ...notification,
        chapter: Chapters.MILIEUZONE,
      }))
    : [];
}

export default function useMilieuzoneApi(): MilieuzoneApiState {
  const content = { UPDATES: [], isKnown: false };
  const [api] = useDataApi<MilieuzoneApiResponse>(
    {
      url: getApiUrl('MILIEUZONE'),
    },
    { content, status: 'OK' }
  );

  const { UPDATES = [], ...restData } = api.data?.content || {};

  return {
    ...api,
    data: {
      ...content,
      ...restData,
      notifications: formatMilieuzoneNotifications(UPDATES),
    },
  };
}

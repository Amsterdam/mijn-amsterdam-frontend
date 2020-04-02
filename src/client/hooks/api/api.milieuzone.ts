import { ApiState } from './api.types';
import { Chapters } from '../../../universal/config';
import { MyNotification } from './my-notifications-api.hook';
import { getApiUrl, getApiConfigValue } from '../../../universal/helpers';
import { useDataApi } from './api.hook';

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

function formatMilieuzoneNotifications(notifications?: MyNotification[]) {
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
      postpone: getApiConfigValue('MILIEUZONE', 'postponeFetch', true),
    },
    { content, status: 'OK' }
  );

  const { meldingen = [], ...restData } = api.data?.content || {};

  return {
    ...api,
    data: {
      ...content,
      ...restData,
      notifications: formatMilieuzoneNotifications(meldingen),
    },
  };
}

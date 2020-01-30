import { getApiUrl } from 'helpers/App';
import { Chapters } from '../../config/Chapter.constants';
import { useDataApi } from './api.hook';
import { ApiState } from './api.types';
import { MyNotification } from './my-notifications-api.hook';
import { MyTip } from './my-tips-api.hook';

interface BelastingApiResponseContent {
  isKnown: boolean;
  meldingen: MyNotification[];
  tips: MyTip[];
}

interface BelastingApiResponse {
  status: 'OK' | 'ERROR';
  content: BelastingApiResponseContent;
}

interface BelastingApiContent {
  isKnown: boolean;
  notifications: MyNotification[];
  tips: MyTip[];
}

export type BelastingApiState = ApiState<BelastingApiContent>;

function formatBelastingNotifications(notifications?: MyNotification[]) {
  return Array.isArray(notifications)
    ? notifications.map(notification => ({
        ...notification,
        chapter: Chapters.BELASTINGEN,
      }))
    : [];
}

export default function useBelastingApi(): BelastingApiState {
  const [api] = useDataApi<BelastingApiResponse>(
    {
      url: getApiUrl('BELASTINGEN'),
    },
    { content: { meldingen: [], tips: [], isKnown: false }, status: 'OK' }
  );

  const { meldingen, ...restData } = api.data.content;

  return {
    ...api,
    data: {
      ...restData,
      notifications: formatBelastingNotifications(meldingen),
    },
  };
}

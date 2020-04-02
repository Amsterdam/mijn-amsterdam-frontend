import { getApiConfigValue, getApiUrl } from '../../helpers/App';

import { ApiState } from './api.types';
import { Chapters } from '../../config/Chapter.constants';
import { MyNotification } from './my-notifications-api.hook';
import { MyTip } from './my-tips-api.hook';
import { useDataApi } from './api.hook';

interface BelastingApiResponseContent {
  isKnown: boolean;
  meldingen: MyNotification[];
  tips: MyTip[];
}

interface BelastingApiResponse {
  status: 'OK' | 'ERROR';
  content?: BelastingApiResponseContent;
  message?: string;
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
  const content = { meldingen: [], tips: [], isKnown: false };
  const [api] = useDataApi<BelastingApiResponse>(
    {
      url: getApiUrl('BELASTINGEN'),
      postpone: getApiConfigValue('BELASTINGEN', 'postponeFetch', true),
    },
    { content, status: 'OK' }
  );

  const { meldingen = [], tips = [], ...restData } = api.data?.content || {};

  // Temporary tips hack.
  const prioritzedTips = tips.map(tip => Object.assign(tip, { priority: 100 }));

  return {
    ...api,
    data: {
      ...content,
      ...restData,
      tips: prioritzedTips,
      notifications: formatBelastingNotifications(meldingen),
    },
  };
}

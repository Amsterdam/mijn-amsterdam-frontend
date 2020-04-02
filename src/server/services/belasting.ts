import { ApiUrls } from '../../universal/config';
import { AxiosResponse } from 'axios';
import { Chapter } from '../../universal/config/chapter';
import { MyNotification } from '../../client/hooks/api/my-notifications-api.hook';
import { MyTip } from './services-tips';
import { requestSourceData } from '../../universal/helpers';

export interface BELASTINGENData {
  isKnown: boolean;
  notifications: MyNotification[];
  tips: MyTip[];
}

interface BELASTINGSourceDataContent {
  isKnown: boolean;
  meldingen: MyNotification[];
  tips: MyTip[];
}

interface BELASTINGSourceData {
  status: 'OK' | 'ERROR';
  content?: BELASTINGSourceDataContent;
  message?: string;
}

function formatBelastingNotifications(notifications?: MyNotification[]) {
  return Array.isArray(notifications)
    ? notifications.map(notification => ({
        ...notification,
        chapter: 'BELASTINGEN' as Chapter,
      }))
    : [];
}

function formatBELASTINGENData(
  response: AxiosResponse<BELASTINGSourceData>
): BELASTINGENData {
  const { meldingen, tips, ...restData } = response.data?.content || {
    meldingen: [],
    tips: [],
    isKnown: false,
  };

  // TEMP HACK! OVERWRITE PRIORITY
  const prioritzedTips = tips.map(tip => Object.assign(tip, { priority: 100 }));

  return {
    ...restData,
    tips: prioritzedTips,
    notifications: formatBelastingNotifications(meldingen),
  };
}

export function fetchBELASTING() {
  return requestSourceData<BELASTINGSourceData>({
    url: ApiUrls.BELASTINGEN,
  }).then(data => formatBELASTINGENData(data));
}

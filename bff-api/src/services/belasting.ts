import { AxiosResponse } from 'axios';
import { MyNotification } from '../../../src/hooks/api/my-notifications-api.hook';
import { ApiUrls } from '../config/app';
import { requestSourceData } from '../helpers/requestSourceData';
import { MyTip } from './services-tips';

export interface BELASTINGData {
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
        chapter: 'BELASTINGEN',
      }))
    : [];
}

function formatBELASTINGData(
  sourceData: AxiosResponse<BELASTINGSourceData>
): BELASTINGData {
  const { meldingen, tips, ...restData } = sourceData.data?.content || {
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

export function fetch() {
  return requestSourceData<BELASTINGSourceData>({
    url: ApiUrls.BELASTING,
  }).then(data => formatBELASTINGData(data));
}

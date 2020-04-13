import { ApiUrls } from '../../universal/config';

import { Chapter } from '../../universal/config/chapter';
import { MyTip } from './tips';
import { requestData } from '../helpers';
import { MyNotification } from '../../universal/types/App.types';
import { getApiConfigValue } from '../../universal/helpers';

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
  responseData: BELASTINGSourceData
): BELASTINGENData {
  const { meldingen, tips, ...restData } = responseData?.content || {
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
  return requestData<BELASTINGENData>(
    {
      url: ApiUrls.BELASTINGEN,
      transformResponse: formatBELASTINGENData,
    },
    getApiConfigValue('BELASTINGEN', 'postponeFetch', true)
  );
}

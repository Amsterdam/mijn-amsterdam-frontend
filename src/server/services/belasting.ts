import { ApiUrls, Chapters } from '../../universal/config';
import { getApiConfigValue } from '../../universal/helpers';
import { MyNotification } from '../../universal/types/App.types';
import { requestData } from '../helpers';
import { MyTip } from './tips';

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

function transformBelastingNotifications(notifications?: MyNotification[]) {
  const notificationsTransformed = Array.isArray(notifications)
    ? notifications.map(notification => ({
        ...notification,
        chapter: Chapters.BELASTINGEN,
      }))
    : [];

  return notificationsTransformed;
}

function transformBELASTINGENData(
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
    notifications: transformBelastingNotifications(meldingen),
  };
}

export function fetchBELASTING(sessionID: SessionID) {
  return requestData<BELASTINGENData>(
    {
      url: ApiUrls.BELASTINGEN,
      transformResponse: transformBELASTINGENData,
    },
    sessionID,
    getApiConfigValue('BELASTINGEN', 'postponeFetch', true)
  );
}

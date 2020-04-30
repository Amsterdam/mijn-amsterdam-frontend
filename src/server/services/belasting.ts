import { Chapters } from '../../universal/config';
import { MyNotification, MyTip } from '../../universal/types';
import { requestData } from '../helpers';
import { ApiUrls, getApiConfigValue } from '../config';

export interface BELASTINGENData {
  isKnown: boolean;
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
  const { isKnown } = responseData?.content || {
    isKnown: true,
  };

  return {
    isKnown,
  };
}

export function fetchBELASTING(sessionID: SessionID) {
  return requestData<BELASTINGENData>(
    {
      url: ApiUrls.BELASTINGEN,
      transformResponse: transformBELASTINGENData,
    },
    sessionID,
    getApiConfigValue('BELASTINGEN', 'postponeFetch', false)
  );
}

function transformBELASTINGENGenerated(responseData: BELASTINGSourceData) {
  let notifications: MyNotification[] = [];
  let tips: MyTip[] = [];

  if (responseData.status === 'OK') {
    // TEMP HACK! OVERRRIDE PRIORITY
    if (responseData.content?.tips?.length) {
      tips = responseData.content.tips.map(tip =>
        Object.assign(tip, {
          priority: 100,
        })
      );
    }

    if (responseData.content?.meldingen?.length) {
      notifications = transformBelastingNotifications(
        responseData.content.meldingen
      );
    }
  }

  return {
    tips,
    notifications,
  };
}

export async function fetchBELASTINGGenerated(sessionID: SessionID) {
  const response = await requestData<
    ReturnType<typeof transformBELASTINGENGenerated>
  >(
    {
      url: ApiUrls.BELASTINGEN,
      transformResponse: transformBELASTINGENGenerated,
    },
    sessionID,
    getApiConfigValue('BELASTINGEN_GENERATED', 'postponeFetch', false)
  );

  const notifications: MyNotification[] = [];
  const tips: MyTip[] = [];

  return (
    response.content || {
      tips,
      notifications,
    }
  );
}

import { Chapters } from '../../universal/config';
import { MyNotification, MyTip } from '../../universal/types';
import { getApiConfig } from '../config';
import { requestData } from '../helpers';

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

export function fetchBELASTING(
  sessionID: SessionID,
  samlToken: string,
  raw: boolean = false
) {
  return requestData<BELASTINGENData>(
    getApiConfig('BELASTINGEN', {
      transformResponse: (responseData: BELASTINGSourceData) =>
        raw ? responseData : transformBELASTINGENData(responseData),
    }),
    sessionID,
    samlToken
  );
}

function transformBELASTINGENGenerated(responseData: BELASTINGSourceData) {
  let notifications: MyNotification[] = [];
  let tips: MyTip[] = [];

  if (responseData.status === 'OK') {
    if (responseData.content?.tips?.length) {
      tips = responseData.content.tips;
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

export async function fetchBELASTINGGenerated(
  sessionID: SessionID,
  samlToken: string
) {
  const response = await requestData<
    ReturnType<typeof transformBELASTINGENGenerated>
  >(
    getApiConfig('BELASTINGEN', {
      transformResponse: transformBELASTINGENGenerated,
    }),
    sessionID,
    samlToken
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

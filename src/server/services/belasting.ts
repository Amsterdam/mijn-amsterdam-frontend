import { Chapters } from '../../universal/config';
import { MyNotification, MyTip } from '../../universal/types';
import { getApiConfig } from '../config';
import { requestData } from '../helpers';
import { omit } from '../../universal/helpers';

export interface BELASTINGENData {
  isKnown: boolean;
  notifications?: MyNotification[];
  tips?: MyTip[];
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
  const { isKnown, meldingen, tips } = responseData?.content || {
    isKnown: true,
    meldingen: [],
    tips: [],
  };

  return {
    isKnown,
    notifications: transformBelastingNotifications(meldingen),
    tips,
  };
}

export async function fetchBELASTING(
  sessionID: SessionID,
  samlToken: string,
  includeNotifications: boolean = false
) {
  const response = await requestData<BELASTINGENData>(
    getApiConfig('BELASTINGEN', {
      transformResponse: transformBELASTINGENData,
    }),
    sessionID,
    samlToken
  );

  if (!includeNotifications) {
    return Object.assign({}, response, {
      content: response.content
        ? omit(response.content, ['notifications'])
        : null,
    });
  }

  return response;
}

export async function fetchBELASTINGGenerated(
  sessionID: SessionID,
  samlToken: string
) {
  let notifications: MyNotification[] = [];

  const response = await fetchBELASTING(sessionID, samlToken, true);
  if (response.status === 'OK') {
    notifications = response.content.notifications;
  }
  return { notifications };
}

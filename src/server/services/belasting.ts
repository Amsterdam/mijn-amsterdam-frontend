import { Chapters } from '../../universal/config';
import { MyNotification, MyTip } from '../../universal/types';
import { getApiConfig } from '../config';
import { requestData } from '../helpers';
import { omit } from '../../universal/helpers';
import {
  apiSuccessResult,
  apiDependencyError,
} from '../../universal/helpers/api';
import { AuthProfileAndToken } from '../helpers/app';

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
    ? notifications.map((notification) => ({
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

async function fetchSource(
  sessionID: SessionID,
  authProfileAndToken: AuthProfileAndToken,
  includeGenerated: boolean = false
) {
  const response = await requestData<BELASTINGENData>(
    getApiConfig('BELASTINGEN', {
      transformResponse: transformBELASTINGENData,
    }),
    sessionID,
    authProfileAndToken
  );

  if (!includeGenerated) {
    return Object.assign({}, response, {
      content: response.content
        ? omit(response.content, ['notifications'])
        : null,
    });
  }

  return response;
}

export async function fetchBELASTING(
  sessionID: SessionID,
  authProfileAndToken: AuthProfileAndToken
) {
  return fetchSource(sessionID, authProfileAndToken);
}

export async function fetchBELASTINGGenerated(
  sessionID: SessionID,
  authProfileAndToken: AuthProfileAndToken
) {
  const BELASTING = await fetchSource(sessionID, authProfileAndToken, true);
  if (BELASTING.status === 'OK') {
    if (BELASTING.content.notifications) {
      return apiSuccessResult({
        notifications: BELASTING.content.notifications,
      });
    }
  }
  return apiDependencyError({ BELASTING });
}

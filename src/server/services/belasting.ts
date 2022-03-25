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
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken,
  includeGenerated: boolean = false
) {
  const response = await requestData<BELASTINGENData>(
    getApiConfig('BELASTINGEN', {
      transformResponse: transformBELASTINGENData,
    }),
    requestID,
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
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  return fetchSource(requestID, authProfileAndToken);
}

export async function fetchBELASTINGGenerated(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const BELASTING = await fetchSource(requestID, authProfileAndToken, true);
  if (BELASTING.status === 'OK') {
    if (BELASTING.content.notifications) {
      return apiSuccessResult({
        notifications: BELASTING.content.notifications,
      });
    }
  }
  return apiDependencyError({ BELASTING });
}

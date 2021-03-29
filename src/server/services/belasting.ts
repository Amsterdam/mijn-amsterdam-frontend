import { Chapters } from '../../universal/config';
import { MyNotification, MyTip } from '../../universal/types';
import { getApiConfig } from '../config';
import { requestData } from '../helpers';
import { omit } from '../../universal/helpers';
import {
  apiSuccesResult,
  apiDependencyError,
} from '../../universal/helpers/api';

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
  passthroughRequestHeaders: Record<string, string>,
  includeGenerated: boolean = false
) {
  const response = await requestData<BELASTINGENData>(
    getApiConfig('BELASTINGEN', {
      transformResponse: transformBELASTINGENData,
    }),
    sessionID,
    passthroughRequestHeaders
  );

  if (!includeGenerated) {
    return Object.assign({}, response, {
      content: response.content
        ? omit(response.content, ['notifications', 'tips'])
        : null,
    });
  }

  return response;
}

export async function fetchBELASTING(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>
) {
  return fetchSource(sessionID, passthroughRequestHeaders);
}

export async function fetchBELASTINGGenerated(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>
) {
  const BELASTING = await fetchSource(
    sessionID,
    passthroughRequestHeaders,
    true
  );
  if (BELASTING.status === 'OK') {
    if (BELASTING.content.notifications) {
      return apiSuccesResult({
        notifications: BELASTING.content.notifications,
      });
    }
  }
  return apiDependencyError({ BELASTING });
}

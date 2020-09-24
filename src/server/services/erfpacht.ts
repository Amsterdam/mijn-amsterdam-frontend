import { Chapters, FeatureToggle } from '../../universal/config';
import { omit } from '../../universal/helpers';
import { MyNotification, MyTip } from '../../universal/types';
import { getApiConfig } from '../config';
import { requestData } from '../helpers';
import {
  apiDependencyError,
  apiSuccesResult,
} from '../../universal/helpers/api';

export interface ERFPACHTData {
  isKnown: boolean;
  notifications?: MyNotification[];
}

interface ERFPACHTSourceDataContent {
  status: boolean;
  meldingen: MyNotification[];
  tips: MyTip[];
}

interface ERFPACHTSourceData {
  status: 'OK' | 'ERROR';
  content?: ERFPACHTSourceDataContent;
  message?: string;
}

function transformERFPACHTNotifications(notifications?: MyNotification[]) {
  const notificationsTransformed = Array.isArray(notifications)
    ? notifications.map((notification) => ({
        ...notification,
        chapter: Chapters.ERFPACHT,
      }))
    : [];

  return notificationsTransformed;
}

function transformERFPACHTData(
  responseData: ERFPACHTSourceDataContent
): ERFPACHTData {
  const { status: isKnown, meldingen = [] } = responseData || {
    status: false,
    meldingen: [],
  };

  return {
    isKnown,
    notifications: transformERFPACHTNotifications(meldingen),
  };
}

function transformERFPACHTDataWithNotifications(
  responseData: ERFPACHTSourceData
): ERFPACHTData {
  const { status: isKnown, meldingen = [] } = responseData?.content || {
    status: false,
    meldingen: [],
  };

  return {
    isKnown,
    notifications: transformERFPACHTNotifications(meldingen),
  };
}

export async function fetchERFPACHT(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>,
  includeNotifications: boolean = false
) {
  const response = await requestData<ERFPACHTData>(
    getApiConfig('ERFPACHT', {
      transformResponse: FeatureToggle.erfpachtMeldingenActive
        ? transformERFPACHTDataWithNotifications
        : transformERFPACHTData,
    }),
    sessionID,
    passthroughRequestHeaders
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

export async function fetchERFPACHTGenerated(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>
) {
  const ERFPACHT = await fetchERFPACHT(
    sessionID,
    passthroughRequestHeaders,
    true
  );
  if (ERFPACHT.status === 'OK' && ERFPACHT.content.notifications) {
    if (ERFPACHT.content.notifications) {
      return apiSuccesResult({
        notifications: ERFPACHT.content.notifications,
      });
    }
  }
  return apiDependencyError({ ERFPACHT });
}

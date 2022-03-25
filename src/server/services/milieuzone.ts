import { Chapters } from '../../universal/config';
import { omit } from '../../universal/helpers';
import { MyNotification, MyTip } from '../../universal/types';
import { getApiConfig } from '../config';
import { requestData } from '../helpers';
import { MyCase } from '../../universal/types/App.types';
import { FeatureToggle, ExternalUrls } from '../../universal/config/app';
import {
  apiDependencyError,
  apiSuccessResult,
} from '../../universal/helpers/api';
import { AuthProfileAndToken } from '../helpers/app';

export interface MILIEUZONEData {
  isKnown: boolean;
  notifications?: MyNotification[];
}

interface MILIEUZONESourceDataContent {
  isKnown: boolean;
  meldingen: MyNotification[];
  tips: MyTip[];
}

interface MILIEUZONESourceData {
  status: 'OK' | 'ERROR';
  content?: MILIEUZONESourceDataContent;
  message?: string;
}

function extractRecentCases(notifications: MyNotification[]) {
  const cases: MyCase[] = [];
  for (const notification of notifications) {
    if (notification.id.endsWith('-M1')) {
      const recentCase: MyCase = {
        ...notification,
        id: `${notification.id}-case`,
        title: 'Milieuzone aanvraag / ontheffing',
        link: {
          ...(notification.link || {
            to: ExternalUrls.SSO_MILIEUZONE || '/',
            title: 'Mileuzone ontheffingen en aanvragen',
          }),
          rel: 'external noopener noreferrer',
        },
      };
      cases.push(recentCase);
    }
  }
  return cases;
}

function transformMILIEUZONENotifications(notifications?: MyNotification[]) {
  const notificationsTransformed = Array.isArray(notifications)
    ? notifications.map((notification) => ({
        ...notification,
        title: `Milieuzone: ${notification.title}`,
        chapter: Chapters.MILIEUZONE,
      }))
    : [];

  return notificationsTransformed;
}

function transformMILIEUZONEData(
  responseData: MILIEUZONESourceData
): MILIEUZONEData {
  const { isKnown, meldingen } = responseData?.content || {
    isKnown: false,
    meldingen: [],
  };

  return {
    isKnown,
    notifications: transformMILIEUZONENotifications(meldingen),
  };
}

async function fetchSource(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken,
  includeGenerated: boolean = false
) {
  const response = await requestData<MILIEUZONEData>(
    getApiConfig('MILIEUZONE', {
      transformResponse: transformMILIEUZONEData,
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

export async function fetchMILIEUZONE(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  return fetchSource(requestID, authProfileAndToken);
}

export async function fetchMILIEUZONEGenerated(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const MILIEUZONE = await fetchSource(requestID, authProfileAndToken, true);

  if (MILIEUZONE.status === 'OK' && MILIEUZONE.content.notifications) {
    return apiSuccessResult({
      notifications: MILIEUZONE.content.notifications,
      cases: FeatureToggle.milieuzoneRecentCasesActive
        ? extractRecentCases(MILIEUZONE.content.notifications)
        : [],
    });
  }
  return apiDependencyError({ MILIEUZONE });
}

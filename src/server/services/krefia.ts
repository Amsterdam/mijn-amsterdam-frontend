import memoize from 'memoizee';
import { Chapters } from '../../universal/config';
import { omit } from '../../universal/helpers';
import {
  apiDependencyError,
  apiSuccessResult,
} from '../../universal/helpers/api';
import { MyNotification } from '../../universal/types';
import { DEFAULT_API_CACHE_TTL_MS, getApiConfig } from '../config';
import { requestData } from '../helpers';
import { AuthProfileAndToken } from '../helpers/app';

interface NotificationTrigger {
  datePublished: string;
  url: string;
}

export interface KrefiaDeepLink {
  title: string;
  url: string;
}

export interface KrefiaDeepLinks {
  budgetbeheer: KrefiaDeepLink | null;
  lening: KrefiaDeepLink | null;
  schuldhulp: KrefiaDeepLink | null;
}

interface NotificationTriggers {
  fibu: NotificationTrigger | null;
  krediet: NotificationTrigger | null;
}

export interface Krefia {
  notificationTriggers: NotificationTriggers | null;
  deepLinks: KrefiaDeepLinks;
}

export interface KrefiaDetail {
  deepLinks: KrefiaDeepLinks;
}

function createNotification(
  message: NotificationTrigger,
  type: 'fibu' | 'krediet'
): MyNotification {
  const isFibu = type === 'fibu';
  return {
    id: `krefia-${type}-notification`,
    datePublished: message.datePublished,
    title: isFibu
      ? 'Bericht Budgetbeheer (FIBU)'
      : `Bericht Kredietbank Amsterdam`,
    chapter: Chapters.KREFIA,
    description: isFibu
      ? 'Er staan ongelezen berichten voor u klaar van Budgetbeheer (FIBU)'
      : 'Er staan ongelezen berichten voor u klaar van Kredietbank Amsterdam',
    link: { to: message.url, title: 'Bekijk uw bericht' },
  };
}

async function fetchAndTransformKrefia(
  sessionID: SessionID,
  authProfileAndToken: AuthProfileAndToken
) {
  const response = await requestData<Krefia>(
    getApiConfig('KREFIA', {
      transformResponse: (responseData: {
        content: Krefia | null;
        status: 'OK';
      }) => responseData.content,
    }),
    sessionID,
    authProfileAndToken
  );

  return response;
}

export const fetchSource = memoize(fetchAndTransformKrefia, {
  maxAge: DEFAULT_API_CACHE_TTL_MS,
  normalizer: function (args: any[]) {
    return args[0] + JSON.stringify(args[1]);
  },
});

export async function fetchKrefia(
  sessionID: SessionID,
  authProfileAndToken: AuthProfileAndToken
) {
  const response = await fetchSource(sessionID, authProfileAndToken);
  if (response.status === 'OK' && response.content) {
    return apiSuccessResult(omit(response.content, ['notificationTriggers']));
  }
  return response;
}

export async function fetchKrefiaGenerated(
  sessionID: SessionID,
  authProfileAndToken: AuthProfileAndToken
) {
  const response = await fetchSource(sessionID, authProfileAndToken);

  if (response.status === 'OK') {
    const notifications: MyNotification[] = [];

    if (response.content) {
      const fibuTrigger = response.content.notificationTriggers?.fibu;
      if (fibuTrigger) {
        notifications.push(createNotification(fibuTrigger, 'fibu'));
      }

      const kredietTrigger = response.content.notificationTriggers?.krediet;
      if (kredietTrigger) {
        notifications.push(createNotification(kredietTrigger, 'krediet'));
      }
    }

    return apiSuccessResult({
      notifications,
    });
  }
  return apiDependencyError({ response });
}

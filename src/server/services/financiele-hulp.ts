import { Chapters } from '../../universal/config';
import {
  apiDependencyError,
  apiSuccesResult,
} from '../../universal/helpers/api';
import { MyNotification } from '../../universal/types';
import { getApiConfig } from '../config';
import { requestData } from '../helpers';

interface NotificationTrigger {
  datePublished: string;
  url: string;
}

interface KrefiaDeepLink {
  title: string;
  url: string;
}

interface KrefiaDeepLinks {
  budgetbeheer: KrefiaDeepLink | null;
  lening: KrefiaDeepLink | null;
  schuldhulp: KrefiaDeepLink | null;
}

interface NotificationTriggers {
  fibu: NotificationTrigger | null;
  krediet: NotificationTrigger | null;
}

export interface FinancieleHulp {
  notificationTriggers: NotificationsTriggers;
  deepLinks: KrefiaDeepLinks;
}

function createNotification(
  message: NotificationTrigger,
  type: string
): MyNotification {
  const isFibu = type === 'fibu';
  return {
    id: `financiele-hulp-${type}-notification`,
    datePublished: message.datePublished,
    title: isFibu ? 'Bericht FiBu' : `Bericht Kredietbank`,
    chapter: Chapters.FINANCIELE_HULP,
    description: isFibu
      ? 'Er staan ongelezen berichten voor u klaar van FiBu'
      : 'Er staan ongelezen berichten voor u klaar van de kredietbank',
    link: { to: message.url, title: 'Bekijk uw bericht', target: '_blank' },
  };
}

async function fetchSource(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>
) {
  const response = await requestData<FinancieleHulp>(
    getApiConfig('FINANCIELE_HULP', {
      transformResponse: (responseData) => responseData.content,
    }),
    sessionID,
    passthroughRequestHeaders
  );

  return response;
}

export async function fetchFinancieleHulp(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>
) {
  return fetchSource(sessionID, passthroughRequestHeaders);
}

export async function fetchFinancieleHulpGenerated(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>
) {
  const FINANCIELE_HULP = await fetchSource(
    sessionID,
    passthroughRequestHeaders
  );
  if (FINANCIELE_HULP.status === 'OK') {
    let notifications: MyNotification[] = [];

    const fibuNotification =
      !!FINANCIELE_HULP.content?.notificationTriggers?.fibuMessage &&
      createNotification(
        FINANCIELE_HULP.content?.notificationTriggers?.fibuMessage,
        'fibu'
      );

    const kredietNotification =
      !!FINANCIELE_HULP.content?.notificationTriggers?.kredietMessage &&
      createNotification(
        FINANCIELE_HULP.content?.notificationTriggers.kredietMessage,
        'krediet'
      );

    fibuNotification && notifications.push(fibuNotification);
    kredietNotification && notifications.push(kredietNotification);

    return apiSuccesResult({
      notifications,
    });
  }
  return apiDependencyError({ FINANCIELE_HULP });
}

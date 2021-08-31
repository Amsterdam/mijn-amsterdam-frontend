import { Chapters } from '../../universal/config';
import {
  apiDependencyError,
  apiSuccesResult,
} from '../../universal/helpers/api';
import { MyNotification } from '../../universal/types';
import { getApiConfig } from '../config';
import { requestData } from '../helpers';

interface Message {
  datePublished: string;
  url: string;
}

interface KrefiaDeepLink {
  title: string;
  url: string;
}

interface KrefiaDeepLinks {
  budgetbeheer: KrefiaDeepLink;
  lening: KrefiaDeepLink;
  schuldhulp: KrefiaDeepLink;
}

interface Notifications {
  fibuMessage?: Message;
  kredietMessage?: Message;
}

export interface FinancieleHulp {
  notifications?: Notifications | null;
  deepLinks?: KrefiaDeepLinks | null;
}

interface FinancieleHulpSourceData {
  status: 'OK' | 'ERROR';
  content?: FinancieleHulp;
  message?: string;
}

function createNotification(message: Message, type: string): MyNotification {
  const isFibu = type === 'fibu';
  return {
    id: `financiele-hulp-${isFibu ? 'fibu' : 'krediet'}-notification`,
    datePublished: message.datePublished,
    title: isFibu ? 'Bericht FiBu' : `Bericht Kredietbank`,
    chapter: Chapters.FINANCIELE_HULP,
    description: isFibu
      ? 'Er staan ongelezen berichten voor u klaar van FiBu'
      : 'Er staan ongelezen berichten voor u klaar van de kredietbank',
    link: { to: message.url, title: 'Bekijk uw bericht', target: '_blank' },
  };
}

function transformFINANCIELEHULPData(
  responseData: FinancieleHulpSourceData
): FinancieleHulp {
  return {
    ...responseData?.content,
  };
}

async function fetchSource(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>
) {
  const response = await requestData<FinancieleHulp>(
    getApiConfig('FINANCIELE_HULP', {
      transformResponse: transformFINANCIELEHULPData,
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
    if (FINANCIELE_HULP.content) {
      let notifications: MyNotification[] = [];

      const fibuNotification =
        !!FINANCIELE_HULP.content?.notifications?.fibuMessage &&
        createNotification(
          FINANCIELE_HULP.content.notifications.fibuMessage,
          'fibu'
        );

      const kredietNotification =
        !!FINANCIELE_HULP.content?.notifications?.kredietMessage &&
        createNotification(
          FINANCIELE_HULP.content.notifications.kredietMessage,
          'krediet'
        );

      fibuNotification && notifications.push(fibuNotification);
      kredietNotification && notifications.push(kredietNotification);

      return apiSuccesResult({
        notifications,
      });
    }
  }
  return apiDependencyError({ FINANCIELE_HULP });
}

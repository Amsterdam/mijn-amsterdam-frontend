import { Chapters } from '../../universal/config';
import {
  apiDependencyError,
  apiSuccesResult,
} from '../../universal/helpers/api';
import { MyNotification, MyTip } from '../../universal/types';
import { getApiConfig } from '../config';
import { requestData } from '../helpers';
import { isExternalUrl } from '../../universal/helpers/utils';

interface Message {
  datePublished: string;
  url: string;
}

interface Schuldregeling {
  title: string;
  url: string;
}

interface Lening {
  title: string;
  url: string;
}

interface Budgetbeheer {
  title: string;
  url: string;
}

export interface FINANCIELE_HULPData {
  kredietMessages?: Message[];
  fibuMessages?: Message[];
  schuldregelingen?: Schuldregeling[];
  leningen?: Lening[];
  budgetbeheer?: Budgetbeheer[];
}

interface FINANCIELE_HULPSourceDataContent {
  kredietMessages?: Message[];
  fibuMessages?: Message[];
  tips: MyTip[];
}

interface FIENANCIELE_HULPSourceData {
  status: 'OK' | 'ERROR';
  content?: FINANCIELE_HULPSourceDataContent;
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
  responseData: FIENANCIELE_HULPSourceData
): FINANCIELE_HULPData {
  return {
    ...responseData?.content,
  };
}

async function fetchSource(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>
) {
  const response = await requestData<FINANCIELE_HULPData>(
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
      let notifications = [];
      const fibuNotification = !!FINANCIELE_HULP.content?.fibuMessages?.length
        ? createNotification(FINANCIELE_HULP.content?.fibuMessages[0], 'fibu')
        : [];
      const kredietNotification =
        !!FINANCIELE_HULP.content?.kredietMessages?.length &&
        createNotification(
          FINANCIELE_HULP.content?.kredietMessages[0],
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

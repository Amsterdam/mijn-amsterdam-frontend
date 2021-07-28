import { Chapters } from '../../universal/config';
import { MyNotification, MyTip } from '../../universal/types';
import { getApiConfig } from '../config';
import { requestData } from '../helpers';
import { omit } from '../../universal/helpers';
import {
  apiSuccesResult,
  apiDependencyError,
} from '../../universal/helpers/api';

interface Message {
  datePublished: string;
  url: string;
}

interface SchuldRegeling {
  status: string;
  url: string;
}

interface Lening {
  status: string;
  url: string;
}

interface Budgetbeheer {
  status: string;
  ur: string;
}

export interface FINANCIELE_HULPData {
  kredietMessages?: Message[];
  fibuMessages?: Message[];
  schuldRegelingen?: SchuldRegeling[];
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

function transformFienancieleHulpNotifications(
  notifications?: MyNotification[]
) {
  const notificationsTransformed = Array.isArray(notifications)
    ? notifications.map((notification) => ({
        ...notification,
        chapter: Chapters.FINANCIELEHULP,
      }))
    : [];

  return notificationsTransformed;
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
  passthroughRequestHeaders: Record<string, string>,
  includeGenerated: boolean = false
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
  const FIENANCIELE_HULP = await fetchSource(
    sessionID,
    passthroughRequestHeaders,
    true
  );
  if (FIENANCIELE_HULP.status === 'OK') {
    if (FIENANCIELE_HULP.content) {
      return apiSuccesResult({
        notifications: FIENANCIELE_HULP.content,
      });
    }
  }
  return apiDependencyError({ FIENANCIELE_HULP });
}

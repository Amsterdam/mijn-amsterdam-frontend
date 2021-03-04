import {
  apiDependencyError,
  apiSuccesResult,
} from '../../universal/helpers/api';
import { getApiConfig } from '../config';
import { requestData } from '../helpers';

export interface SIAItem {}

interface SIASourceItem {}

interface SIASourceData {
  status: 'OK' | 'ERROR';
  content?: SIASourceItem[];
  message?: string;
}

// function transformSIANotifications(notifications?: MyNotification[]) {
//   const notificationsTransformed = Array.isArray(notifications)
//     ? notifications.map((notification) => ({
//         ...notification,
//         chapter: Chapters.SIA,
//       }))
//     : [];

//   return notificationsTransformed;
// }

function transformSIAData(responseData: SIASourceData): SIAItem[] {
  const sia = responseData?.content || [];

  return sia;
}

export async function fetchSIA(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>
) {
  const response = await requestData<SIAItem[]>(
    getApiConfig('SIA', {
      transformResponse: transformSIAData,
    }),
    sessionID,
    passthroughRequestHeaders
  );

  return response;
}

export async function fetchSIAGenerated(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>
) {
  const SIA = await fetchSIA(sessionID, passthroughRequestHeaders);
  if (SIA.status === 'OK') {
    return apiSuccesResult({
      notifications: [],
    });
  }
  return apiDependencyError({ SIA });
}

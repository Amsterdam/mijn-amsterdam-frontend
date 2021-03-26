import { apiDependencyError, apiSuccesResult } from '../../universal/helpers';
import { getApiConfig } from '../config';
import { requestData } from '../helpers';

export interface Akte {}

interface AKTESDataFromSource {
  content: {
    isKnown: boolean;
    aktes: Akte[];
  };
}

export type AKTESData = Akte[];

function transformAKTESData(responseData: AKTESDataFromSource) {
  return responseData.content.aktes;
}

function transformAKTESNotifications(aktes: AKTESData, compareDate: Date) {
  return [];
}

export async function fetchAKTES(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>
) {
  const options = getApiConfig('AKTES', {
    transformResponse: transformAKTESData,
  });

  return requestData<AKTESData>(options, sessionID, passthroughRequestHeaders);
}

export async function fetchAKTESGenerated(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>
) {
  const AKTES = await fetchAKTES(sessionID, passthroughRequestHeaders);

  if (AKTES.status === 'OK') {
    return apiSuccesResult({
      notifications: transformAKTESNotifications(AKTES.content, new Date()),
    });
  }

  return apiDependencyError({ AKTES });
}

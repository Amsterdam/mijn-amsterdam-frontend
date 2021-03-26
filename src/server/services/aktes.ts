import { apiDependencyError, apiSuccesResult } from '../../universal/helpers';
import { getApiConfig } from '../config';
import { requestData } from '../helpers';
import { dateSort } from '../../universal/helpers/date';
import { generatePath } from 'react-router-dom';
import { AppRoutes } from '../../universal/config/routes';

export interface Akte {
  aktenummer: string;
  registerjaar: string;
  documenten: string[];
  type:
    | 'Huwelijkskate'
    | 'Akte van geregistreerd partnerschap'
    | 'Geboorteakte';
}

interface AKTESDataFromSource {
  content: {
    isKnown: boolean;
    aktes: Akte[];
  };
}

export type AKTESData = Akte[];

function transformAKTESData(responseData: AKTESDataFromSource) {
  return responseData.content.aktes
    .sort(dateSort('registerjaar', 'desc'))
    .map((akte) => {
      return {
        ...akte,
        link: {
          to: generatePath(AppRoutes['BURGERZAKEN/AKTE'], {
            id: akte.aktenummer,
          }),
          title: akte.type,
        },
      };
    });
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

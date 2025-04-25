import { fetchService, fetchTipsAndNotifications } from './api-service';
import { ThemaIDs } from '../../../universal/config/thema';
import { AuthProfileAndToken } from '../../auth/auth-types';
import { getApiConfig } from '../../helpers/source-api-helpers';

interface SVWISourceResponseData {
  id: string;
  gebruikerBekend: boolean;
  berichten: any[];
}

function transformSVWIResponse(response: SVWISourceResponseData | null) {
  return {
    isKnown: !!response?.gebruikerBekend,
  };
}

export function fetchSVWI(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken
) {
  return fetchService(
    requestID,
    getApiConfig('SVWI', {
      transformResponse: transformSVWIResponse,
    }),
    false,
    authProfileAndToken
  );
}

export async function fetchSVWINotifications(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken
) {
  return await fetchTipsAndNotifications(
    requestID,
    getApiConfig('SVWI', {
      transformResponse: transformSVWIResponse,
    }),
    ThemaIDs.SVWI,
    authProfileAndToken
  );
}

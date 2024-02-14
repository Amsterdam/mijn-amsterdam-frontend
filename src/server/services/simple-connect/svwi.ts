import { DataRequestConfig, getApiConfig } from '../../config';
import { AuthProfileAndToken } from '../../helpers/app';
import { fetchService, fetchTipsAndNotifications } from './api-service';
import { Chapters } from '../../../universal/config';

interface SVWISourceResponseData {
  id: string;
  gebruikerBekend: boolean;
  berichten: any[];
}

function transformSVWIResponse(response: SVWISourceResponseData) {
  return {
    isKnown: !!response.gebruikerBekend,
  };
}


export function fetchSVWI(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  return fetchService(requestID, getConfigSVWI(authProfileAndToken.token));
}

export async function fetchSVWINotifications(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  return await fetchTipsAndNotifications(
    requestID,
    getConfigSVWI(authProfileAndToken.token),
    Chapters.SVWI
  );
}

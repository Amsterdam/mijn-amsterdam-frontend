import { DataRequestConfig, getApiConfig } from '../../config';
import { AuthProfileAndToken } from '../../helpers/app';
import { fetchService, fetchTipsAndNotifications } from './api-service';
import { Chapters } from '../../../universal/config';

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
  requestID: requestID,
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
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  return await fetchTipsAndNotifications(
    requestID,
    getApiConfig('SVWI', {
      transformResponse: transformSVWIResponse,
    }),
    Chapters.SVWI,
    authProfileAndToken
  );
}

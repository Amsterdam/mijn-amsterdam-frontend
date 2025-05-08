import { themaId } from '../../../client/pages/Thema/Svwi/Svwi-thema-config';
import { AuthProfileAndToken } from '../../auth/auth-types';
import { getApiConfig } from '../../helpers/source-api-helpers';
import {
  fetchService,
  fetchTipsAndNotifications,
} from '../patroon-c/api-service';

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

export function fetchSVWI(authProfileAndToken: AuthProfileAndToken) {
  return fetchService(
    getApiConfig('SVWI', {
      transformResponse: transformSVWIResponse,
    }),
    false,
    authProfileAndToken
  );
}

export async function fetchSVWINotifications(
  authProfileAndToken: AuthProfileAndToken
) {
  return await fetchTipsAndNotifications(
    getApiConfig('SVWI', {
      transformResponse: transformSVWIResponse,
    }),
    themaId,
    authProfileAndToken
  );
}

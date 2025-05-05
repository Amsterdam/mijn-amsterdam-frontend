import {
  fetchService,
  fetchTipsAndNotifications,
  type ApiPatternResponseA,
} from './api-service';
import {
  featureToggle,
  SVWI_ROUTE_DEFAULT,
  themaId,
  themaTitle,
} from '../../../client/pages/Thema/Svwi/Svwi-thema-config';
import type { MyNotification } from '../../../universal/types/App.types';
import { AuthProfileAndToken } from '../../auth/auth-types';
import { getFromEnv } from '../../helpers/env';
import { getApiConfig } from '../../helpers/source-api-helpers';

type SVWIMessageSource = {
  id: string;
  source: string;
  identificatie: string;
  afzender: string;
  onderwerp: string;
  ontvangen: string;
  url: string;
  inhoud: string;
};

type SVWISourceResponseData = {
  id: string;
  gebruikerBekend: boolean;
  berichten?: SVWIMessageSource[];
};

function transformNotification(message: SVWIMessageSource): MyNotification {
  return {
    id: message.id,
    themaID: themaId,
    themaTitle: themaTitle,
    title: message.onderwerp,
    datePublished: message.ontvangen,
    description: message.inhoud,
    link: {
      title: 'Bekijk bericht',
      to: message.url,
    },
  };
}

function transformSVWIResponse(
  response: SVWISourceResponseData | null
): ApiPatternResponseA {
  return {
    isKnown: !!response?.gebruikerBekend,
    notifications: response?.berichten?.map(transformNotification) ?? [],
    url: getFromEnv('BFF_SSO_URL_SVWI') ?? SVWI_ROUTE_DEFAULT,
  };
}

export function fetchSVWI(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const apiConfig = getApiConfig('SVWI', {
    formatUrl(requestConfig) {
      return `${requestConfig.url}/authorisatie/tegel`;
    },
    transformResponse: transformSVWIResponse,
    postponeFetch: !featureToggle.svwiActive,
  });
  return fetchService(requestID, apiConfig, false, authProfileAndToken);
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
    themaId,
    authProfileAndToken
  );
}

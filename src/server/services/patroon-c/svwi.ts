import {
  fetchService,
  fetchTipsAndNotifications,
  type ApiPatternResponseA,
} from './api-service.ts';
import {
  featureToggle,
  SVWI_ROUTE_DEFAULT,
  themaId,
  themaTitle,
} from '../../../client/pages/Thema/Svwi/Svwi-thema-config.ts';
import type { MyNotification } from '../../../universal/types/App.types.ts';
import { AuthProfileAndToken } from '../../auth/auth-types.ts';
import { getFromEnv } from '../../helpers/env.ts';
import { getApiConfig } from '../../helpers/source-api-helpers.ts';

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

export function fetchSVWI(authProfileAndToken: AuthProfileAndToken) {
  const apiConfig = getApiConfig('SVWI', {
    formatUrl(requestConfig) {
      return `${requestConfig.url}/autorisatie/tegel`;
    },
    transformResponse: transformSVWIResponse,
    postponeFetch: !featureToggle.svwiActive,
  });
  return fetchService(apiConfig, false, authProfileAndToken);
}

export async function fetchSVWINotifications(
  authProfileAndToken: AuthProfileAndToken
) {
  return await fetchTipsAndNotifications(
    getApiConfig('SVWI', {
      formatUrl(requestConfig) {
        return `${requestConfig.url}/autorisatie/tegel`;
      },
      transformResponse: transformSVWIResponse,
      postponeFetch: !featureToggle.svwiActive,
    }),
    themaId,
    authProfileAndToken
  );
}

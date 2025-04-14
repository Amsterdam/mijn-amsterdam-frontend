import { fetchService, fetchTipsAndNotifications } from './api-service';
import { ThemaIDs } from '../../../universal/config/thema';
import { MyNotification } from '../../../universal/types';
import { AuthProfileAndToken } from '../../auth/auth-types';
import { DataRequestConfig } from '../../config/source-api';
import { getApiConfig } from '../../helpers/source-api-helpers';

const translationsJson = process.env.BFF_BELASTINGEN_BSN_TRANSLATIONS
  ? JSON.parse(process.env.BFF_BELASTINGEN_BSN_TRANSLATIONS)
  : {};

interface BelastingMessage {
  thema: 'Belastingen';
  categorie: 'F2' | 'M1' | 'M2';
  nummer: number;
  prioriteit: number;
  datum: string;
  titel: string;
  omschrijving: string;
  url: string;
  url_naam: string;
  informatie: string;
}

interface BelastingenSourceContent {
  status: 'BSN known' | 'BSN unknown';
  data: BelastingMessage[];
}

function getBsnTranslation(bsnOrKvk: string): string {
  return translationsJson?.[bsnOrKvk] ?? bsnOrKvk;
}

function transformBelastingResponse(response: BelastingenSourceContent) {
  const isKnown: boolean =
    !!response?.status && response.status !== 'BSN unknown';
  const notifications: MyNotification[] = [];
  const tips: MyNotification[] = [];

  if (Array.isArray(response?.data)) {
    for (const message of response.data) {
      switch (message.categorie) {
        // Thema bericht wordt niet gebruikt omdat we "isKnown" bepalen aan de hand van de doorgegeven "status" (response.status !== 'BSN unknown')
        // case 'F2':
        //   break;
        // Melding / Notification
        case 'M1':
          notifications.push({
            id: `belasting-${message.nummer}`,
            themaID: ThemaIDs.BELASTINGEN,
            title: message.titel,
            datePublished: message.datum,
            description: message.omschrijving,
            link: {
              title: message.url_naam,
              to: message.url,
            },
          });
          break;
        // Tip
        case 'M2':
          tips.push({
            id: `belasting-${message.nummer}`,
            datePublished: message.datum,
            title: message.titel,
            description: message.omschrijving,
            tipReason: message.informatie,
            isTip: true,
            themaID: ThemaIDs.BELASTINGEN,
            link: {
              title: message.url_naam,
              to: message.url,
            },
          });
          break;
      }
    }
  }

  return {
    isKnown,
    notifications,
    tips,
  };
}

function getConfig(bsnOrKvk: string = ''): DataRequestConfig {
  return getApiConfig('BELASTINGEN', {
    headers: {
      Authorization: `Bearer ${process.env.BFF_BELASTINGEN_BEARER_TOKEN}`,
      subjid: getBsnTranslation(bsnOrKvk),
    },
    transformResponse: transformBelastingResponse,
  });
}

export function fetchBelasting(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken
) {
  return fetchService(requestID, getConfig(authProfileAndToken.profile.id));
}

export async function fetchBelastingNotifications(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const r = await fetchTipsAndNotifications(
    requestID,
    getConfig(authProfileAndToken.profile.id),
    ThemaIDs.BELASTINGEN
  );

  return r;
}

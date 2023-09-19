import { Chapters } from '../../../universal/config';
import { MyNotification, MyTip } from '../../../universal/types';
import { DataRequestConfig, getApiConfig } from '../../config';
import { AuthProfileAndToken } from '../../helpers/app';
import { fetchTipsAndNotifications, fetchService } from './api-service';

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
  const tips: MyTip[] = [];

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
            chapter: Chapters.BELASTINGEN,
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
            priority: message.prioriteit,
            datePublished: message.datum,
            title: message.titel,
            description: message.omschrijving,
            reason: message.informatie ? [message.informatie] : [],
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
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  return fetchService(requestID, getConfig(authProfileAndToken.profile.id));
}

export async function fetchBelastingNotifications(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  return fetchTipsAndNotifications(
    requestID,
    getConfig(authProfileAndToken.profile.id),
    Chapters.BELASTINGEN
  );
}

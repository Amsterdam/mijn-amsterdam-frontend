import { Chapters } from '../../../universal/config';
import { apiSuccessResult } from '../../../universal/helpers';
import { MyNotification, MyTip } from '../../../universal/types';
import { DataRequestConfig, getApiConfig } from '../../config';
import { AuthProfileAndToken } from '../../helpers/app';
import { fetchGenerated, fetchService } from './api-service';

const translationsJson = JSON.parse(
  process.env.BFF_BELASTINGEN_BSN_TRANSLATIONS || ''
);

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
  const isKnown: boolean = response.status !== 'BSN unknown';
  const notifications: MyNotification[] = [];
  const tips: MyTip[] = [];

  for (const message of response.data) {
    switch (message.categorie) {
      // Thema bericht
      case 'F2':
        continue;
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
          isPersonalized: true,
          link: {
            title: message.url_naam,
            to: message.url,
          },
        });
        break;
    }
  }

  return apiSuccessResult({
    isKnown,
    notifications,
    tips,
  });
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

export async function fetchBelastingGenerated(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  return fetchGenerated(
    requestID,
    getConfig(authProfileAndToken.profile.id),
    Chapters.BELASTINGEN
  );
}

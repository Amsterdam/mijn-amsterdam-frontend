import {
  fetchService,
  fetchTipsAndNotifications,
  type ApiPatternResponseA,
} from './api-service';
import {
  BELASTINGEN_ROUTE_DEFAULT,
  themaId,
  themaTitle,
} from '../../../client/pages/Thema/Belastingen/Belastingen-thema-config';
import { MyNotification } from '../../../universal/types/App.types';
import { AuthProfileAndToken } from '../../auth/auth-types';
import { DataRequestConfig } from '../../config/source-api';
import { getFromEnv } from '../../helpers/env';
import { getApiConfig } from '../../helpers/source-api-helpers';
import process from "node:process";

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

function transformBelastingResponse(
  response: BelastingenSourceContent,
  profileType: ProfileType
): ApiPatternResponseA {
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
            themaID: themaId,
            themaTitle: themaTitle,
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
            themaID: themaId,
            themaTitle: themaTitle,
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
    url:
      (profileType === 'commercial'
        ? getFromEnv('BFF_SSO_URL_BELASTINGEN_EHERKENNING')
        : getFromEnv('BFF_SSO_URL_BELASTINGEN_DIGID')) ??
      BELASTINGEN_ROUTE_DEFAULT,
  };
}

function getConfig(
  authProfileAndToken: AuthProfileAndToken
): DataRequestConfig {
  return getApiConfig('BELASTINGEN', {
    headers: {
      Authorization: `Bearer ${process.env.BFF_BELASTINGEN_BEARER_TOKEN}`,
      subjid: getBsnTranslation(authProfileAndToken.profile.id),
    },
    transformResponse(response: BelastingenSourceContent) {
      return transformBelastingResponse(
        response,
        authProfileAndToken.profile.profileType
      );
    },
  });
}

export function fetchBelasting(authProfileAndToken: AuthProfileAndToken) {
  return fetchService(getConfig(authProfileAndToken));
}

export async function fetchBelastingNotifications(
  authProfileAndToken: AuthProfileAndToken
) {
  const r = await fetchTipsAndNotifications(
    getConfig(authProfileAndToken),
    themaId
  );

  return r;
}

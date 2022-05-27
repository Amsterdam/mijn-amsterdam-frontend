import jose from 'jose';
import { Chapters } from '../../../universal/config';
import { MyNotification } from '../../../universal/types';
import { DataRequestConfig, getApiConfig } from '../../config';
import { AuthProfileAndToken } from '../../helpers/app';
import { fetchGenerated, fetchService } from './api-service';

function getJSONRequestPayload(
  profile: AuthProfileAndToken['profile']
): string {
  const payload: MilieuzoneRequestPayload =
    profile.profileType === 'commercial'
      ? {
          kvk: profile.id!,
        }
      : {
          bsn: profile.id!,
        };
  return JSON.stringify(payload);
}

function encryptPayload(payload: MilieuzoneRequestPayloadString) {
  const x509PubKey = jose.JWK.asKey(process.env.BFF_CLEOPATRA_PUB_KEY + '');
  const protectedHeader = {
    alg: 'RSA-OAEP-256',
    enc: 'A256CBC-HS512',
    kid: x509PubKey.kid,
  };
  return jose.JWE.encrypt(payload, x509PubKey, protectedHeader);
}

interface MilieuzoneMessage {
  thema: 'Milieuzone';
  categorie: 'F2' | 'M1' | 'F3';
  nummer: number;
  prioriteit: number;
  datum: string;
  titel: string;
  omschrijving: string;
  url: string;
  urlNaam: string;
  informatie: string;
}

interface MilieuzoneSourceContent {
  status: 'BSN known' | 'BSN unknown'; // ??????
  data: MilieuzoneMessage[];
}

type MilieuzoneRequestPayload = { kvk: string } | { bsn: string };
type MilieuzoneRequestPayloadString = string;

function transformMilieuzoneResponse(response: MilieuzoneSourceContent) {
  const notifications: MyNotification[] = [];
  let isKnown: boolean = false;

  console.log('transformer', response);

  for (const message of response.data) {
    switch (message.categorie) {
      case 'F2':
        isKnown = true;
        break;
      // Melding / Notification
      case 'M1':
      case 'F3':
        notifications.push({
          id: `milieuzone-${message.categorie}`,
          chapter: Chapters.MILIEUZONE,
          title: message.titel,
          datePublished: message.datum,
          description: message.omschrijving,
          link: {
            title: message.urlNaam,
            to: message.url,
          },
        });
        break;
    }
  }

  return {
    isKnown,
    notifications,
  };
}

function getConfig(
  authProfileAndToken: AuthProfileAndToken
): DataRequestConfig {
  const postData = encryptPayload(
    getJSONRequestPayload(authProfileAndToken.profile)
  );

  return getApiConfig('MILIEUZONE', {
    transformResponse: transformMilieuzoneResponse,
    data: postData,
  });
}

export async function fetchMilieuzone(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  return fetchService(requestID, getConfig(authProfileAndToken), false);
}

export async function fetchMilieuzoneGenerated(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const response = await fetchGenerated(
    requestID,
    getConfig(authProfileAndToken),
    Chapters.MILIEUZONE
  );

  return response;
}

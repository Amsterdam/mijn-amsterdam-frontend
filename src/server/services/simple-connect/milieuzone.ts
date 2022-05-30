import { Chapters } from '../../../universal/config';
import { MyNotification } from '../../../universal/types';
import { DataRequestConfig, getApiConfig } from '../../config';
import { AuthProfileAndToken } from '../../helpers/app';
import { fetchGenerated, fetchService } from './api-service';
import jose from 'node-jose';
import fs from 'fs';

const keystore = jose.JWK.createKeyStore();
const certContent = fs
  .readFileSync(process.env.BFF_CLEOPATRA_PUB_KEY + '')
  .toString();

const pemPubKey = keystore.add(certContent, 'pem');

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

export async function encryptPayload(payload: MilieuzoneRequestPayloadString) {
  const key = await pemPubKey;

  return jose.JWE.createEncrypt(key).update(payload).final();
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

type MilieuzoneRequestPayload = { kvk: string } | { bsn: string };
type MilieuzoneRequestPayloadString = string;

function transformMilieuzoneResponse(response: MilieuzoneMessage[]) {
  const notifications: MyNotification[] = [];
  let isKnown: boolean = false;

  for (const message of response) {
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

async function getConfig(
  authProfileAndToken: AuthProfileAndToken
): Promise<DataRequestConfig> {
  const postData = await encryptPayload(
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
  return fetchService(requestID, await getConfig(authProfileAndToken), false);
}

export async function fetchMilieuzoneGenerated(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const response = await fetchGenerated(
    requestID,
    await getConfig(authProfileAndToken),
    Chapters.MILIEUZONE
  );

  return response;
}

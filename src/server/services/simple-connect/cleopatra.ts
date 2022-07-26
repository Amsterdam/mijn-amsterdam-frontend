import fs from 'fs';
import jose from 'node-jose';
import { Chapters, IS_AP } from '../../../universal/config';
import { MyNotification } from '../../../universal/types';
import { DataRequestConfig, getApiConfig } from '../../config';
import { AuthProfileAndToken } from '../../helpers/app';
import { fetchGenerated, fetchService } from './api-service';

const DEV_KEY = {
  kty: 'RSA',
  kid: 'xxx',
  x5t: '8zMcftkkR9RYIvhvu4UrfAo0IaM',
  n: 'uTBrbjUH8Ry0A-dt9v0NJon3HPfo-b1ZKrW1eLUUChOUVop1qhlRck_IMx1o3zVETqe_nOmwHp4yC6NQNUfYWnHQfu858Zr-zfDpI1h1cjlgv5pdorJDxTDydNMwvYQIbbeblKWavGWaz7Pq3SK_AwACxIlcoJ09wNPKi2E3zSQBI0RpVQcYs38mtCa4iOT5DEbn7gibBVbtXxOC3NeWvhMXEJVeqAXWA0M2Df1qHGLo1gLund1hDR4rTQf4h62PSpVp8G3Hoo1zGpZlJJJo1RB2JNKqCIZkjs3f80ZhEP9_IIC0CgZdsyqpltf4ygsG_TycxgEuiAy1bVrDSy82xaZleV1hvjHrnlIAHNTfnNebmCMPzahrcExDjSMQbXWHWd00r5cs2E1YAv9iYox-MFflaUN0tto76GhsASnDC_V40mWLaRFEymIfanIgLZFtViW2kCBQJOEUtWrC3weLx_iTQQtvbSPhx-ayQQCpfKU_vShfkxUeqAcf5yoZDae3uqGoo-biCZMFDFo5i74biwvz-AQ5lRtsMRgQCpGDaHjQJ6P7pJeQlhrQhMwxvePGaUW0XcJ0l3C4YuNtLLHFtbxw3DieQRMbAkmpSzideOg9tIesCbAca8EvNipB3PowQ4TpZXPkK9HxsWL681_YRcu-QxCT79hhQJ9FDPbqbes',
  e: 'AQAB',
};

const keystore = jose.JWK.createKeyStore();
let certContent = '';
let path = process.env.BFF_CLEOPATRA_PUB_KEY;

try {
  if (IS_AP && path) {
    // NOTE: TEMP Fix for wrong certificate location
    certContent = fs.readFileSync(path).toString();
  }
} catch (error) {}

const pemPubKey =
  !IS_AP || !certContent
    ? keystore.add(DEV_KEY, 'json')
    : keystore.add(certContent, 'pem');

export function getJSONRequestPayload(
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

  return jose.JWE.createEncrypt(
    {
      format: 'flattened',
      fields: {
        alg: 'RSA-OAEP-256',
        enc: 'A256CBC-HS512',
        typ: 'JWE',
        kid: key.kid,
      },
    },
    key
  )
    .update(payload)
    .final();
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

  if (Array.isArray(response)) {
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

  return getApiConfig('CLEOPATRA', {
    transformResponse: transformMilieuzoneResponse,
    cacheKey: `cleopatra-${authProfileAndToken.profile.id}`,
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

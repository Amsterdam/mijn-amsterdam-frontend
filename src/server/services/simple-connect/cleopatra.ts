import fs from 'fs';
import jose from 'node-jose';
import { Chapters, FeatureToggle, IS_TAP } from '../../../universal/config';
import { apiSuccessResult } from '../../../universal/helpers';
import { MyNotification } from '../../../universal/types';
import { DataRequestConfig, getApiConfig } from '../../config';
import { AuthProfileAndToken } from '../../helpers/app';
import { ApiPatternResponseA, fetchService } from './api-service';

const DEV_KEY = {
  kty: 'RSA',
  kid: 'xxx',
  x5t: '8zMcftkkR9RYIvhvu4UrfAo0IaM',
  n: 'uTBrbjUH8Ry0A-dt9v0NJon3HPfo-b1ZKrW1eLUUChOUVop1qhlRck_IMx1o3zVETqe_nOmwHp4yC6NQNUfYWnHQfu858Zr-zfDpI1h1cjlgv5pdorJDxTDydNMwvYQIbbeblKWavGWaz7Pq3SK_AwACxIlcoJ09wNPKi2E3zSQBI0RpVQcYs38mtCa4iOT5DEbn7gibBVbtXxOC3NeWvhMXEJVeqAXWA0M2Df1qHGLo1gLund1hDR4rTQf4h62PSpVp8G3Hoo1zGpZlJJJo1RB2JNKqCIZkjs3f80ZhEP9_IIC0CgZdsyqpltf4ygsG_TycxgEuiAy1bVrDSy82xaZleV1hvjHrnlIAHNTfnNebmCMPzahrcExDjSMQbXWHWd00r5cs2E1YAv9iYox-MFflaUN0tto76GhsASnDC_V40mWLaRFEymIfanIgLZFtViW2kCBQJOEUtWrC3weLx_iTQQtvbSPhx-ayQQCpfKU_vShfkxUeqAcf5yoZDae3uqGoo-biCZMFDFo5i74biwvz-AQ5lRtsMRgQCpGDaHjQJ6P7pJeQlhrQhMwxvePGaUW0XcJ0l3C4YuNtLLHFtbxw3DieQRMbAkmpSzideOg9tIesCbAca8EvNipB3PowQ4TpZXPkK9HxsWL681_YRcu-QxCT79hhQJ9FDPbqbes',
  e: 'AQAB',
};

const keystore = jose.JWK.createKeyStore();
let certContent = '';
let path = process.env.BFF_CLEOPATRA_PUBLIC_KEY_CERT;

try {
  if (IS_TAP && path) {
    certContent = fs.readFileSync(path).toString();
  }
} catch (error) {}

const pemPubKey =
  !IS_TAP || !certContent
    ? keystore.add(DEV_KEY, 'json')
    : keystore.add(certContent, 'pem');

export function getJSONRequestPayload(
  profile: AuthProfileAndToken['profile']
): string {
  const payload: CleopatraRequestPayload =
    profile.profileType === 'commercial'
      ? {
          kvk: profile.id!,
        }
      : {
          bsn: profile.id!,
        };
  return JSON.stringify(payload);
}

export async function encryptPayload(payload: CleopatraRequestPayloadString) {
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

interface CleopatraMessage {
  thema: 'Milieuzone' | 'Overtredingen';
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

type CleopatraRequestPayload = { kvk: string } | { bsn: string };
type CleopatraRequestPayloadString = string;

type CleoPatraPatternResponse = ApiPatternResponseA & {
  isKnownMilieuzone: boolean;
  isKnownOvertredingen: boolean;
};

function transformCleopatraResponse(response: CleopatraMessage[]) {
  const notifications: MyNotification[] = [];
  let isKnownMilieuzone: boolean = false;
  let isKnownOvertredingen: boolean = false;

  if (Array.isArray(response)) {
    for (const message of response) {
      switch (true) {
        case message.categorie === 'F2' && message.thema === 'Overtredingen':
          isKnownOvertredingen = true;
          break;
        case message.categorie === 'F2' && message.thema === 'Milieuzone':
          isKnownMilieuzone = true;
          break;
        // Melding / Notification
        case message.categorie === 'M1' || message.categorie === 'F3':
          {
            let chapter = Chapters.MILIEUZONE;

            if (
              FeatureToggle.overtredingenActive &&
              message.thema === 'Overtredingen'
            ) {
              chapter = Chapters.OVERTREDINGEN;
            }

            notifications.push({
              id: `${chapter}-${message.categorie}`,
              chapter,
              title: message.titel,
              datePublished: message.datum,
              description: message.omschrijving,
              link: {
                title: message.urlNaam,
                to: message.url,
              },
            });
          }
          break;
      }
    }
  }

  return {
    isKnownOvertredingen,
    isKnownMilieuzone,
    notifications,
  };
}

async function getConfig(
  authProfileAndToken: AuthProfileAndToken,
  requestID: requestID
): Promise<DataRequestConfig> {
  const postData = await encryptPayload(
    getJSONRequestPayload(authProfileAndToken.profile)
  );

  return getApiConfig('CLEOPATRA', {
    transformResponse: transformCleopatraResponse,
    cacheKey: `cleopatra-${requestID}`,
    data: postData,
  });
}

async function fetchCleopatra(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const INCLUDE_TIPS_AND_NOTIFICATIONS = true;
  return fetchService<CleoPatraPatternResponse>(
    requestID,
    await getConfig(authProfileAndToken, requestID),
    INCLUDE_TIPS_AND_NOTIFICATIONS
  );
}

export async function fetchMilieuzone(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const response = await fetchCleopatra(requestID, authProfileAndToken);

  if (response.status === 'OK') {
    return apiSuccessResult({
      isKnown: response.content?.isKnownMilieuzone ?? false,
    });
  }

  return response;
}

export async function fetchOvertredingen(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const response = await fetchCleopatra(requestID, authProfileAndToken);

  if (response.status === 'OK') {
    return apiSuccessResult({
      isKnown: response.content?.isKnownOvertredingen ?? false,
    });
  }

  return response;
}

export async function fetchMilieuzoneNotifications(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const response = await fetchCleopatra(requestID, authProfileAndToken);

  if (response.status === 'OK') {
    return apiSuccessResult({
      notifications:
        response.content?.notifications?.filter(
          (notifiction) => notifiction.chapter === Chapters.MILIEUZONE
        ) ?? [],
    });
  }

  return response;
}

export async function fetchOvertredingenNotifications(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const response = await fetchCleopatra(requestID, authProfileAndToken);

  if (response.status === 'OK') {
    return apiSuccessResult({
      notifications:
        response.content?.notifications?.filter(
          (notifiction) => notifiction.chapter === Chapters.OVERTREDINGEN
        ) ?? [],
    });
  }

  return response;
}

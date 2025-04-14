import jose from 'node-jose';

import { ApiPatternResponseA, fetchService } from './api-service';
import { IS_TAP } from '../../../universal/config/env';
import { FeatureToggle } from '../../../universal/config/feature-toggles';
import { ThemaIDs } from '../../../universal/config/thema';
import {
  apiErrorResult,
  apiSuccessResult,
} from '../../../universal/helpers/api';
import { MyNotification } from '../../../universal/types';
import { AuthProfileAndToken } from '../../auth/auth-types';
import { getCert } from '../../helpers/cert';
import { getApiConfig } from '../../helpers/source-api-helpers';
import { logger } from '../../logging';

const DEV_KEY = {
  kty: 'RSA',
  kid: 'xxx',
  x5t: '8zMcftkkR9RYIvhvu4UrfAo0IaM',
  n: 'uTBrbjUH8Ry0A-dt9v0NJon3HPfo-b1ZKrW1eLUUChOUVop1qhlRck_IMx1o3zVETqe_nOmwHp4yC6NQNUfYWnHQfu858Zr-zfDpI1h1cjlgv5pdorJDxTDydNMwvYQIbbeblKWavGWaz7Pq3SK_AwACxIlcoJ09wNPKi2E3zSQBI0RpVQcYs38mtCa4iOT5DEbn7gibBVbtXxOC3NeWvhMXEJVeqAXWA0M2Df1qHGLo1gLund1hDR4rTQf4h62PSpVp8G3Hoo1zGpZlJJJo1RB2JNKqCIZkjs3f80ZhEP9_IIC0CgZdsyqpltf4ygsG_TycxgEuiAy1bVrDSy82xaZleV1hvjHrnlIAHNTfnNebmCMPzahrcExDjSMQbXWHWd00r5cs2E1YAv9iYox-MFflaUN0tto76GhsASnDC_V40mWLaRFEymIfanIgLZFtViW2kCBQJOEUtWrC3weLx_iTQQtvbSPhx-ayQQCpfKU_vShfkxUeqAcf5yoZDae3uqGoo-biCZMFDFo5i74biwvz-AQ5lRtsMRgQCpGDaHjQJ6P7pJeQlhrQhMwxvePGaUW0XcJ0l3C4YuNtLLHFtbxw3DieQRMbAkmpSzideOg9tIesCbAca8EvNipB3PowQ4TpZXPkK9HxsWL681_YRcu-QxCT79hhQJ9FDPbqbes',
  e: 'AQAB',
};

function getPublicKey() {
  const keystore = jose.JWK.createKeyStore();
  let certContent;

  try {
    if (IS_TAP) {
      certContent = getCert('BFF_CLEOPATRA_PUBLIC_KEY_CERT');
    }
  } catch (error) {
    logger.error(error, 'Error getting public key');
  }

  const pemPubKey = !IS_TAP
    ? keystore.add(DEV_KEY, 'json')
    : certContent
      ? keystore.add(certContent, 'pem')
      : Promise.resolve(undefined);

  return pemPubKey;
}

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
  const key = await getPublicKey();

  if (key) {
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

  return null;
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
            let thema:
              | typeof ThemaIDs.MILIEUZONE
              | typeof ThemaIDs.OVERTREDINGEN = ThemaIDs.MILIEUZONE;

            if (
              FeatureToggle.overtredingenActive &&
              message.thema === 'Overtredingen'
            ) {
              thema = ThemaIDs.OVERTREDINGEN;
            }

            notifications.push({
              id: `${thema}-${message.categorie}`,
              themaID: thema,
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

async function fetchCleopatra(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const INCLUDE_TIPS_AND_NOTIFICATIONS = true;

  const postData = await encryptPayload(
    getJSONRequestPayload(authProfileAndToken.profile)
  );

  if (!postData) {
    return apiErrorResult('Postdata could not be encrypted', null);
  }

  const requestConfig = getApiConfig('CLEOPATRA', {
    transformResponse: transformCleopatraResponse,
    cacheKey: `cleopatra-${requestID}`,
    data: postData,
  });

  return fetchService<CleoPatraPatternResponse>(
    requestID,
    requestConfig,
    INCLUDE_TIPS_AND_NOTIFICATIONS
  );
}

export async function fetchMilieuzone(
  requestID: RequestID,
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
  requestID: RequestID,
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
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const response = await fetchCleopatra(requestID, authProfileAndToken);

  if (response.status === 'OK') {
    return apiSuccessResult({
      notifications:
        response.content?.notifications?.filter(
          (notifiction) => notifiction.themaID === ThemaIDs.MILIEUZONE
        ) ?? [],
    });
  }

  return response;
}

export async function fetchOvertredingenNotifications(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const response = await fetchCleopatra(requestID, authProfileAndToken);

  if (response.status === 'OK') {
    return apiSuccessResult({
      notifications:
        response.content?.notifications?.filter(
          (notifiction) => notifiction.themaID === ThemaIDs.OVERTREDINGEN
        ) ?? [],
    });
  }

  return response;
}

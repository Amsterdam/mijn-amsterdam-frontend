import crypto from 'crypto';
import jose from 'jose';
import { URL, URLSearchParams } from 'url';
import { Chapters } from '../../../universal/config';
import { apiSuccessResult } from '../../../universal/helpers/api';
import { MyNotification } from '../../../universal/types';
import { getApiConfig } from '../../config';
import { AuthProfile, AuthProfileAndToken } from '../../helpers/app';
import { fetchGenerated, fetchService } from './api-service';
import { Buffer } from 'buffer';

export function decrypt(encryptedValue: string, encryptionKey: string) {
  const keyBuffer = Buffer.from(encryptionKey);
  const decodedBuffer = Buffer.from(encryptedValue, 'base64');
  const ivBuffer = decodedBuffer.slice(0, 16);
  const dataBuffer = decodedBuffer.slice(16);

  const decipheriv = crypto.createDecipheriv(
    'aes-128-cbc',
    keyBuffer,
    ivBuffer
  );
  return decipheriv.update(dataBuffer).toString() + decipheriv.final('utf-8');
}

export function encrypt(plainText: string, encryptionKey: string) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-128-cbc', encryptionKey, iv);
  const encrypted = Buffer.concat([cipher.update(plainText), cipher.final()]);

  return Buffer.concat([iv, encrypted]).toString('base64url');
}

function getJWT() {
  return jose.JWT.sign(
    {
      iss: process.env.BFF_SISA_CLIENT_ID,
      iat: Date.now(),
    },
    jose.JWK.asKey(process.env.BFF_SISA_CLIENT_SECRET || ''),
    {
      algorithm: 'HS256',
    }
  );
}

function addAuthMethodToNotificationLinks(
  notifications: MyNotification[],
  authMethod: AuthProfile['authMethod']
): MyNotification[] {
  return notifications.map((notification) => {
    const urlTo = new URL(notification.link?.to || '/');
    const params = new URLSearchParams(urlTo.search);

    if (!params.get('authMethod')) {
      params.set('authMethod', authMethod);
    }

    const url = `${urlTo.origin}${urlTo.pathname}?${params.toString()}`;

    return Object.assign(notification, {
      link: {
        ...notification.link,
        to: new URL(url).toString(),
      },
    });
  });
}

function getConfig(authProfileAndToken: AuthProfileAndToken) {
  const apiEndpointUrl =
    authProfileAndToken.profile.authMethod === 'digid'
      ? process.env.BFF_SISA_API_BSN_ENDPOINT
      : process.env.BFF_SISA_API_KVK_ENDPOINT;

  const url =
    apiEndpointUrl +
    encrypt(
      authProfileAndToken.profile.id + '',
      process.env.BFF_SISA_ENCRYPTION_KEY + ''
    );

  return getApiConfig('SUBSIDIE', {
    url,
    headers: {
      Authorization: `Bearer ${getJWT()}`,
    },
  });
}

export async function fetchSubsidie(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  return fetchService(requestID, getConfig(authProfileAndToken), false);
}

export async function fetchSubsidieGenerated(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const response = await fetchGenerated(
    requestID,
    getConfig(authProfileAndToken),
    Chapters.SUBSIDIE
  );

  if (response.status === 'OK' && response.content?.notifications) {
    return apiSuccessResult({
      ...response.content,
      notifications: addAuthMethodToNotificationLinks(
        response.content.notifications,
        authProfileAndToken.profile.authMethod
      ),
    });
  }

  return response;
}

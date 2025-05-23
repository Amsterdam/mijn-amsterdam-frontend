import { URL, URLSearchParams } from 'url';

import * as jose from 'jose';

import {
  fetchService,
  fetchTipsAndNotifications,
  type ApiPatternResponseA,
} from './api-service';
import {
  SUBSIDIES_ROUTE_DEFAULT,
  themaId,
} from '../../../client/pages/Thema/Subsidies/Subsidies-thema-config';
import { apiSuccessResult } from '../../../universal/helpers/api';
import { MyNotification } from '../../../universal/types/App.types';
import { AuthProfile, AuthProfileAndToken } from '../../auth/auth-types';
import { encrypt } from '../../helpers/encrypt-decrypt';
import { getFromEnv } from '../../helpers/env';
import {
  createSessionBasedCacheKey,
  getApiConfig,
} from '../../helpers/source-api-helpers';

async function getJWT() {
  const secret = new TextEncoder().encode(process.env.BFF_SISA_CLIENT_SECRET);
  const jwt = await new jose.SignJWT({
    iss: process.env.BFF_SISA_CLIENT_ID,
    iat: Date.now(),
  })
    .setProtectedHeader({ alg: 'HS256' })
    .sign(secret);
  return jwt;
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

async function getConfig(authProfileAndToken: AuthProfileAndToken) {
  const apiEndpointUrl =
    process.env.BFF_SISA_API_ENDPOINT +
    (authProfileAndToken.profile.authMethod === 'digid'
      ? 'citizen/'
      : 'company/');

  const [ivAndPayload] = encrypt(
    authProfileAndToken.profile.id + '',
    process.env.BFF_SISA_ENCRYPTION_KEY + ''
  );

  const url = apiEndpointUrl + ivAndPayload;
  const jwt = await getJWT();

  return getApiConfig('SUBSIDIES', {
    url,
    cacheKey_UNSAFE: createSessionBasedCacheKey(
      authProfileAndToken.profile.sid
    ),
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
    transformResponse(
      response: Omit<ApiPatternResponseA, 'url'>
    ): ApiPatternResponseA {
      return {
        ...response,
        url: getFromEnv('BFF_SSO_URL_SUBSIDIES') ?? SUBSIDIES_ROUTE_DEFAULT,
      };
    },
  });
}

export async function fetchSubsidie(authProfileAndToken: AuthProfileAndToken) {
  return fetchService(await getConfig(authProfileAndToken), false);
}

export async function fetchSubsidieNotifications(
  authProfileAndToken: AuthProfileAndToken
) {
  const response = await fetchTipsAndNotifications(
    await getConfig(authProfileAndToken),
    themaId
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

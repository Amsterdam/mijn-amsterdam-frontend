import memoize from 'memoizee';

import { ThemaIDs } from '../../universal/config/thema';
import {
  apiDependencyError,
  ApiResponse,
  apiSuccessResult,
} from '../../universal/helpers/api';
import { omit } from '../../universal/helpers/utils';
import { LinkProps, MyNotification } from '../../universal/types';
import { AuthProfileAndToken } from '../auth/auth-types';
import { DEFAULT_API_CACHE_TTL_MS } from '../config/source-api';
import { getApiConfig } from '../helpers/source-api-helpers';
import { requestData } from '../helpers/source-api-request';

interface NotificationTrigger {
  datePublished: string;
  url: string;
}

export interface KrefiaDeepLink {
  status: string;
  link: LinkProps;
  type: 'budgetbeheer' | 'lening' | 'schuldhulp';
}

interface NotificationTriggers {
  fibu: NotificationTrigger | null;
  krediet: NotificationTrigger | null;
}

type KrefiaDeepLinkSource = {
  title: string;
  url: string;
};

export interface KrefiaDeepLinksSource {
  budgetbeheer: KrefiaDeepLinkSource | null;
  lening: KrefiaDeepLinkSource | null;
  schuldhulp: KrefiaDeepLinkSource | null;
}

export type KrefiaSourceResponse = ApiResponse<{
  notificationTriggers: NotificationTriggers | null;
  deepLinks: KrefiaDeepLinksSource;
}>;

export interface Krefia {
  notificationTriggers: NotificationTriggers | null;
  deepLinks: KrefiaDeepLink[];
}

function createNotification(
  message: NotificationTrigger,
  type: 'fibu' | 'krediet'
): MyNotification {
  const isFibu = type === 'fibu';
  return {
    id: `krefia-${type}-notification`,
    datePublished: message.datePublished,
    title: isFibu
      ? 'Bericht Budgetbeheer (FIBU)'
      : `Bericht Kredietbank Amsterdam`,
    themaID: ThemaIDs.KREFIA,
    description: isFibu
      ? 'Er staan ongelezen berichten voor u klaar van Budgetbeheer (FIBU)'
      : 'Er staan ongelezen berichten voor u klaar van Kredietbank Amsterdam',
    link: { to: message.url, title: 'Bekijk uw bericht' },
  };
}

function getLinkText(deepLinkType: KrefiaDeepLink['type']) {
  let linkText = 'Bekijk op Krefia';
  switch (deepLinkType) {
    case 'budgetbeheer':
      linkText = 'Ga naar budgetbeheer';
      break;
    case 'lening':
      linkText = 'Bekijk uw lening';
      break;
    case 'schuldhulp':
      linkText = 'Bekijk uw schuldregeling';
      break;
  }
  return linkText;
}

function transformKrefiaResponse(responseData: KrefiaSourceResponse): Krefia {
  return {
    deepLinks: Object.entries(responseData.content?.deepLinks ?? {})
      .filter(([_key, deepLink]) => !!deepLink)
      .map(([key, deepLink]) => {
        const deepLinkType = key as KrefiaDeepLink['type'];
        const title = getLinkText(deepLinkType);
        const krefiaDeepLink: KrefiaDeepLink = {
          status: deepLink.title,
          link: {
            to: deepLink.url,
            title,
          },
          type: deepLinkType,
        };
        return krefiaDeepLink;
      }),
    notificationTriggers: responseData.content?.notificationTriggers ?? null,
  };
}

async function fetchAndTransformKrefia(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken
): Promise<ApiResponse<Krefia>> {
  const response = await requestData<Krefia>(
    getApiConfig('KREFIA', {
      transformResponse: transformKrefiaResponse,
    }),
    requestID,
    authProfileAndToken
  );

  return response;
}

export const fetchSource = memoize(fetchAndTransformKrefia, {
  maxAge: DEFAULT_API_CACHE_TTL_MS,
  normalizer: function (args: unknown[]) {
    return args[0] + JSON.stringify(args[1]);
  },
});

export async function fetchKrefia(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const response = await fetchSource(requestID, authProfileAndToken);
  if (response.status === 'OK' && response.content) {
    return apiSuccessResult(omit(response.content, ['notificationTriggers']));
  }
  return response;
}

export async function fetchKrefiaNotifications(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const response = await fetchSource(requestID, authProfileAndToken);

  if (response.status === 'OK') {
    const notifications: MyNotification[] = [];

    if (response.content) {
      const fibuTrigger = response.content.notificationTriggers?.fibu;
      if (fibuTrigger) {
        notifications.push(createNotification(fibuTrigger, 'fibu'));
      }

      const kredietTrigger = response.content.notificationTriggers?.krediet;
      if (kredietTrigger) {
        notifications.push(createNotification(kredietTrigger, 'krediet'));
      }
    }

    return apiSuccessResult({
      notifications,
    });
  }
  return apiDependencyError({ response });
}

export const forTesting = {
  transformKrefiaResponse,
};

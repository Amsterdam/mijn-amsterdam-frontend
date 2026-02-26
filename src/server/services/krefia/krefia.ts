import type {
  NotificationTrigger,
  KrefiaDeepLink,
  KrefiaSourceResponse,
  Krefia,
} from './krefia.types';
import { themaConfig } from '../../../client/pages/Thema/Krefia/Krefia-thema-config';
import {
  type ApiResponse,
  apiSuccessResult,
  apiDependencyError,
} from '../../../universal/helpers/api';
import { omit } from '../../../universal/helpers/utils';
import type { MyNotification } from '../../../universal/types/App.types';
import type { AuthProfileAndToken } from '../../auth/auth-types';
import { getApiConfig } from '../../helpers/source-api-helpers';
import { requestData } from '../../helpers/source-api-request';

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
    themaID: themaConfig.id,
    themaTitle: themaConfig.title,
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
          displayStatus: deepLink.title,
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

export async function fetchAndTransformKrefia(
  authProfileAndToken: AuthProfileAndToken
): Promise<ApiResponse<Krefia>> {
  const response = await requestData<Krefia>(
    getApiConfig('KREFIA', {
      transformResponse: transformKrefiaResponse,
    }),
    authProfileAndToken
  );

  return response;
}

export async function fetchKrefia(authProfileAndToken: AuthProfileAndToken) {
  const response = await fetchAndTransformKrefia(authProfileAndToken);
  if (response.status === 'OK' && response.content) {
    return apiSuccessResult(omit(response.content, ['notificationTriggers']));
  }
  return response;
}

export async function fetchKrefiaNotifications(
  authProfileAndToken: AuthProfileAndToken
) {
  const response = await fetchAndTransformKrefia(authProfileAndToken);

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

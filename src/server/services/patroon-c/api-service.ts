import { AxiosResponseTransformer } from 'axios';

import {
  apiSuccessResult,
  type ApiResponse,
} from '../../../universal/helpers/api';
import { omit } from '../../../universal/helpers/utils';
import { MyNotification } from '../../../universal/types/App.types';
import { AuthProfileAndToken } from '../../auth/auth-types';
import { DataRequestConfig } from '../../config/source-api';
import { requestData } from '../../helpers/source-api-request';

export interface ApiPatternResponseA {
  tips?: MyNotification[];
  isKnown: boolean;
  url: string | null;
  notifications?: MyNotification[];
}

const transformApiResponseDefault: AxiosResponseTransformer = (
  response: ApiResponse<ApiPatternResponseA> | ApiPatternResponseA
) => {
  if (
    response !== null &&
    typeof response === 'object' &&
    'content' in response &&
    'status' in response
  ) {
    return response.content;
  }
  return response;
};

export async function fetchService<T extends ApiPatternResponseA>(
  apiConfig: DataRequestConfig = {},
  includeTipsAndNotifications: boolean = false,
  authProfileAndToken?: AuthProfileAndToken
): Promise<ApiResponse<T>> {
  const transformResponse = [transformApiResponseDefault].concat(
    apiConfig.transformResponse ?? []
  );
  const apiConfigMerged: DataRequestConfig = {
    ...apiConfig,
    transformResponse,
  };

  const response = await requestData<T>(apiConfigMerged, authProfileAndToken);

  if (response.status === 'OK' && !includeTipsAndNotifications) {
    return Object.assign({}, response, {
      content:
        response.content &&
        typeof response.content === 'object' &&
        ('notifications' in response.content || 'tips' in response.content)
          ? omit(response.content, ['notifications', 'tips'])
          : response.content,
    });
  }

  return response;
}

export function transformNotificationsDefault<ID extends string = string>(
  notifications: MyNotification[],
  themaID: ID
) {
  const notificationsTransformed = Array.isArray(notifications)
    ? notifications.map((notification) => ({
        ...notification,
        themaID,
        link: {
          title:
            notification.link?.title || 'Meer informatie over deze melding',
          to: notification.link?.to || '',
        },
      }))
    : [];

  return notificationsTransformed;
}

export async function fetchTipsAndNotifications<ID extends string = string>(
  apiConfig: DataRequestConfig = {},
  themaID: ID,
  authProfileAndToken?: AuthProfileAndToken
): Promise<
  ApiResponse<Pick<ApiPatternResponseA, 'notifications' | 'tips'> | null>
> {
  const response = await fetchService(apiConfig, true, authProfileAndToken);

  if (response.status === 'OK') {
    const responseData: Pick<ApiPatternResponseA, 'notifications' | 'tips'> =
      {};

    if (response.content?.notifications) {
      responseData.notifications = transformNotificationsDefault(
        response.content.notifications,
        themaID
      );
    }

    if (response.content?.tips) {
      responseData.tips = response.content?.tips;
    }

    return apiSuccessResult(responseData);
  }

  return response;
}

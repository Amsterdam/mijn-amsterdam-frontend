import { Chapter } from '../../../universal/config';
import {
  apiDependencyError,
  apiErrorResult,
  ApiResponse,
  apiSuccessResult,
  omit,
} from '../../../universal/helpers';
import { MyNotification, MyTip } from '../../../universal/types';
import { DataRequestConfig } from '../../config';
import { requestData } from '../../helpers';

export interface ApiPatternResponseA {
  tips?: MyTip[];
  isKnown: boolean;
  notifications?: MyNotification[];
}

export async function fetchService<T extends ApiPatternResponseA>(
  requestID: requestID,
  apiConfig: DataRequestConfig = {},
  includeGenerated: boolean = false
): Promise<ApiResponse<ApiPatternResponseA | null>> {
  const response = await requestData<T>(apiConfig, requestID);

  if (response.status === 'OK' && !includeGenerated) {
    return Object.assign({}, response, {
      content: response.content
        ? omit(response.content, ['notifications', 'tips'])
        : null,
    });
  }

  return response;
}

export function transformNotificationsDefault(
  notifications: MyNotification[],
  chapter: Chapter
) {
  const notificationsTransformed = Array.isArray(notifications)
    ? notifications.map((notification) => ({
        ...notification,
        chapter,
        link: {
          title:
            notification.link?.title || 'Meer informatie over deze melding',
          to: notification.link?.to || '',
        },
      }))
    : [];

  return notificationsTransformed;
}

export async function fetchGenerated(
  requestID: requestID,
  apiConfig: DataRequestConfig = {},
  chapter: Chapter
): Promise<ApiResponse<ApiPatternResponseA | null>> {
  const response = await fetchService(requestID, apiConfig, true);

  if (response.status === 'OK' && response.content?.notifications) {
    return apiSuccessResult({
      ...response.content,
      notifications: transformNotificationsDefault(
        response.content.notifications,
        chapter
      ),
    });
  }

  return response;
}

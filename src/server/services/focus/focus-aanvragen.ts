import { IS_PRODUCTION } from '../../../universal/config/env';
import {
  apiDependencyError,
  apiSuccesResult,
  ApiSuccessResponse,
  isRecentCase,
} from '../../../universal/helpers';
import { MyCase, MyNotification } from '../../../universal/types';
import { getApiConfig } from '../../config';
import { requestData } from '../../helpers';
import {
  createFocusNotification,
  createFocusRecentCase,
  isNotificationActual,
  transformToStatusItem,
} from './focus-helpers';
import {
  AanvraagRequestProcess,
  StatusItemRequestProcess,
} from './focus-types';

export const MONTHS_TO_KEEP_AANVRAAG_NOTIFICATIONS = 2;
/**
 * Focus api data has to be transformed extensively to make it readable and presentable to a client.
 */
export function fetchAanvragen(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>
) {
  const response = requestData<StatusItemRequestProcess[]>(
    getApiConfig('FOCUS_AANVRAGEN', {
      transformResponse: (
        response: ApiSuccessResponse<AanvraagRequestProcess[]>
      ) => response.content.map(transformToStatusItem),
    }),
    sessionID,
    passthroughRequestHeaders
  );

  return response;
}

export async function fetchNotificationsAndRecentCases(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>
) {
  const FOCUS_AANVRAGEN = await fetchAanvragen(
    sessionID,
    passthroughRequestHeaders
  );
  const compareDate = new Date();

  let notifications: MyNotification[] = [];
  let cases: MyCase[] = [];

  if (FOCUS_AANVRAGEN.status === 'OK') {
    const items = FOCUS_AANVRAGEN.content;
    notifications = items
      .filter(
        (item) =>
          !IS_PRODUCTION ||
          isNotificationActual(item.datePublished, compareDate)
      )
      .map(createFocusNotification);

    cases = items
      .filter(
        (item) =>
          isRecentCase(item.datePublished, compareDate) ||
          item.status !== 'besluit'
      )
      .map(createFocusRecentCase)
      .filter((recentCase) => recentCase !== null);

    return apiSuccesResult({
      cases,
      notifications,
    });
  }

  return apiDependencyError({ FOCUS_AANVRAGEN });
}

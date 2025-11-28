import { isFuture, isPast, parseISO } from 'date-fns';

import { sanitizeCmsContent } from './cms-content';
import {
  CMS_MAINTENANCE_NOTIFICATIONS_CACHE_TIMEOUT_MS,
  CMS_DATE_REGEX,
  DEFAULT_OTAP_ENV,
  DEFAULT_SEVERITY,
  notificationEnvMap,
  REPLACE_REL_URL_PARTS,
  CMS_TIME_REGEX,
  CMS_ENV_REGEX,
} from './cms-service-config';
import type {
  CMSEventData,
  CMSMaintenanceNotification,
  OtapEnv,
  CMSFeedItem,
  QueryParamsMaintenanceNotifications,
} from './cms-types';
import {
  themaId,
  themaTitle,
} from '../../../client/pages/MyNotifications/MyNotifications-config';
import {
  ApiResponse,
  apiSuccessResult,
  getFailedDependencies,
} from '../../../universal/helpers/api';
import { FORCE_RENEW_CACHE_TTL_MS } from '../../config/source-api';
import { getApiConfig } from '../../helpers/source-api-helpers';
import { requestData } from '../../helpers/source-api-request';

function isOtapEnvMatch(notification: CMSMaintenanceNotification): boolean {
  return notification.otapEnvs?.some((env) => notificationEnvMap[env]) ?? false;
}

function transformCMSEventResponse(
  eventData: CMSEventData
): CMSMaintenanceNotification {
  if (!eventData.item || !eventData.item.page) {
    throw new Error('Invalid CMS event data format');
  }

  const item = {
    title: eventData.item.page.title,
    path: eventData.item.relUrl.replace(REPLACE_REL_URL_PARTS, ''),
    themaID: themaId,
    themaTitle: themaTitle,
    isAlert: true,
    severity: DEFAULT_SEVERITY,
    datePublished: new Date().toISOString(),
  } as CMSMaintenanceNotification;

  for (const veld of eventData.item.page.cluster.veld) {
    switch (veld.Nam) {
      case 'Startdatum':
        item.dateStart = veld.Dtm.replace(CMS_DATE_REGEX, '$1-$2-$3');
        break;
      case 'Einddatum':
        item.dateEnd = veld.Dtm.replace(CMS_DATE_REGEX, '$1-$2-$3');
        break;
      case 'Starttijd':
        item.timeStart = veld.Tyd.replace(CMS_TIME_REGEX, '$1:$2');
        break;
      case 'Eindtijd':
        item.timeEnd = veld.Tyd.replace(CMS_TIME_REGEX, '$1:$2');
        break;
      case 'Toevoeging':
        {
          const otapEnvs =
            veld.Wrd.match(CMS_ENV_REGEX)?.map((env) =>
              env.toLowerCase().trim()
            ) ?? [];
          item.otapEnvs = (
            otapEnvs.length ? otapEnvs : [DEFAULT_OTAP_ENV]
          ) as OtapEnv[];
        }
        break;
      case 'Locatie':
        {
          const severity = veld.Wrd.match(/(error|info|success|warning)/i)?.[0]
            .toLowerCase()
            .trim() as CMSMaintenanceNotification['severity'];
          item.severity = !severity ? DEFAULT_SEVERITY : severity;
        }
        break;
      case 'Website':
        if (veld.Src && veld.Wrd) {
          item.link = {
            title: veld.Wrd,
            to: veld.Src,
          };
        }
        break;
      case 'Omschrijving':
        item.description = sanitizeCmsContent(veld.Src);
        break;
    }
  }

  return item;
}

// We use the term Event here because we misuse the CMS Event content type for Maintenance Notifications.
async function fetchCMSEventData(url: string, forceRenew: boolean) {
  return requestData<CMSMaintenanceNotification>({
    url: url + '?Appidt=app-pagetype&reload=true',
    transformResponse: transformCMSEventResponse,
    cacheTimeout: forceRenew
      ? FORCE_RENEW_CACHE_TTL_MS
      : CMS_MAINTENANCE_NOTIFICATIONS_CACHE_TIMEOUT_MS,
  });
}

async function fetchCMSMaintenanceNotifications(
  forceRenew: boolean
): Promise<ApiResponse<CMSMaintenanceNotification[]>> {
  const requestConfig = getApiConfig('CMS_MAINTENANCE_NOTIFICATIONS', {
    cacheTimeout: forceRenew
      ? FORCE_RENEW_CACHE_TTL_MS
      : CMS_MAINTENANCE_NOTIFICATIONS_CACHE_TIMEOUT_MS,
  });

  const eventFeedResponse = await requestData<CMSFeedItem[]>(requestConfig);

  if (!eventFeedResponse.content?.length) {
    return apiSuccessResult([], getFailedDependencies({ eventFeedResponse }));
  }

  const eventItemsResponses = await Promise.all(
    eventFeedResponse.content.map((feedItem) =>
      fetchCMSEventData(feedItem.feedid, forceRenew)
    )
  );

  // We don't perform error handling here. We simply filter out possibly failed requests.
  // This particular endpoint is not critical for the application to function.
  // Failed requests are still logged in the requestData function.
  const notifications = eventItemsResponses
    .filter((response) => response.content !== null)
    .map((response) => response.content)
    .filter((notification) => isOtapEnvMatch(notification));

  return apiSuccessResult(notifications);
}

export async function fetchActiveMaintenanceNotifications(
  queryParams: QueryParamsMaintenanceNotifications
) {
  const maintenanceNotifications = await fetchCMSMaintenanceNotifications(
    queryParams.forceRenew === 'true'
  );

  if (!maintenanceNotifications.content?.length) {
    return maintenanceNotifications;
  }

  const filteredNotifications = maintenanceNotifications.content
    .filter((notification) =>
      queryParams?.page ? notification.path === `/${queryParams.page}` : true
    )
    .filter((notification) => {
      const startDateTime = parseISO(
        notification.dateStart + 'T' + notification.timeStart
      );
      const endDateTime = parseISO(
        notification.dateEnd + 'T' + notification.timeEnd
      );
      return isPast(startDateTime) && isFuture(endDateTime);
    });

  return apiSuccessResult(filteredNotifications);
}

export async function fetchMaintenanceNotificationsDashboard() {
  return fetchActiveMaintenanceNotifications({
    page: 'dashboard',
  });
}

export const forTesting = {
  fetchCMSMaintenanceNotifications,
  transformCMSEventResponse,
  isOtapEnvMatch,
};

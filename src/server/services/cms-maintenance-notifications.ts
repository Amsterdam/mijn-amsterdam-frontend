import { isFuture, isPast, parseISO } from 'date-fns';

import { sanitizeCmsContent } from './cms-content';
import { IS_TAP } from '../../universal/config/env';
import { ThemaIDs } from '../../universal/config/thema';
import {
  ApiResponse_DEPRECATED,
  ApiSuccessResponse,
  apiSuccessResult,
} from '../../universal/helpers/api';
import { LinkProps, MyNotification } from '../../universal/types/App.types';
import FileCache from '../helpers/file-cache';
import { getApiConfig } from '../helpers/source-api-helpers';
import { requestData } from '../helpers/source-api-request';

const fileCache = new FileCache({
  name: 'cms-maintenance-notifications',
  // eslint-disable-next-line no-magic-numbers
  cacheTimeMinutes: IS_TAP ? 45 / 60 : -1,
});

interface Tyd {
  Nam: 'Starttijd' | 'Eindtijd';
  Tyd: string;
}
interface Website {
  Nam: 'Website';
  Src: string;
  Wrd: string;
}
interface Dtm {
  Nam: 'Einddatum' | 'Startdatum';
  Dtm: string;
}
interface MeerInfo {
  Nam: 'Meer informatie';
  Src: string;
}
interface Omschrijving {
  Nam: 'Omschrijving';
  Src: string;
}

interface CMSEventData {
  item: {
    relUrl: string;
    page: {
      cluster: {
        veld: Array<Tyd | Website | Dtm | MeerInfo | Omschrijving>;
      };
      title: string;
      CorDtm: string;
    };
  };
}

interface CMSFeedItem {
  title: string;
  content: string;
  feedid: string;
}

export interface CMSMaintenanceNotification extends MyNotification {
  title: string;
  datePublished: string;
  dateStart: string;
  dateEnd: string;
  timeEnd: string;
  timeStart: string;
  description: string;
  path: string;
  link?: LinkProps;
}

function transformCMSEventResponse(
  eventData: CMSEventData
): CMSMaintenanceNotification {
  const item = {
    title: eventData.item.page.title,
    path: eventData.item.relUrl.replace(
      'storingsmeldingen/alle-meldingen-mijn-amsterdam',
      ''
    ),
    thema: ThemaIDs.NOTIFICATIONS,
    isAlert: true,
    datePublished: new Date().toISOString(),
  } as CMSMaintenanceNotification;

  for (const veld of eventData.item.page.cluster.veld) {
    switch (veld.Nam) {
      case 'Startdatum':
        item.dateStart = veld.Dtm.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3');
        break;
      case 'Einddatum':
        item.dateEnd = veld.Dtm.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3');
        break;
      case 'Starttijd':
        item.timeStart = veld.Tyd.replace(/(\d{2})(\d{2})/, '$1:$2');
        break;
      case 'Eindtijd':
        item.timeEnd = veld.Tyd.replace(/(\d{2})(\d{2})/, '$1:$2');
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
        item.description = veld.Src;
        break;
    }
  }

  return item;
}

async function fetchCMSMaintenanceNotifications(
  requestID: RequestID,
  useCache: boolean = true
): Promise<ApiResponse_DEPRECATED<CMSMaintenanceNotification[]>> {
  const cachedData = fileCache.getKey<
    ApiSuccessResponse<CMSMaintenanceNotification[]>
  >('CMS_MAINTENANCE_NOTIFICATIONS');

  if (useCache && cachedData) {
    return Promise.resolve(cachedData);
  }

  function fetchCMSEventData(url: string) {
    return requestData<CMSMaintenanceNotification>(
      {
        url: url + '?Appidt=app-pagetype&reload=true',
        transformResponse: transformCMSEventResponse,
        cacheTimeout: 0,
      },
      requestID
    );
  }

  const requestConfig = getApiConfig('CMS_MAINTENANCE_NOTIFICATIONS');

  const eventItems = await requestData<CMSFeedItem[]>(requestConfig, requestID)
    .then((apiData) => {
      if (Array.isArray(apiData.content)) {
        return Promise.all(
          apiData.content.map((feedItem) =>
            fetchCMSEventData(feedItem.feedid).then(
              (response) => response.content
            )
          )
        );
      }
      return [];
    })
    .then((notifications) => {
      return notifications
        .filter(
          (notification): notification is CMSMaintenanceNotification =>
            notification !== null
        )
        .map((notification) => {
          if (notification.description) {
            notification.description = sanitizeCmsContent(
              notification.description,
              {
                allowedAttributes: { a: [] },
                allowedTags: [],
                exclusiveFilter: () => true,
              }
            );
          }
          return notification;
        });
    });

  const eventItemsResponse = apiSuccessResult(
    eventItems.filter(
      (eventItem): eventItem is CMSMaintenanceNotification => eventItem !== null
    )
  );

  if (eventItemsResponse.content) {
    fileCache.setKey('CMS_MAINTENANCE_NOTIFICATIONS', eventItemsResponse);
    fileCache.save();
  }

  return eventItemsResponse;
}

export interface QueryParamsMaintenanceNotifications
  extends Record<string, string | undefined> {
  cache?: 'false' | string;
  page?: string;
}

export async function fetchMaintenanceNotificationsActual(
  requestID: RequestID,
  queryParams: QueryParamsMaintenanceNotifications
) {
  const maintenanceNotifications = await fetchCMSMaintenanceNotifications(
    requestID,
    queryParams?.cache !== 'false'
  );

  if (!maintenanceNotifications.content?.length) {
    return maintenanceNotifications;
  }

  return apiSuccessResult(
    maintenanceNotifications.content
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
      })
  );
}

export async function fetchMaintenanceNotificationsDashboard(
  requestID: RequestID
) {
  const maintenanceNotifications = await fetchMaintenanceNotificationsActual(
    requestID,
    { page: 'dashboard' }
  );

  if (!maintenanceNotifications.content?.length) {
    return maintenanceNotifications;
  }

  const [notification] = maintenanceNotifications.content;

  const item: MyNotification = {
    id: `maintenance-${notification.title}`,
    thema: ThemaIDs.NOTIFICATIONS,
    isAlert: true,
    datePublished: notification.datePublished,
    hideDatePublished: true,
    title: notification.title,
    description: notification.description,
  };

  if (notification.link) {
    item.link = notification.link;
  }

  return apiSuccessResult({ notifications: [notification] });
}

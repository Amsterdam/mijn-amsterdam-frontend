import marked from 'marked';
import { Chapters, IS_AP } from '../../universal/config';
import { ApiResponse, apiSuccesResult } from '../../universal/helpers';
import { LinkProps, MyNotification } from '../../universal/types/App.types';
import { getApiConfig } from '../config';
import FileCache from '../helpers/file-cache';
import { requestData } from '../helpers/source-api-request';

const fileCache = new FileCache({
  name: 'cms-maintenance-notifications',
  cacheTimeMinutes: IS_AP ? 24 * 60 : -1, // 24 hours
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
      CorDtm: String;
    };
  };
}

interface CMSFeedItem {
  title: string;
  content: string;
  feedid: string;
}

export interface CMSMaintenanceNotification {
  title: string;
  datePublished: string;
  dateStart: string;
  dateEnd: string;
  timeEnd: string;
  timeStart: string;
  description: string;
  moreInformation: string;
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
      case 'Meer informatie':
        item.moreInformation = veld.Src;
        break;
      case 'Omschrijving':
        item.description = veld.Src;
        break;
    }
  }

  return item;
}

export async function fetchCMSMaintenanceNotifications(
  sessionID: SessionID
): Promise<ApiResponse<CMSMaintenanceNotification[]>> {
  // const cachedData = fileCache.getKey('CMS_MAINTENANCE_NOTIFICATIONS');

  // if (cachedData) {
  //   return Promise.resolve(cachedData);
  // }

  function fetchCMSEventData(url: string) {
    return requestData<CMSMaintenanceNotification>(
      {
        url: url + '?Appidt=app-pagetype',
        transformResponse: transformCMSEventResponse,
        cacheTimeout: 0,
      },
      sessionID
    );
  }

  const requestConfig = getApiConfig('CMS_MAINTENANCE_NOTIFICATIONS');

  const eventItems = await requestData<CMSFeedItem[]>(
    requestConfig,
    sessionID
  ).then((apiData) => {
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
  });

  const eventItemsResponse = apiSuccesResult(
    eventItems.filter(
      (eventItem): eventItem is CMSMaintenanceNotification => eventItem !== null
    )
  );

  // if (eventItemsResponse.content) {
  //   fileCache.setKey('CMS_MAINTENANCE_NOTIFICATIONS', eventItemsResponse);
  //   fileCache.save();
  // }

  return eventItemsResponse;
}

export async function fetchMaintenanceNotificationsDashboard(
  sessionID: SessionID
) {
  const maintenanceNotifications = await fetchCMSMaintenanceNotifications(
    sessionID
  );

  if (!maintenanceNotifications.content?.length) {
    return maintenanceNotifications;
  }

  const dashboardNotifications = maintenanceNotifications.content.map(
    (notification, index) => {
      const item: MyNotification = {
        id: `maintenance-${index}-${notification.title}`,
        chapter: Chapters.NOTIFICATIONS,
        isAlert: true,
        datePublished: notification.datePublished,
        hideDatePublished: true,
        title: notification.title,
        description: notification.description,
      };
      if (notification.moreInformation) {
        item.moreInformation = notification.moreInformation;
      }
      if (notification.link) {
        item.link = notification.link;
      }
      return item;
    }
  );

  return apiSuccesResult({ notifications: dashboardNotifications });
}

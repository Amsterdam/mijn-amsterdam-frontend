import { IS_AP } from '../../universal/config';
import { ApiResponse, apiSuccesResult } from '../../universal/helpers';
import { getApiConfig } from '../config';
import FileCache from '../helpers/file-cache';
import { requestData } from '../helpers/source-api-request';
import { sanitizeCmsContent } from './cms-content';
import { cache } from './afval/afvalpunten';

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
    page: {
      cluster: {
        veld: Array<Tyd | Website | Dtm | MeerInfo | Omschrijving>;
      };
      title: string;
      content: string;
      feedid: string;
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
  dateStart: string;
  dateEnd: string;
  timeEnd: string;
  timeStart: string;
  description: string;
  moreInformation: string;
  url: string;
}

function transformCMSEventResponse(
  eventData: CMSEventData
): CMSMaintenanceNotification {
  // const description = sanitizeCmsContent(eventData);
  console.log('eventData:', eventData);
  const item = {} as CMSMaintenanceNotification;
  for (const veld of eventData.item.page.cluster.veld) {
    switch (veld.Nam) {
      case 'Startdatum':
        item.dateStart = veld.Dtm;
        break;
      case 'Einddatum':
        item.dateEnd = veld.Dtm;
        break;
      case 'Starttijd':
        item.timeStart = veld.Tyd;
        break;
      case 'Eindtijd':
        item.timeEnd = veld.Tyd;
        break;
      case 'Website':
        item.title = veld.Wrd;
        item.url = veld.Src;
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
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>,
  params?: Record<string, string>
): Promise<ApiResponse<CMSMaintenanceNotification[]>> {
  const cachedData = fileCache.getKey('CMS_MAINTENANCE_NOTIFICATIONS');

  if (cachedData) {
    return Promise.resolve(cachedData);
  }

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

  if (eventItemsResponse.content) {
    fileCache.setKey('CMS_MAINTENANCE_NOTIFICATIONS', eventItemsResponse);
    fileCache.save();
  }

  return eventItemsResponse;
}

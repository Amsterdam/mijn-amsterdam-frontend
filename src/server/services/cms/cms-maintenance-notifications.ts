import { isFuture, isPast, parseISO } from 'date-fns';

import { sanitizeCmsContent } from './cms-content';
import {
  themaId,
  themaTitle,
} from '../../../client/pages/MyNotifications/MyNotifications-config';
import {
  IS_ACCEPTANCE,
  IS_DEVELOPMENT,
  IS_PRODUCTION,
  IS_TEST,
} from '../../../universal/config/env';
import {
  ApiResponse_DEPRECATED,
  apiSuccessResult,
} from '../../../universal/helpers/api';
import { LinkProps, MyNotification } from '../../../universal/types/App.types';
import { ONE_HOUR_MS } from '../../config/app';
import { FORCE_RENEW_CACHE_TTL_MS } from '../../config/source-api';
import { getApiConfig } from '../../helpers/source-api-helpers';
import { requestData } from '../../helpers/source-api-request';

const DEFAULT_SEVERITY = 'warning';
const DEFAULT_OTAP_ENV = 'prd';

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
interface Wrd {
  Nam: 'Locatie' | 'Toevoeging';
  Wrd: string;
}
interface Src {
  Nam: 'Meer informatie' | 'Omschrijving';
  Src: string;
}

interface CMSEventData {
  item: {
    relUrl: string;
    page: {
      cluster: {
        veld: Array<Tyd | Website | Dtm | Src | Wrd>;
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

type OtapEnv = 'tst' | 'acc' | 'prd' | 'dev';
type SeverityLevel = 'error' | 'info' | 'success' | 'warning';

export interface CMSMaintenanceNotification extends MyNotification {
  title: string;
  datePublished: string;
  dateStart: string;
  dateEnd: string;
  timeEnd: string;
  timeStart: string;
  description: string;
  path: string;
  severity?: SeverityLevel;
  otapEnvs?: OtapEnv[];
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
    themaID: themaId,
    themaTitle: themaTitle,
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
      case 'Toevoeging':
        {
          const otapEnvs =
            veld.Wrd.match(/(tst|acc|prd|dev)/gi)?.map((env) =>
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
        item.description = veld.Src;
        break;
    }
  }

  return item;
}

function isOtapEnvMatch(notification: CMSMaintenanceNotification): boolean {
  const envMap = {
    tst: IS_TEST,
    acc: IS_ACCEPTANCE,
    prd: IS_PRODUCTION,
    dev: IS_DEVELOPMENT,
  };
  return notification.otapEnvs
    ? notification.otapEnvs.some((env) => envMap[env])
    : false;
}

const CMS_MAINTENANCE_NOTIFICATIONS_CACHE_TIMEOUT_MS = ONE_HOUR_MS;

async function fetchCMSMaintenanceNotifications(
  forceRenew: boolean
): Promise<ApiResponse_DEPRECATED<CMSMaintenanceNotification[]>> {
  function fetchCMSEventData(url: string) {
    return requestData<CMSMaintenanceNotification>({
      url: url + '?Appidt=app-pagetype&reload=true',
      transformResponse: transformCMSEventResponse,
      cacheTimeout: forceRenew
        ? FORCE_RENEW_CACHE_TTL_MS
        : CMS_MAINTENANCE_NOTIFICATIONS_CACHE_TIMEOUT_MS,
    });
  }

  const requestConfig = getApiConfig('CMS_MAINTENANCE_NOTIFICATIONS', {
    cacheTimeout: forceRenew
      ? FORCE_RENEW_CACHE_TTL_MS
      : CMS_MAINTENANCE_NOTIFICATIONS_CACHE_TIMEOUT_MS,
  });

  const eventItems = await requestData<CMSFeedItem[]>(requestConfig)
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

  const eventItemsFiltered = eventItems.filter(
    (eventItem): eventItem is CMSMaintenanceNotification =>
      eventItem !== null && isOtapEnvMatch(eventItem)
  );

  const eventItemsResponse = apiSuccessResult(eventItemsFiltered);

  return eventItemsResponse;
}

export interface QueryParamsMaintenanceNotifications
  extends Record<string, string | undefined> {
  page?: string;
  forceRenew?: 'true';
}

export async function fetchMaintenanceNotificationsActual(
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
  const maintenanceNotifications = await fetchMaintenanceNotificationsActual({
    page: 'dashboard',
  });

  if (!maintenanceNotifications.content?.length) {
    return maintenanceNotifications;
  }

  return apiSuccessResult({ notifications: maintenanceNotifications.content });
}

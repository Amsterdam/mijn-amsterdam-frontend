import { fetchAdoptableTrashContainerTips } from './afval/adoptable-trash-containers';
import { FeatureToggle } from '../../universal/config/feature-toggles';
import {
  ApiResponse_DEPRECATED,
  getSettledResult,
  type ApiResponse,
} from '../../universal/helpers/api';
import { dateSort } from '../../universal/helpers/date';
import type { MyNotification } from '../../universal/types/App.types';
import { AuthProfileAndToken } from '../auth/auth-types';
import { fetchAfisNotifications } from './afis/afis-notifications';
import { fetchAVGNotifications } from './avg/avg';
import { fetchBezwarenNotifications } from './bezwaren/bezwaren';
import { fetchLoodMetingNotifications } from './bodem/loodmetingen';
import { fetchBrpNotifications } from './brp/brp-notifications';
import { sanitizeCmsContent } from './cms/cms-content';
import { fetchMaintenanceNotificationsDashboard } from './cms/cms-maintenance-notifications';
import { ServiceResults } from './content-tips/tip-types';
import {
  fetchContentTips,
  prefixTipNotification,
} from './content-tips/tips-service';
import { fetchHorecaNotifications } from './horeca/horeca';
import { fetchKlachtenNotifications } from './klachten/klachten';
import { fetchKrefiaNotifications } from './krefia/krefia';
import { captureException } from './monitoring';
import { fetchParkeerVergunningenNotifications } from './parkeren/parkeren-notifications';
import {
  fetchBelastingNotifications,
  fetchMilieuzoneNotifications,
  fetchOvertredingenNotifications,
  fetchSubsidieNotifications,
} from './patroon-c';
import { fetchSVWINotifications } from './patroon-c/svwi';
import { fetchToeristischeVerhuurNotifications } from './toeristische-verhuur/toeristische-verhuur-notifications';
import { fetchVarenNotifications } from './varen/varen-notifications';
import { fetchVergunningenNotifications } from './vergunningen/vergunningen-notifications';
import { fetchWiorNotifications } from './wior';
import { fetchWpiNotifications } from './wpi';
import { streamEndpointQueryParamKeys } from '../../universal/config/app';
import { entries } from '../../universal/helpers/utils';
import { getFromEnv } from '../helpers/env';

// Every 3rd notification will be a tip if one is available.
const INSERT_TIP_AT_EVERY_NTH_INDEX = 3;

const TIP_IDS_DISABLED = (getFromEnv('BFF_TIPS_DISABLED_IDS', false) ?? '')
  .split(',')
  .map((id) => id.trim());

export type NotificationsAndTipsResponse =
  | ApiResponse<{
      notifications?: MyNotification[];
      tips?: MyNotification[];
    }>
  | ApiResponse_DEPRECATED<{
      notifications?: MyNotification[];
      tips?: MyNotification[];
    }>;

type FetchNotificationFunction = (
  authProfileAndToken: AuthProfileAndToken
) => Promise<NotificationsAndTipsResponse>;

type NotificationServices = Record<string, FetchNotificationFunction>;

type NotificationServicesByProfileType = Record<
  ProfileType,
  NotificationServices
>;

export const notificationServices = {
  commercial: {
    afis: fetchAfisNotifications,
    milieuzone: fetchMilieuzoneNotifications,
    overtredingen: fetchOvertredingenNotifications,
    vergunningen: fetchVergunningenNotifications,
    horeca: fetchHorecaNotifications,
    maintenanceNotifications: fetchMaintenanceNotificationsDashboard,
    subsidie: fetchSubsidieNotifications,
    toeristischeVerhuur: (authProfileAndToken: AuthProfileAndToken) =>
      fetchToeristischeVerhuurNotifications(authProfileAndToken, new Date()),
    bodem: fetchLoodMetingNotifications,
    bezwaren: fetchBezwarenNotifications,
    parkeren: fetchParkeerVergunningenNotifications,
    varen: fetchVarenNotifications,
  },
  'private-attributes': {},
  private: {
    adoptTrashContainer: fetchAdoptableTrashContainerTips,
    afis: fetchAfisNotifications,
    avg: fetchAVGNotifications,
    belasting: fetchBelastingNotifications,
    bezwaren: fetchBezwarenNotifications,
    bodem: fetchLoodMetingNotifications,
    brp: fetchBrpNotifications,
    fetchKrefia: fetchKrefiaNotifications,
    fetchSVWI: fetchSVWINotifications,
    fetchWior: fetchWiorNotifications,
    fetchWpi: fetchWpiNotifications,
    horeca: fetchHorecaNotifications,
    klachten: fetchKlachtenNotifications,
    maintenance: fetchMaintenanceNotificationsDashboard,
    milieuzone: fetchMilieuzoneNotifications,
    overtredingen: fetchOvertredingenNotifications,
    subsidie: fetchSubsidieNotifications,
    toeristischeVerhuur: fetchToeristischeVerhuurNotifications,
    vergunningen: fetchVergunningenNotifications,
    parkeren: fetchParkeerVergunningenNotifications,
  },
} satisfies NotificationServicesByProfileType;

export function getTipsAndNotificationsFromApiResults(
  responses: NotificationsAndTipsResponse[]
): MyNotification[] {
  const notifications: MyNotification[] = [];
  const tips: MyNotification[] = [];

  // Collect the success response data from the service results and send to the tips Api.
  for (const { content } of responses) {
    if (content === null || typeof content !== 'object') {
      continue;
    }
    // Collection of notifications
    if ('notifications' in content && Array.isArray(content.notifications)) {
      notifications.push(...content.notifications);
    }

    // Collection of tips
    if ('tips' in content && Array.isArray(content.tips)) {
      for (const tip of content.tips) {
        if (tip.isNotification) {
          notifications.push(tip);
        } else {
          tips.push(tip);
        }
      }
    }
  }

  const notificationsResult = notifications.map((notification) => {
    if (notification.description) {
      notification.description = sanitizeCmsContent(notification.description);
    }
    return notification;
  });

  const tipsResult = tips.map((tip) => {
    if (tip.description) {
      tip.description = sanitizeCmsContent(tip.description);
    }
    return tip;
  });

  return [...notificationsResult, ...tipsResult];
}

// Services can return Source tips and Content tips.
export async function fetchNotificationsAndTipsFromServices(
  authProfileAndToken: AuthProfileAndToken,
  services: NotificationServices = notificationServices[
    authProfileAndToken.profile.profileType
  ]
): Promise<Record<keyof typeof services, NotificationsAndTipsResponse>> {
  if (authProfileAndToken.profile.profileType === 'private-attributes') {
    return {};
  }

  const serviceResults = await Promise.allSettled(
    entries(services).map(async ([serviceId, fetchNotifications]) => {
      const result = await fetchNotifications(authProfileAndToken);
      return [serviceId, result];
    })
  );

  const results = serviceResults.map(getSettledResult) as [
    keyof typeof services,
    NotificationsAndTipsResponse,
  ][];

  const resultsObject = Object.fromEntries(results);

  // TODO: Remove, this is only needed for debugging
  for (const [serviceId, result] of entries(resultsObject)) {
    if (!result || !('content' in result)) {
      captureException(
        new Error(
          `Result for ${serviceId} does not contain content: ${JSON.stringify(result, undefined, 2)}`
        )
      );
      delete resultsObject[serviceId];
    }
  }

  return resultsObject;
}

export function sortNotificationsAndInsertTips(
  notifications: MyNotification[],
  doRandomize: boolean = true
): MyNotification[] {
  // sort the notifications with and without a tip
  const sorted = notifications
    .toSorted(dateSort('datePublished', 'desc'))
    // Put the alerts on the top regardless of the publication date
    .toSorted((a, b) => (a.isAlert === b.isAlert ? 0 : a.isAlert ? -1 : 0));

  const notificationsWithoutTips = sorted.filter((n) => !n.isTip);

  let tips = sorted.filter((n) => n.isTip);

  if (doRandomize) {
    // Simple randomization
    tips = tips
      .map((tip) => ({ tip, sort: Math.random() }))
      .toSorted((a, b) => a.sort - b.sort)
      .map(({ tip }) => tip);
  }

  let notificationsWithTipsInserted: MyNotification[] = [];

  // Insert a tip after every 3 notifications
  notificationsWithTipsInserted = notificationsWithoutTips.reduce(
    (acc, notification, index) => {
      // Add tip before next notification
      if (
        index !== 0 &&
        index % INSERT_TIP_AT_EVERY_NTH_INDEX === 0 &&
        tips.length > 0
      ) {
        const tip = tips.shift();
        if (tip) {
          acc.push(tip);
        }
      }
      acc.push(notification);
      return acc;
    },
    notificationsWithTipsInserted
  );

  // Add the remaining tips at the end.
  if (tips.length) {
    notificationsWithTipsInserted.push(...tips);
  }

  return notificationsWithTipsInserted;
}

export function getContentTips(
  serviceResults: ServiceResults | null,
  authProfileAndToken: AuthProfileAndToken | null,
  queryParams?: Record<string, string>
): MyNotification<string>[] {
  const compareDate =
    FeatureToggle.passQueryParamsToStreamUrl &&
    queryParams?.[streamEndpointQueryParamKeys.tipsCompareDate]
      ? new Date(
          queryParams[streamEndpointQueryParamKeys.tipsCompareDate] as string
        )
      : new Date();

  const contentTips = serviceResults
    ? fetchContentTips(
        serviceResults,
        compareDate,
        authProfileAndToken?.profile.profileType
      )
    : [];
  return contentTips;
}

export function combineNotificationsWithTipsAndSort(
  contentTips: MyNotification<string>[],
  notificationsAndTips: MyNotification<string>[] = []
) {
  const notifications: MyNotification[] = [
    ...contentTips,
    ...notificationsAndTips,
  ]
    .map((notification) => {
      if (notification.isTip) {
        notification.hideDatePublished = true;
        return prefixTipNotification(notification);
      }
      return notification;
    })
    // Filter out disabled tips
    .filter((notification) => {
      if (notification.isTip) {
        return !TIP_IDS_DISABLED.includes(notification.id);
      }
      return true;
    });

  const notificationsWithTipsInserted =
    sortNotificationsAndInsertTips(notifications);

  return notificationsWithTipsInserted;
}

import { FeatureToggle } from '../../universal/config/feature-toggles.ts';
import {
  type ApiResponse_DEPRECATED,
  type ApiResponse,
  apiErrorResult,
  getSettledResult,
} from '../../universal/helpers/api.ts';
import { dateSort } from '../../universal/helpers/date.ts';
import type { MyNotification } from '../../universal/types/App.types.ts';
import type { AuthProfileAndToken } from '../auth/auth-types.ts';
import { fetchAfisNotifications } from './afis/afis-notifications.ts';
import { fetchAVGNotifications } from './avg/avg.ts';
import { fetchBezwarenNotifications } from './bezwaren/bezwaren.ts';
import { fetchLoodMetingNotifications } from './bodem/loodmetingen.ts';
import { fetchBrpNotifications } from './brp/brp-notifications.ts';
import { sanitizeCmsContent } from './cms/cms-content.ts';
import { fetchMaintenanceNotificationsDashboard } from './cms/cms-maintenance-notifications.ts';
import type { ServiceResults } from './content-tips/tip-types.ts';
import {
  fetchContentTips,
  prefixTipNotification,
} from './content-tips/tips-service.ts';
import { fetchHorecaNotifications } from './horeca/horeca.ts';
import { fetchKlachtenNotifications } from './klachten/klachten.ts';
import { fetchKrefiaNotifications } from './krefia/krefia.ts';
import { captureException } from './monitoring.ts';
import { fetchParkeerVergunningenNotifications } from './parkeren/parkeren-notifications.ts';
import { fetchBelastingNotifications } from './patroon-c/belasting.ts';
import { fetchMilieuzoneNotifications } from './patroon-c/cleopatra.ts';
import { fetchOvertredingenNotifications } from './patroon-c/cleopatra.ts';
import { fetchSubsidieNotifications } from './patroon-c/subsidie.ts';
import { fetchSVWINotifications } from './patroon-c/svwi.ts';
import { fetchToeristischeVerhuurNotifications } from './toeristische-verhuur/toeristische-verhuur-notifications.ts';
import { fetchVarenNotifications } from './varen/varen-notifications.ts';
import { fetchVergunningenNotifications } from './vergunningen/vergunningen-notifications.ts';
import { fetchWiorNotifications } from './wior.ts';
import { fetchWpiNotifications } from './wpi/api-service.ts';
import { streamEndpointQueryParamKeys } from '../../universal/config/app.ts';
import { entries } from '../../universal/helpers/utils.ts';
import { getFromEnv } from '../helpers/env.ts';
import { fetchAdoptableTrashContainerTips } from './afval/adoptable-trash-containers.ts';

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

export type ServiceList = typeof notificationServices.commercial &
  typeof notificationServices.private;

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
} as const;

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

export async function fetchNotificationsAndTipsFromServices(
  authProfileAndToken: AuthProfileAndToken | null,
  services: Partial<ServiceList> = authProfileAndToken
    ? notificationServices[authProfileAndToken.profile.profileType]
    : {}
): Promise<
  Partial<Record<keyof typeof services, NotificationsAndTipsResponse>>
> {
  if (
    !authProfileAndToken ||
    authProfileAndToken.profile.profileType === 'private-attributes'
  ) {
    return {};
  }

  const serviceResults = await Promise.allSettled(
    entries(services).map(async ([serviceId, fetchNotifications]) => {
      const result = await fetchNotifications!(authProfileAndToken).catch(
        (error: string | Error) => {
          const errorMessage = `Error in fetchNotifications for service ${serviceId}: ${error instanceof Error ? error.message : String(error)}`;
          captureException(new Error(errorMessage));
          return apiErrorResult(errorMessage, null);
        }
      );
      return [serviceId, result];
    })
  );

  const results = serviceResults.map(getSettledResult) as [
    keyof typeof services,
    NotificationsAndTipsResponse,
  ][];

  return Object.fromEntries(results);
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

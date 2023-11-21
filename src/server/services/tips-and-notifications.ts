import { marked } from 'marked';
import memoize from 'memoizee';
import { ApiResponse, getSettledResult } from '../../universal/helpers/api';
import { dateSort } from '../../universal/helpers/date';
import type { MyNotification, MyTip } from '../../universal/types';
import { DEFAULT_API_CACHE_TTL_MS } from '../config';
import type { AuthProfileAndToken } from '../helpers/app';
import { fetchAVGNotifications } from './avg/avg';
import { fetchBezwarenNotifications } from './bezwaren/bezwaren';
import { fetchLoodMetingNotifications } from './bodem/loodmetingen';
import { fetchBrpNotifications } from './brp';
import { sanitizeCmsContent } from './cms-content';
import { fetchMaintenanceNotificationsDashboard } from './cms-maintenance-notifications';
import { fetchHorecaNotifications } from './horeca';
import { fetchKlachtenNotifications } from './klachten/klachten';
import { fetchKrefiaNotifications } from './krefia';
import {
  fetchBelastingNotifications,
  fetchErfpachtNotifications,
  fetchMilieuzoneNotifications,
  fetchOvertredingenNotifications,
  fetchSubsidieNotifications,
} from './simple-connect';
import { convertTipToNotication } from './tips/tips-service';
import { fetchToeristischeVerhuurNotifications } from './toeristische-verhuur';
import { fetchVergunningenNotifications } from './vergunningen/vergunningen';
import { fetchWiorNotifications } from './wior';
import { fetchWpiNotifications } from './wpi';

export function sortNotifications(notifications: MyNotification[]) {
  return (
    notifications
      .sort(dateSort('datePublished', 'desc'))
      // Put the alerts on the top regardless of the publication date
      .sort((a, b) => (a.isAlert === b.isAlert ? 0 : a.isAlert ? -1 : 0))
  );
}

export function getTipsAndNotificationsFromApiResults(
  responses: Array<ApiResponse<any>>
): MyNotification[] {
  const notifications: MyNotification[] = [];
  const tips: MyTip[] = [];

  // Collect the success response data from the service results and send to the tips Api.
  for (const { content } of responses) {
    if (content === null || typeof content !== 'object') {
      continue;
    }
    // Collection of notifications
    if ('notifications' in content) {
      notifications.push(...content.notifications);
    }

    // Collection of tips
    if ('tips' in content) {
      for (const tip of content.tips) {
        // Should we show the tip as Notification?
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
      notification.description = sanitizeCmsContent(
        marked(notification.description)
      );
    }
    if (notification.moreInformation) {
      notification.moreInformation = sanitizeCmsContent(
        marked(notification.moreInformation)
      );
    }
    return notification;
  });

  const tipsResult = tips
    .map((notification) => {
      if (notification.description) {
        notification.description = sanitizeCmsContent(notification.description);
      }
      return notification;
    })
    .map(convertTipToNotication);

  return [...notificationsResult, ...tipsResult];
}

type NotificationServices = Record<
  ProfileType,
  Record<
    string,
    (
      requestID: requestID,
      authProfileAndToken: AuthProfileAndToken
    ) => Promise<ApiResponse<any>>
  >
>;

const notificationServices: NotificationServices = {
  commercial: {
    milieuzone: fetchMilieuzoneNotifications,
    overtredingen: fetchOvertredingenNotifications,
    vergunningen: fetchVergunningenNotifications,
    horeca: fetchHorecaNotifications,
    erfpacht: fetchErfpachtNotifications,
    maintenanceNotifications: (requestID: requestID) =>
      fetchMaintenanceNotificationsDashboard(requestID),
    subsidie: fetchSubsidieNotifications,
    toeristischeVerhuur: (
      requestID: requestID,
      authProfileAndToken: AuthProfileAndToken
    ) =>
      fetchToeristischeVerhuurNotifications(
        requestID,
        authProfileAndToken,
        new Date(),
        'commercial'
      ),
    bodem: fetchLoodMetingNotifications,
    bezwaren: fetchBezwarenNotifications,
  },
  'private-attributes': {},
  private: {
    brp: fetchBrpNotifications,
    belasting: fetchBelastingNotifications,
    milieuzone: fetchMilieuzoneNotifications,
    overtredingen: fetchOvertredingenNotifications,
    vergunningen: fetchVergunningenNotifications,
    erfpacht: fetchErfpachtNotifications,
    subsidie: fetchSubsidieNotifications,
    maintenance: (requestID: requestID) =>
      fetchMaintenanceNotificationsDashboard(requestID),
    toeristischeVerhuur: fetchToeristischeVerhuurNotifications,
    fetchKrefia: fetchKrefiaNotifications,
    fetchWior: (
      requestID: requestID,
      authProfileAndToken: AuthProfileAndToken
    ) =>
      fetchWiorNotifications(
        requestID,
        authProfileAndToken,
        authProfileAndToken.profile.profileType
      ),
    fetchWpi: fetchWpiNotifications,
    klachten: fetchKlachtenNotifications,
    horeca: fetchHorecaNotifications,
    avg: fetchAVGNotifications,
    bodem: fetchLoodMetingNotifications,
    bezwaren: fetchBezwarenNotifications,
  },
};

async function fetchServicesNotifications(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
): Promise<MyNotification[]> {
  if (authProfileAndToken.profile.profileType !== 'private-attributes') {
    const results = await Promise.allSettled(
      Object.values(
        notificationServices[authProfileAndToken.profile.profileType]
      ).map((fetchNotifactions) =>
        fetchNotifactions(requestID, authProfileAndToken)
      )
    );

    return getTipsAndNotificationsFromApiResults(results.map(getSettledResult));
  }

  return [];
}

export const fetchTipsAndNotifications = memoize(fetchServicesNotifications, {
  maxAge: DEFAULT_API_CACHE_TTL_MS,
  normalizer: function (args) {
    // args is arguments object as accessible in memoized function
    return args[0] + JSON.stringify(args[1]);
  },
});

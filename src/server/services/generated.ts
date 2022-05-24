import { marked } from 'marked';
import memoize from 'memoizee';
import { apiSuccessResult } from '../../universal/helpers';
import { ApiResponse, getSettledResult } from '../../universal/helpers/api';
import { dateSort } from '../../universal/helpers/date';
import { MyNotification } from '../../universal/types';
import { DEFAULT_API_CACHE_TTL_MS } from '../config';
import { AuthProfileAndToken } from '../helpers/app';
import {
  fetchBelastingGenerated,
  fetchSubsidieGenerated,
} from './simple-connect';
import { fetchBRPGenerated } from './brp';
import { sanitizeCmsContent } from './cms-content';
import { fetchMaintenanceNotificationsDashboard } from './cms-maintenance-notifications';
import { fetchERFPACHTGenerated } from './erfpacht';
import { fetchKrefiaGenerated } from './krefia';
import { fetchMILIEUZONEGenerated } from './milieuzone';
import { fetchToeristischeVerhuurGenerated } from './toeristische-verhuur';
import { fetchVergunningenGenerated } from './vergunningen/vergunningen';
import { fetchWiorGenerated } from './wior';
import { fetchWpiNotifications } from './wpi';

export function getGeneratedItemsFromApiResults(
  responses: Array<ApiResponse<any>>
) {
  const notifications: MyNotification[] = [];

  // Collect the success response data from the service results and send to the tips Api.
  for (const { content } of responses) {
    if (content === null || typeof content !== 'object') {
      continue;
    }
    // Collection of notifications
    if ('notifications' in content) {
      notifications.push(...content.notifications);
    }
  }

  const notificationsResult = notifications
    .map((notification) => {
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
    })
    .sort(dateSort('datePublished', 'desc'))
    // Put the alerts on the top regardless of the publication date
    .sort((a, b) => (a.isAlert === b.isAlert ? 0 : a.isAlert ? -1 : 0));

  return {
    NOTIFICATIONS: apiSuccessResult(notificationsResult),
  };
}

async function fetchServicesGenerated(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken,
  profileType: ProfileType
) {
  if (profileType === 'commercial') {
    const [
      milieuzoneGeneratedResult,
      vergunningenGeneratedResult,
      erfpachtGeneratedResult,
      maintenanceNotifications,
      subsidieGeneratedResult,
      toeristischeVerhuurGeneratedResult,
    ] = await Promise.allSettled([
      fetchMILIEUZONEGenerated(requestID, authProfileAndToken),
      fetchVergunningenGenerated(requestID, authProfileAndToken),
      fetchERFPACHTGenerated(requestID, authProfileAndToken),
      fetchSubsidieGenerated(requestID, authProfileAndToken),
      fetchMaintenanceNotificationsDashboard(requestID),
      fetchToeristischeVerhuurGenerated(
        requestID,
        authProfileAndToken,
        new Date(),
        'commercial'
      ),
    ]);

    const milieuzoneGenerated = getSettledResult(milieuzoneGeneratedResult);
    const vergunningenGenerated = getSettledResult(vergunningenGeneratedResult);
    const erfpachtGenerated = getSettledResult(erfpachtGeneratedResult);
    const maintenanceNotificationsResult = getSettledResult(
      maintenanceNotifications
    );
    const subsidieGenerated = getSettledResult(subsidieGeneratedResult);
    const toeristischeVerhuurNotificationsResult = getSettledResult(
      toeristischeVerhuurGeneratedResult
    );

    return getGeneratedItemsFromApiResults([
      milieuzoneGenerated,
      vergunningenGenerated,
      erfpachtGenerated,
      subsidieGenerated,
      maintenanceNotificationsResult,
      toeristischeVerhuurNotificationsResult,
    ]);
  }

  const [
    brpGeneratedResult,
    belastingGeneratedResult,
    milieuzoneGeneratedResult,
    vergunningenGeneratedResult,
    erfpachtGeneratedResult,
    subsidieGeneratedResult,
    maintenanceNotifications,
    toeristischeVerhuurGeneratedResult,
    fetchKrefiaGeneratedResult,
    fetchWiorGeneratedResult,
    fetchWpiNotificationsResult,
  ] = await Promise.allSettled([
    fetchBRPGenerated(requestID, authProfileAndToken),
    fetchBelastingGenerated(requestID, authProfileAndToken),
    fetchMILIEUZONEGenerated(requestID, authProfileAndToken),
    fetchVergunningenGenerated(requestID, authProfileAndToken),
    fetchERFPACHTGenerated(requestID, authProfileAndToken),
    fetchSubsidieGenerated(requestID, authProfileAndToken),
    fetchMaintenanceNotificationsDashboard(requestID),
    fetchToeristischeVerhuurGenerated(requestID, authProfileAndToken),
    fetchKrefiaGenerated(requestID, authProfileAndToken),
    fetchWiorGenerated(requestID, authProfileAndToken, profileType),
    fetchWpiNotifications(requestID, authProfileAndToken),
  ]);

  const brpGenerated = getSettledResult(brpGeneratedResult);
  const belastingGenerated = getSettledResult(belastingGeneratedResult);
  const milieuzoneGenerated = getSettledResult(milieuzoneGeneratedResult);
  const vergunningenGenerated = getSettledResult(vergunningenGeneratedResult);
  const erfpachtGenerated = getSettledResult(erfpachtGeneratedResult);
  const subsidieGenerated = getSettledResult(subsidieGeneratedResult);
  const maintenanceNotificationsResult = getSettledResult(
    maintenanceNotifications
  );
  const toeristischeVerhuurGenerated = getSettledResult(
    toeristischeVerhuurGeneratedResult
  );
  const krefiaGenerated = getSettledResult(fetchKrefiaGeneratedResult);
  const wiorGenerated = getSettledResult(fetchWiorGeneratedResult);
  const wpiGenerated = getSettledResult(fetchWpiNotificationsResult);

  return getGeneratedItemsFromApiResults([
    brpGenerated,
    belastingGenerated,
    milieuzoneGenerated,
    vergunningenGenerated,
    erfpachtGenerated,
    subsidieGenerated,
    maintenanceNotificationsResult,
    toeristischeVerhuurGenerated,
    krefiaGenerated,
    wiorGenerated,
    wpiGenerated,
  ]);
}

export const fetchGenerated = memoize(fetchServicesGenerated, {
  maxAge: DEFAULT_API_CACHE_TTL_MS,
  normalizer: function (args) {
    // args is arguments object as accessible in memoized function
    return args[0] + JSON.stringify(args[1]);
  },
});

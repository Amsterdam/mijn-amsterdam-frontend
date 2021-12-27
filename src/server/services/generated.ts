import { apiSuccesResult } from '../../universal/helpers';
import { ApiResponse, getSettledResult } from '../../universal/helpers/api';
import { dateSort } from '../../universal/helpers/date';
import { MyCase, MyNotification } from '../../universal/types';
import { DEFAULT_API_CACHE_TTL_MS } from '../config';
import { fetchBELASTINGGenerated } from './belasting';
import { fetchBRPGenerated } from './brp';
import { sanitizeCmsContent } from './cms-content';
import { fetchMaintenanceNotificationsDashboard } from './cms-maintenance-notifications';
import { fetchERFPACHTGenerated } from './erfpacht';
import { fetchSubsidieGenerated } from './subsidie';
import { fetchKrefiaGenerated } from './krefia';
import { fetchFOCUSAanvragenGenerated } from './focus/focus-aanvragen';
import { fetchFOCUSBbzGenerated } from './focus/focus-bbz';
import { fetchFOCUSSpecificationsGenerated } from './focus/focus-specificaties';
import { fetchStadspasSaldoGenerated } from './focus/focus-stadspas';
import { fetchFOCUSTonkGenerated } from './focus/focus-tonk';
import { fetchFOCUSTozoGenerated } from './focus/focus-tozo';
import { fetchMILIEUZONEGenerated } from './milieuzone';
import { fetchToeristischeVerhuurGenerated } from './toeristische-verhuur';
import { fetchVergunningenGenerated } from './vergunningen/vergunningen';

import { marked } from 'marked';
import memoize from 'memoizee';
import { fetchWiorGenerated } from './wior';

export function getGeneratedItemsFromApiResults(
  responses: Array<ApiResponse<any>>
) {
  const notifications: MyNotification[] = [];
  const cases: MyCase[] = [];

  // Collect the success response data from the service results and send to the tips Api.
  for (const { content } of responses) {
    if (content === null || typeof content !== 'object') {
      continue;
    }
    // Collection notifications and cases
    if ('notifications' in content) {
      notifications.push(...content.notifications);
    }

    if ('cases' in content) {
      // NOTE: using bracket notation here to satisfy the compiler
      cases.push(...(content['cases'] as MyCase[]));
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
    CASES: apiSuccesResult(cases.sort(dateSort('datePublished', 'desc'))),
    NOTIFICATIONS: apiSuccesResult(notificationsResult),
  };
}

async function fetchServicesGenerated(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>,
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
      fetchMILIEUZONEGenerated(sessionID, passthroughRequestHeaders),
      fetchVergunningenGenerated(sessionID, passthroughRequestHeaders),
      fetchERFPACHTGenerated(sessionID, passthroughRequestHeaders),
      fetchSubsidieGenerated(sessionID, passthroughRequestHeaders),
      fetchMaintenanceNotificationsDashboard(sessionID),
      fetchToeristischeVerhuurGenerated(
        sessionID,
        passthroughRequestHeaders,
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
    focusAanvragenGeneratedResult,
    focusSpecificatiesGeneratedResult,
    focusTozoGeneratedResult,
    focusTonkGeneratedResult,
    focusBbzGeneratedResult,
    belastingGeneratedResult,
    milieuzoneGeneratedResult,
    vergunningenGeneratedResult,
    erfpachtGeneratedResult,
    subsidieGeneratedResult,
    maintenanceNotifications,
    stadspasSaldoGeneratedResult,
    toeristischeVerhuurGeneratedResult,
    fetchKrefiaGeneratedResult,
    fetchWiorGeneratedResult,
  ] = await Promise.allSettled([
    fetchBRPGenerated(sessionID, passthroughRequestHeaders),
    fetchFOCUSAanvragenGenerated(sessionID, passthroughRequestHeaders),
    fetchFOCUSSpecificationsGenerated(sessionID, passthroughRequestHeaders),
    fetchFOCUSTozoGenerated(sessionID, passthroughRequestHeaders),
    fetchFOCUSTonkGenerated(sessionID, passthroughRequestHeaders),
    fetchFOCUSBbzGenerated(sessionID, passthroughRequestHeaders),
    fetchBELASTINGGenerated(sessionID, passthroughRequestHeaders),

    fetchMILIEUZONEGenerated(sessionID, passthroughRequestHeaders),
    fetchVergunningenGenerated(sessionID, passthroughRequestHeaders),
    fetchERFPACHTGenerated(sessionID, passthroughRequestHeaders),
    fetchSubsidieGenerated(sessionID, passthroughRequestHeaders),
    fetchMaintenanceNotificationsDashboard(sessionID),
    fetchStadspasSaldoGenerated(sessionID, passthroughRequestHeaders),
    fetchToeristischeVerhuurGenerated(sessionID, passthroughRequestHeaders),
    fetchKrefiaGenerated(sessionID, passthroughRequestHeaders),
    fetchWiorGenerated(sessionID, passthroughRequestHeaders, profileType),
  ]);

  const brpGenerated = getSettledResult(brpGeneratedResult);
  const focusAanvragenGenerated = getSettledResult(
    focusAanvragenGeneratedResult
  );
  const focusSpecificatiesGenerated = getSettledResult(
    focusSpecificatiesGeneratedResult
  );
  const focusTozoGenerated = getSettledResult(focusTozoGeneratedResult);
  const focusTonkGenerated = getSettledResult(focusTonkGeneratedResult);
  const focusBbzGenerated = getSettledResult(focusBbzGeneratedResult);
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
  const stadspasGenerated = getSettledResult(stadspasSaldoGeneratedResult);
  const krefiaGenerated = getSettledResult(fetchKrefiaGeneratedResult);
  const WiorGenerated = getSettledResult(fetchWiorGeneratedResult);

  return getGeneratedItemsFromApiResults([
    brpGenerated,
    focusAanvragenGenerated,
    focusSpecificatiesGenerated,
    focusTozoGenerated,
    focusTonkGenerated,
    focusBbzGenerated,
    belastingGenerated,
    milieuzoneGenerated,
    vergunningenGenerated,
    erfpachtGenerated,
    subsidieGenerated,
    maintenanceNotificationsResult,
    toeristischeVerhuurGenerated,
    stadspasGenerated,
    krefiaGenerated,
    WiorGenerated,
  ]);
}

export const fetchGenerated = memoize(fetchServicesGenerated, {
  maxAge: DEFAULT_API_CACHE_TTL_MS,
  normalizer: function (args) {
    // args is arguments object as accessible in memoized function
    return args[0] + JSON.stringify(args[1]);
  },
});

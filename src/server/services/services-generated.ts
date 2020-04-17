import { fetchTIPS, TIPSRequestData, MyTip } from './tips';
import { apiSuccesResult } from '../../universal/helpers';
import { MyNotification, MyCase } from '../../universal/types/App.types';
import { fetchBRPGenerated } from './brp';
import {
  fetchFOCUSAanvragenGenerated,
  fetchFOCUSSpecificationsGenerated,
} from './focus';
import { fetchBELASTINGGenerated } from './belasting';
import { fetchMILIEUZONEGenerated } from './milieuzone';
import { loadServicesRelated } from './services-related';
import { loadServicesDirect } from './services-direct';
import { ApiStateKey } from '../../universal/config';

export async function loadServicesGenerated(
  sessionID: SessionID,
  optin: boolean = false
) {
  const [
    servicesDirect,
    servicesRelated,
    brpGenerated,
    focusAanvragenGenerated,
    focusSpecificatiesGenerated,
    belastingGenerated,
    milieuzoneGenerated,
  ] = await Promise.all([
    loadServicesDirect(sessionID),
    loadServicesRelated(sessionID),
    fetchBRPGenerated(sessionID),
    fetchFOCUSAanvragenGenerated(sessionID),
    fetchFOCUSSpecificationsGenerated(sessionID),
    fetchBELASTINGGenerated(sessionID),
    fetchMILIEUZONEGenerated(sessionID),
  ]);

  const notifications: MyNotification[] = [];
  const cases: MyCase[] = [];
  const sourceTips: MyTip[] = [];

  // Collect the success response data from the service results and send to the tips Api.
  for (const generatedContent of [
    brpGenerated,
    focusAanvragenGenerated,
    focusSpecificatiesGenerated,
    belastingGenerated,
    milieuzoneGenerated,
  ]) {
    // Collection notifications and cases
    if ('notifications' in generatedContent) {
      notifications.push(...generatedContent.notifications);
    }

    if ('cases' in generatedContent) {
      // NOTE: using bracket notation here to satisfy the compiler
      cases.push(...(generatedContent['cases'] as MyCase[]));
    }

    if ('tips' in generatedContent) {
      // NOTE: using bracket notation here to satisfy the compiler
      sourceTips.push(...(generatedContent['tips'] as MyTip[]));
    }
  }

  const tipsRequestData: TIPSRequestData = {
    data: {
      ...Object.entries({
        ...servicesDirect,
        ...servicesRelated,
      }).reduce<Record<ApiStateKey, any>>(
        (acc, [apiStateKey, responseData]) => {
          if (responseData.status === 'OK') {
            acc[apiStateKey] = responseData.content;
          }
          return acc;
        },
        {}
      ),
    },
    tips: sourceTips,
    optin,
  };

  const tips = await fetchTIPS(sessionID, tipsRequestData);

  const notificationsResult = {
    items: notifications,
    total: notifications.length,
  };

  return {
    CASES: apiSuccesResult(cases),
    NOTIFICATIONS: apiSuccesResult(notificationsResult),
    TIPS: tips,
  };
}

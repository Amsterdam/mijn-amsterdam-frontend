import {
  apiSuccesResult,
  unwrapApiResponseContent,
} from '../../universal/helpers';
import { dateSort } from '../../universal/helpers/date';
import { MyCase, MyNotification, MyTip } from '../../universal/types';
import { fetchBELASTINGGenerated } from './belasting';
import { fetchBRPGenerated } from './brp';
import { fetchFOCUSAanvragenGenerated } from './focus/focus-aanvragen';
import { fetchFOCUSSpecificationsGenerated } from './focus/focus-specificaties';
import { fetchFOCUSTozoGenerated } from './focus/focus-tozo';
import { fetchMILIEUZONEGenerated } from './milieuzone';
import { loadServicesDirect } from './services-direct';
import { loadServicesRelated } from './services-related';
import { fetchTIPS, TIPSRequestData } from './tips';

export async function loadServicesGenerated(
  sessionID: SessionID,
  samlToken: string,
  optin: boolean = false
) {
  const [
    servicesDirect,
    servicesRelated,
    brpGenerated,
    focusAanvragenGenerated,
    focusSpecificatiesGenerated,
    focusTozoGenerated,
    belastingGenerated,
    milieuzoneGenerated,
  ] = await Promise.all([
    loadServicesDirect(sessionID, samlToken),
    loadServicesRelated(sessionID, samlToken),
    fetchBRPGenerated(sessionID, samlToken),
    fetchFOCUSAanvragenGenerated(sessionID, samlToken),
    fetchFOCUSSpecificationsGenerated(sessionID, samlToken),
    fetchFOCUSTozoGenerated(sessionID, samlToken),
    fetchBELASTINGGenerated(sessionID, samlToken),
    fetchMILIEUZONEGenerated(sessionID, samlToken),
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
    focusTozoGenerated,
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
    data: unwrapApiResponseContent({
      ...servicesDirect,
      ...servicesRelated,
    }),
    tips: sourceTips,
    optin,
  };

  const tips = await fetchTIPS(sessionID, samlToken, tipsRequestData);

  const notificationsResult = {
    items: notifications
      .sort(dateSort('datePublished', 'desc'))
      // Put the alerts on the top regardless of the publication date
      .sort((a, b) => (a.isAlert === b.isAlert ? 0 : a.isAlert ? -1 : 0)),
    total: notifications.length,
  };

  return {
    CASES: apiSuccesResult(cases.sort(dateSort('datePublished', 'desc'))),
    NOTIFICATIONS: apiSuccesResult(notificationsResult),
    TIPS: tips,
  };
}

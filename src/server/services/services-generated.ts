import { apiSuccesResult } from '../../universal/helpers';
import { dateSort } from '../../universal/helpers/date';
import { MyCase, MyNotification, MyTip } from '../../universal/types';
import { fetchBELASTINGGenerated } from './belasting';
import { fetchBRPGenerated } from './brp';
import { fetchFOCUSAanvragenGenerated } from './focus/focus-aanvragen';
import { fetchFOCUSSpecificationsGenerated } from './focus/focus-specificaties';
import { fetchFOCUSTozoGenerated } from './focus/focus-tozo';
import { fetchMILIEUZONEGenerated } from './milieuzone';
import { loadServicesRaw } from './services-raw';
import { fetchTIPS, TIPSRequestData } from './tips';
import { fetchVergunningenGenerated } from './vergunningen';

export async function loadServicesGenerated(
  sessionID: SessionID,
  samlToken: string,
  optin: boolean = false
) {
  const [
    tips,
    brpGenerated,
    focusAanvragenGenerated,
    focusSpecificatiesGenerated,
    focusTozoGenerated,
    belastingGenerated,
    milieuzoneGenerated,
    vergunningenGenerated,
  ] = await Promise.all([
    loadServicesTips(sessionID, samlToken, optin),
    fetchBRPGenerated(sessionID, samlToken),
    fetchFOCUSAanvragenGenerated(sessionID, samlToken),
    fetchFOCUSSpecificationsGenerated(sessionID, samlToken),
    fetchFOCUSTozoGenerated(sessionID, samlToken),
    fetchBELASTINGGenerated(sessionID, samlToken),
    fetchMILIEUZONEGenerated(sessionID, samlToken),
    fetchVergunningenGenerated(sessionID, samlToken),
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
    vergunningenGenerated,
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

  const notificationsResult = notifications
    .sort(dateSort('datePublished', 'desc'))
    // Put the alerts on the top regardless of the publication date
    .sort((a, b) => (a.isAlert === b.isAlert ? 0 : a.isAlert ? -1 : 0));

  return {
    CASES: apiSuccesResult(cases.sort(dateSort('datePublished', 'desc'))),
    NOTIFICATIONS: apiSuccesResult(notificationsResult),
    TIPS: tips,
  };
}

export async function loadServicesTips(
  sessionID: SessionID,
  samlToken: string,
  optin: boolean = false
) {
  const data = await loadServicesRaw(sessionID, samlToken);

  const tipsRequestData: TIPSRequestData = {
    data,
    tips: Object.values(data).flatMap((apiData: any) => {
      if (apiData !== null && typeof apiData === 'object') {
        if (apiData?.content?.tips) {
          return apiData.content.tips;
        } else if (apiData?.tips) {
          return apiData.tips;
        }
      }
      return [];
    }),
    optin,
  };

  return fetchTIPS(sessionID, samlToken, tipsRequestData);
}

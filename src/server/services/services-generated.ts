import { apiSuccesResult } from '../../universal/helpers';
import { getSettledResult } from '../../universal/helpers/api';
import { dateSort } from '../../universal/helpers/date';
import { MyCase, MyNotification } from '../../universal/types';
import { fetchBELASTINGGenerated } from './belasting';
import { fetchBRPGenerated } from './brp';
import { fetchFOCUSAanvragenGenerated } from './focus/focus-aanvragen';
import { fetchFOCUSSpecificationsGenerated } from './focus/focus-specificaties';
import { fetchFOCUSTozoGenerated } from './focus/focus-tozo';
import { fetchMILIEUZONEGenerated } from './milieuzone';
import { fetchVergunningenGenerated } from './vergunningen';

export async function loadServicesGenerated(
  sessionID: SessionID,
  samlToken: string
) {
  const [
    brpGeneratedResult,
    focusAanvragenGeneratedResult,
    focusSpecificatiesGeneratedResult,
    focusTozoGeneratedResult,
    belastingGeneratedResult,
    milieuzoneGeneratedResult,
    vergunningenGeneratedResult,
  ] = await Promise.allSettled([
    fetchBRPGenerated(sessionID, samlToken),
    fetchFOCUSAanvragenGenerated(sessionID, samlToken),
    fetchFOCUSSpecificationsGenerated(sessionID, samlToken),
    fetchFOCUSTozoGenerated(sessionID, samlToken),
    fetchBELASTINGGenerated(sessionID, samlToken),
    fetchMILIEUZONEGenerated(sessionID, samlToken),
    fetchVergunningenGenerated(sessionID, samlToken),
  ]);

  const brpGenerated = getSettledResult(brpGeneratedResult);
  const focusAanvragenGenerated = getSettledResult(
    focusAanvragenGeneratedResult
  );
  const focusSpecificatiesGenerated = getSettledResult(
    focusSpecificatiesGeneratedResult
  );
  const focusTozoGenerated = getSettledResult(focusTozoGeneratedResult);
  const belastingGenerated = getSettledResult(belastingGeneratedResult);
  const milieuzoneGenerated = getSettledResult(milieuzoneGeneratedResult);
  const vergunningenGenerated = getSettledResult(vergunningenGeneratedResult);

  const notifications: MyNotification[] = [];
  const cases: MyCase[] = [];

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
  }

  const notificationsResult = notifications
    .sort(dateSort('datePublished', 'desc'))
    // Put the alerts on the top regardless of the publication date
    .sort((a, b) => (a.isAlert === b.isAlert ? 0 : a.isAlert ? -1 : 0));

  return {
    CASES: apiSuccesResult(cases.sort(dateSort('datePublished', 'desc'))),
    NOTIFICATIONS: apiSuccesResult(notificationsResult),
  };
}

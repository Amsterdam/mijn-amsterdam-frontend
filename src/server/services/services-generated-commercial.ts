import { apiSuccesResult } from '../../universal/helpers';
import { getSettledResult } from '../../universal/helpers/api';
import { dateSort } from '../../universal/helpers/date';
import { MyCase, MyNotification } from '../../universal/types';
import { fetchBELASTINGGenerated } from './belasting';
import { fetchMILIEUZONEGenerated } from './milieuzone';
import { fetchVergunningenGenerated } from './vergunningen';

export async function loadServicesGeneratedCommercial(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>
) {
  const [
    belastingGeneratedResult,
    milieuzoneGeneratedResult,
    vergunningenGeneratedResult,
  ] = await Promise.allSettled([
    fetchBELASTINGGenerated(sessionID, passthroughRequestHeaders),
    fetchMILIEUZONEGenerated(sessionID, passthroughRequestHeaders),
    fetchVergunningenGenerated(sessionID, passthroughRequestHeaders),
  ]);

  const belastingGenerated = getSettledResult(belastingGeneratedResult);
  const milieuzoneGenerated = getSettledResult(milieuzoneGeneratedResult);
  const vergunningenGenerated = getSettledResult(vergunningenGeneratedResult);

  const notifications: MyNotification[] = [];
  const cases: MyCase[] = [];

  // Collect the success response data from the service results and send to the tips Api.
  for (const generatedContent of [
    belastingGenerated,
    milieuzoneGenerated,
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

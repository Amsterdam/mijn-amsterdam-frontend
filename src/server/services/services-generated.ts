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
import { ApiResult } from './state';

export function getGeneratedItemsFromApiResults(
  responses: Array<ApiResult<any>>
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
    .sort(dateSort('datePublished', 'desc'))
    // Put the alerts on the top regardless of the publication date
    .sort((a, b) => (a.isAlert === b.isAlert ? 0 : a.isAlert ? -1 : 0));

  return {
    CASES: apiSuccesResult(cases.sort(dateSort('datePublished', 'desc'))),
    NOTIFICATIONS: apiSuccesResult(notificationsResult),
  };
}

export async function loadServicesGenerated(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>
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
    fetchBRPGenerated(sessionID, passthroughRequestHeaders),
    fetchFOCUSAanvragenGenerated(sessionID, passthroughRequestHeaders),
    fetchFOCUSSpecificationsGenerated(sessionID, passthroughRequestHeaders),
    fetchFOCUSTozoGenerated(sessionID, passthroughRequestHeaders),
    fetchBELASTINGGenerated(sessionID, passthroughRequestHeaders),
    fetchMILIEUZONEGenerated(sessionID, passthroughRequestHeaders),
    fetchVergunningenGenerated(sessionID, passthroughRequestHeaders),
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

  return getGeneratedItemsFromApiResults([
    brpGenerated,
    focusAanvragenGenerated,
    focusSpecificatiesGenerated,
    focusTozoGenerated,
    belastingGenerated,
    milieuzoneGenerated,
    vergunningenGenerated,
  ]);
}

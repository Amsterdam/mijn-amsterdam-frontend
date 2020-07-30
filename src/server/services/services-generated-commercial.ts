import { getSettledResult } from '../../universal/helpers/api';
import { fetchBELASTINGGenerated } from './belasting';
import { fetchMILIEUZONEGenerated } from './milieuzone';
import { getGeneratedItemsFromApiResults } from './services-generated';
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

  return getGeneratedItemsFromApiResults([
    belastingGenerated,
    milieuzoneGenerated,
    vergunningenGenerated,
  ]);
}

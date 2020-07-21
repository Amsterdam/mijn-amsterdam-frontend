import { getSettledResult } from '../../universal/helpers/api';
import { fetchBELASTING, fetchERFPACHT, fetchMILIEUZONE } from './index';
import { fetchVergunningen } from './vergunningen';

export async function loadServicesDirectCommercial(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>
) {
  const fetchERFPACHTRequest = fetchERFPACHT(
    sessionID,
    passthroughRequestHeaders
  );
  const fetchBELASTINGRequest = fetchBELASTING(
    sessionID,
    passthroughRequestHeaders
  );
  const fetchMILIEUZONERequest = fetchMILIEUZONE(
    sessionID,
    passthroughRequestHeaders
  );
  const fetchVergunningenRequest = fetchVergunningen(
    sessionID,
    passthroughRequestHeaders
  );

  const [
    ERFPACHT,
    BELASTINGEN,
    MILIEUZONE,
    VERGUNNINGEN,
  ] = await Promise.allSettled([
    fetchERFPACHTRequest,
    fetchBELASTINGRequest,
    fetchMILIEUZONERequest,
    fetchVergunningenRequest,
  ]);

  return {
    ERFPACHT: getSettledResult(ERFPACHT),
    BELASTINGEN: getSettledResult(BELASTINGEN),
    MILIEUZONE: getSettledResult(MILIEUZONE),
    VERGUNNINGEN: getSettledResult(VERGUNNINGEN),
  };
}

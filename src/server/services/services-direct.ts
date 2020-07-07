import {
  fetchFOCUSAanvragen,
  fetchFOCUSSpecificaties,
  fetchFOCUSTozo,
  fetchWMO,
  fetchERFPACHT,
  fetchBELASTING,
  fetchMILIEUZONE,
} from './index';
import { fetchVergunningen } from './vergunningen';
import { getSettledResult } from '../../universal/helpers/api';

export async function loadServicesDirect(
  sessionID: SessionID,
  samlToken: string,
  raw: boolean = false
) {
  const fetchFOCUSAanvragenRequest = fetchFOCUSAanvragen(
    sessionID,
    samlToken,
    raw
  );
  const fetchFOCUSSpecificatiesRequest = fetchFOCUSSpecificaties(
    sessionID,
    samlToken,
    raw
  );
  const fetchFOCUSTozoRequest = fetchFOCUSTozo(sessionID, samlToken);
  const fetchWMORequest = fetchWMO(sessionID, samlToken, raw);
  const fetchERFPACHTRequest = fetchERFPACHT(sessionID, samlToken, raw);
  const fetchBELASTINGRequest = fetchBELASTING(sessionID, samlToken, raw);
  const fetchMILIEUZONERequest = fetchMILIEUZONE(sessionID, samlToken, raw);
  const fetchVergunningenRequest = fetchVergunningen(sessionID, samlToken, raw);

  const [
    FOCUS_AANVRAGEN,
    FOCUS_SPECIFICATIES,
    FOCUS_TOZO,
    WMO,
    ERFPACHT,
    BELASTINGEN,
    MILIEUZONE,
    VERGUNNINGEN,
  ] = await Promise.allSettled([
    fetchFOCUSAanvragenRequest,
    fetchFOCUSSpecificatiesRequest,
    fetchFOCUSTozoRequest,
    fetchWMORequest,
    fetchERFPACHTRequest,
    fetchBELASTINGRequest,
    fetchMILIEUZONERequest,
    fetchVergunningenRequest,
  ]);

  return {
    FOCUS_AANVRAGEN: getSettledResult(FOCUS_AANVRAGEN),
    FOCUS_SPECIFICATIES: getSettledResult(FOCUS_SPECIFICATIES),
    FOCUS_TOZO: getSettledResult(FOCUS_TOZO),
    WMO: getSettledResult(WMO),
    ERFPACHT: getSettledResult(ERFPACHT),
    BELASTINGEN: getSettledResult(BELASTINGEN),
    MILIEUZONE: getSettledResult(MILIEUZONE),
    VERGUNNINGEN: getSettledResult(VERGUNNINGEN),
  };
}

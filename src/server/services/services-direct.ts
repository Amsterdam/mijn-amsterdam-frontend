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
import { fetchStadspas } from './focus/gpass-stadspas';

export async function loadServicesDirect(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>
) {
  const fetchFOCUSAanvragenRequest = fetchFOCUSAanvragen(
    sessionID,
    passthroughRequestHeaders
  );
  const fetchFOCUSSpecificatiesRequest = fetchFOCUSSpecificaties(
    sessionID,
    passthroughRequestHeaders
  );
  const fetchFOCUSTozoRequest = fetchFOCUSTozo(
    sessionID,
    passthroughRequestHeaders
  );
  const fetchWMORequest = fetchWMO(sessionID, passthroughRequestHeaders);
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
  const fetchStadspasRequest = fetchStadspas(
    sessionID,
    passthroughRequestHeaders
  );

  const [
    FOCUS_AANVRAGEN,
    FOCUS_SPECIFICATIES,
    FOCUS_TOZO,
    WMO,
    ERFPACHT,
    BELASTINGEN,
    MILIEUZONE,
    VERGUNNINGEN,
    GPASS_STADSPAS,
  ] = await Promise.allSettled([
    fetchFOCUSAanvragenRequest,
    fetchFOCUSSpecificatiesRequest,
    fetchFOCUSTozoRequest,
    fetchWMORequest,
    fetchERFPACHTRequest,
    fetchBELASTINGRequest,
    fetchMILIEUZONERequest,
    fetchVergunningenRequest,
    fetchStadspasRequest,
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
    GPASS_STADSPAS: getSettledResult(GPASS_STADSPAS),
  };
}

import {
  fetchFOCUSAanvragen,
  fetchFOCUSSpecificaties,
  fetchFOCUSTozo,
  fetchWMO,
  fetchERFPACHT,
  fetchBELASTING,
  fetchMILIEUZONE,
} from './index';

export async function loadServicesDirect(
  sessionID: SessionID,
  samlToken: string
) {
  const fetchFOCUSAanvragenRequest = fetchFOCUSAanvragen(sessionID, samlToken);
  const fetchFOCUSSpecificatiesRequest = fetchFOCUSSpecificaties(
    sessionID,
    samlToken
  );
  const fetchFOCUSTozoRequest = fetchFOCUSTozo(sessionID, samlToken);
  const fetchWMORequest = fetchWMO(sessionID, samlToken);
  const fetchERFPACHTRequest = fetchERFPACHT(sessionID, samlToken);
  const fetchBELASTINGRequest = fetchBELASTING(sessionID, samlToken);
  const fetchMILIEUZONERequest = fetchMILIEUZONE(sessionID, samlToken);

  const [
    FOCUS_AANVRAGEN,
    FOCUS_SPECIFICATIES,
    FOCUS_TOZO,
    WMO,
    ERFPACHT,
    BELASTINGEN,
    MILIEUZONE,
  ] = await Promise.all([
    fetchFOCUSAanvragenRequest,
    fetchFOCUSSpecificatiesRequest,
    fetchFOCUSTozoRequest,
    fetchWMORequest,
    fetchERFPACHTRequest,
    fetchBELASTINGRequest,
    fetchMILIEUZONERequest,
  ]);

  return {
    FOCUS_AANVRAGEN,
    FOCUS_SPECIFICATIES,
    FOCUS_TOZO,
    WMO,
    ERFPACHT,
    BELASTINGEN,
    MILIEUZONE,
  };
}

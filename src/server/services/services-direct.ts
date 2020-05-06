import {
  fetchFOCUSAanvragen,
  fetchFOCUSSpecificaties,
  fetchFOCUSTozo,
  fetchWMO,
  fetchERFPACHT,
  fetchBELASTING,
  fetchMILIEUZONE,
} from './index';

export async function loadServicesDirect(sessionID: SessionID) {
  const fetchFOCUSAanvragenRequest = fetchFOCUSAanvragen(sessionID);
  const fetchFOCUSSpecificatiesRequest = fetchFOCUSSpecificaties(sessionID);
  const fetchFOCUSTozoRequest = fetchFOCUSTozo(sessionID);
  const fetchWMORequest = fetchWMO(sessionID);
  const fetchERFPACHTRequest = fetchERFPACHT(sessionID);
  const fetchBELASTINGRequest = fetchBELASTING(sessionID);
  const fetchMILIEUZONERequest = fetchMILIEUZONE(sessionID);

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

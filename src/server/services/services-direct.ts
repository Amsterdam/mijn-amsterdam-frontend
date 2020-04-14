import {
  fetchFOCUSAanvragen,
  fetchFOCUSSpecificaties,
  fetchWMO,
  fetchERFPACHT,
  fetchBELASTING,
  fetchMILIEUZONE,
} from './index';

export async function loadServicesDirect(sessionID: SessionID) {
  const fetchFOCUSAanvragenRequest = fetchFOCUSAanvragen();
  const fetchFOCUSSpecificatiesRequest = fetchFOCUSSpecificaties();
  const fetchWMORequest = fetchWMO();
  const fetchERFPACHTRequest = fetchERFPACHT();
  const fetchBELASTINGRequest = fetchBELASTING();
  const fetchMILIEUZONERequest = fetchMILIEUZONE();

  const [
    FOCUS_AANVRAGEN,
    FOCUS_SPECIFICATIES,
    WMO,
    ERFPACHT,
    BELASTINGEN,
    MILIEUZONE,
  ] = await Promise.all([
    fetchFOCUSAanvragenRequest,
    fetchFOCUSSpecificatiesRequest,
    fetchWMORequest,
    fetchERFPACHTRequest,
    fetchBELASTINGRequest,
    fetchMILIEUZONERequest,
  ]);

  return {
    FOCUS_AANVRAGEN,
    FOCUS_SPECIFICATIES,
    WMO,
    ERFPACHT,
    BELASTINGEN,
    MILIEUZONE,
  };
}

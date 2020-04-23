import {
  fetchFOCUSAanvragen,
  fetchFOCUSSpecificaties,
  fetchWMO,
  fetchERFPACHT,
  fetchBELASTING,
  fetchMILIEUZONE,
} from './index';

export async function loadServicesDirect(sessionID: SessionID) {
  const fetchFOCUSAanvragenRequest = fetchFOCUSAanvragen(sessionID);
  const fetchFOCUSSpecificatiesRequest = fetchFOCUSSpecificaties(sessionID);
  const fetchWMORequest = fetchWMO(sessionID);
  const fetchERFPACHTRequest = fetchERFPACHT(sessionID);
  const fetchBELASTINGRequest = fetchBELASTING(sessionID);
  const fetchMILIEUZONERequest = fetchMILIEUZONE(sessionID);

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

  console.log('FOCUS_AANVRAGEN:', FOCUS_AANVRAGEN);

  return {
    FOCUS_AANVRAGEN,
    FOCUS_SPECIFICATIES,
    WMO,
    ERFPACHT,
    BELASTINGEN,
    MILIEUZONE,
  };
}

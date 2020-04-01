import { AFVALData } from '../services/afval';
import { BAGData } from '../services/bag';
import { BRPData } from '../services/brp';

export const API_BASE_PATH = '/bff';
export const API_BASE_URL = 'http://localhost:5000/api';
export const DATAPUNT_API_BASE_URL = 'https://api.data.amsterdam.nl';

export interface UserData {
  BELASTINGEN: any;
  MELDINGEN: any;
  MY_CASES: any;
  TIPS: any;
  BRP: BRPData;
  WMO: any;
  FOCUS: any;
  ERFPACHT: any;
  BAG: BAGData;
  AFVAL: AFVALData;
  MILIEUZONE: any;
}

export const ApiUrls: Record<string, string> = {
  BELASTINGEN: `${API_BASE_URL}/belastingen/get`,
  MELDINGEN: `${API_BASE_URL}/mijn-meldingen`,
  MY_CASES: `${API_BASE_URL}/focus/aanvragen`,
  TIPS: `${API_BASE_URL}/tips/gettips`,
  BRP: `${API_BASE_URL}/brp/brp`,
  WMO: `${API_BASE_URL}/wmoned/voorzieningen`,
  FOCUS: `${API_BASE_URL}/focus/aanvragen`,
  FOCUS_INKOMEN_SPECIFICATIES: `${API_BASE_URL}/focus/combined`,
  AUTH: `${API_BASE_URL}/auth/check`,
  ERFPACHT: `${API_BASE_URL}/erfpacht/check-erfpacht`,
  BAG: `${DATAPUNT_API_BASE_URL}/atlas/search/adres/`,
  AFVAL: `${DATAPUNT_API_BASE_URL}/afvalophaalgebieden/search/`,
  MILIEUZONE: `${API_BASE_URL}/milieu/get`,
};

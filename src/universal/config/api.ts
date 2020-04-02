import {
  AFVALData,
  BAGData,
  BELASTINGENData,
  BRPData,
  ERFPACHTData,
  FOCUSData,
  MILIEUZONEData,
  TIPSData,
  WMOData,
} from '../../server/services';

import { FeatureToggle } from './app';

export const API_BASE_PATH = '/bff';

export interface BFFApiData {
  BELASTINGEN: BELASTINGENData;
  MELDINGEN: any;
  MY_CASES: any;
  TIPS: TIPSData;
  BRP: BRPData;
  WMO: WMOData;
  FOCUS: FOCUSData;
  ERFPACHT: ERFPACHTData;
  BAG: BAGData;
  AFVAL: AFVALData;
  MILIEUZONE: MILIEUZONEData;
}

export type ApiStateKey = keyof BFFApiData;

export const LOGIN_URL = process.env.REACT_APP_LOGIN_URL || '/api/login';
export const LOGIN_EHERKENNING_URL = '/api1/login';
export const LOGOUT_URL = process.env.REACT_APP_LOGOUT_URL || '/logout';

let apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

export const API_BASE_URL = apiBaseUrl;
const DATAPUNT_API_BASE_URL = process.env.REACT_APP_DATAPUNT_API_URL;

export type ApiName = string;

export const ApiUrls: Record<string, string> = {
  BELASTINGEN: `${API_BASE_URL}/belastingen/get`,
  UPDATES: `${API_BASE_URL}/updates`,
  MY_CASES: `${API_BASE_URL}/focus/aanvragen`,
  TIPS: `${API_BASE_URL}/tips/gettips`,
  BRP: `${API_BASE_URL}/brp/brp`,
  WMO: `${API_BASE_URL}/wmoned/voorzieningen`,
  FOCUS: `${API_BASE_URL}/focus/aanvragen`,
  FOCUS_SPECIFICATIONS: `${API_BASE_URL}/focus/combined`,
  AUTH: `${API_BASE_URL}/auth/check`,
  ERFPACHT: `${API_BASE_URL}/erfpacht/check-erfpacht`,
  BAG: `${DATAPUNT_API_BASE_URL}/atlas/search/adres/`,
  AFVAL: `${DATAPUNT_API_BASE_URL}/afvalophaalgebieden/search/`,
  MILIEUZONE: `${API_BASE_URL}/milieu/get`,
};

export interface ApiConfig {
  postponeFetch: boolean;
}

export const ApiConfig: TypeIndex<ApiName, ApiConfig> = {
  FOCUS: {
    postponeFetch: false,
  },
  FOCUS_SPECIFICATIONS: {
    postponeFetch: !FeatureToggle.focusCombinedActive,
  },
  WMO: {
    postponeFetch: false,
  },
  MIJN_TIPS: {
    postponeFetch: true, // Stays true because we're not fetching immediately
  },
  BELASTINGEN: {
    postponeFetch: !FeatureToggle.belastingApiActive,
  },
  MILIEUZONE: {
    postponeFetch: !FeatureToggle.milieuzoneApiActive,
  },
};

export const ErrorNames: { [stateKey: string]: string } = {
  BRP: 'Persoonlijke gegevens, burgerzaken + actuele updates',
  MY_CASES: 'Lopende zaken',
  MIJN_TIPS: 'Tips',
  WMO: 'Zorg en ondersteuning',
  FOCUS: 'Inkomen en Stadspas en Tozo regelingen + actuele updates',
  FOCUS_TOZO: 'Tozo status + actuele updates',
  FOCUS_SPECIFICATIONS:
    'Uitkeringsspecificaties, Jaaropgaven + actuele updates',
  MY_CHAPTERS: "Thema's",
  ERFPACHT: 'Erfpacht',
  GARBAGE: 'Afval',
  MIJN_BUURT: 'Mijn buurt',
  BELASTINGEN: 'Belastingen + updates',
  MILIEUZONE: 'Milieuzone',
};

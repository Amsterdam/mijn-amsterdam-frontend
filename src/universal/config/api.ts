import {
  fetchWMO,
  fetchBRP,
  fetchTIPS,
  fetchBELASTING,
  fetchFOCUS,
  fetchERFPACHT,
  fetchBAG,
  fetchAFVAL,
  fetchMILIEUZONE,
} from '../../server/services';
import { FeatureToggle } from './app';

type ApiResult<T extends (...args: any[]) => any> = ResolvedType<ReturnType<T>>;

export interface BFFApiData {
  BELASTINGEN: ApiResult<typeof fetchBELASTING>;
  UPDATES: any;
  MY_CASES: any;
  TIPS: ApiResult<typeof fetchTIPS>;
  BRP: ApiResult<typeof fetchBRP>;
  WMO: ApiResult<typeof fetchWMO>;
  FOCUS: ApiResult<typeof fetchFOCUS>;
  ERFPACHT: ApiResult<typeof fetchERFPACHT>;
  BAG: ApiResult<typeof fetchBAG>;
  AFVAL: ApiResult<typeof fetchAFVAL>;
  MILIEUZONE: ApiResult<typeof fetchMILIEUZONE>;
  [key: string]: any;
}

export type ApiStateKey = keyof BFFApiData | string;

export const LOGIN_URL = process.env.REACT_APP_LOGIN_URL || '/api/login';
export const LOGOUT_URL = process.env.REACT_APP_LOGOUT_URL || '/logout';
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api';
export const BFF_API_BASE_URL =
  process.env.REACT_APP_BFF_API_BASE_URL || '/api/bff';
export const DATAPUNT_API_BASE_URL = process.env.REACT_APP_DATAPUNT_API_URL;

export type ApiName = string;

export const BFFApiUrls: Record<string, string> = {
  SERVICES_RELATED: `${BFF_API_BASE_URL}/services/related`,
  SERVICES_DIRECT: `${BFF_API_BASE_URL}/services/direct`,
  SERVICES_TIPS: `${BFF_API_BASE_URL}/services/tips`,
  SERVICES_UPDATES: `${BFF_API_BASE_URL}/services/updates`,
};

export const ApiUrls: Record<string, string> = {
  BELASTINGEN: `${API_BASE_URL}/belastingen/get`,
  UPDATES: `${API_BASE_URL}/updates`,
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

export interface ApiConfig {
  postponeFetch: boolean;
}

export const ApiConfig: TypeIndex<ApiName, ApiConfig> = {
  FOCUS: {
    postponeFetch: false,
  },
  FOCUS_INKOMEN_SPECIFICATIES: {
    postponeFetch: !FeatureToggle.focusUitkeringsspecificatiesActive,
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
  BRP: 'Persoonlijke gegevens + actuele updates',
  MY_CASES: 'Lopende zaken',
  MIJN_TIPS: 'Tips',
  WMO: 'Zorg en ondersteuning',
  FOCUS: 'Inkomen en Stadspas + actuele updates',
  FOCUS_INKOMEN_SPECIFICATIES: 'Inkomen en Stadspas + actuele updates',
  MY_CHAPTERS: "Thema's",
  ERFPACHT: 'Erfpacht',
  GARBAGE: 'Afval',
  MIJN_BUURT: 'Mijn buurt',
  BELASTINGEN: 'Belastingen + updates',
  MILIEUZONE: 'Milieuzone',
};

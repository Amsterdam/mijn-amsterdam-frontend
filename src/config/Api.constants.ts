import { FeatureToggle } from './App.constants';
import { StateKey } from 'AppState';

export const LOGIN_URL = process.env.REACT_APP_LOGIN_URL || '/api/login';
export const LOGOUT_URL = process.env.REACT_APP_LOGOUT_URL || '/logout';

let apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

if (window.location.pathname.startsWith('/api1/')) {
  apiBaseUrl = `${apiBaseUrl}`.replace(/\/api/g, '/api1');
}

export const API_BASE_URL = apiBaseUrl;
const DATAPUNT_API_BASE_URL = process.env.REACT_APP_DATAPUNT_API_URL;

export type ApiName = StateKey | 'BAG' | 'AUTH' | 'AFVAL_OPHAAL_GEBIEDEN';

export const ApiUrls: TypeIndex<ApiName, string> = {
  BELASTINGEN: `${API_BASE_URL}/belastingen/get`,
  UPDATES: `${API_BASE_URL}/updates`,
  MY_CASES: `${API_BASE_URL}/focus/aanvragen`,
  MIJN_TIPS: `${API_BASE_URL}/tips/gettips`,
  BRP: `${API_BASE_URL}/brp/brp`,
  WMO: `${API_BASE_URL}/wmoned/voorzieningen`,
  FOCUS: `${API_BASE_URL}/focus/aanvragen`,
  FOCUS_SPECIFICATIONS: `${API_BASE_URL}/focus/combined`,
  AUTH: `${API_BASE_URL}/auth/check`,
  ERFPACHT: `${API_BASE_URL}/erfpacht/check-erfpacht`,
  BAG: `${DATAPUNT_API_BASE_URL}/atlas/search/adres/`,
  AFVAL_OPHAAL_GEBIEDEN: `${DATAPUNT_API_BASE_URL}/afvalophaalgebieden/search/`,
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
  BRP: 'Persoonlijke gegevens + actuele updates',
  MY_CASES: 'Lopende zaken',
  MIJN_TIPS: 'Tips',
  WMO: 'Zorg en ondersteuning',
  FOCUS: 'Inkomen en Stadspas + actuele updates',
  FOCUS_SPECIFICATIONS:
    'Uitkeringsspecificaties, Jaaropgaven en Tozo regelingen + actuele updates',
  MY_CHAPTERS: "Thema's",
  ERFPACHT: 'Erfpacht',
  GARBAGE: 'Afval',
  MIJN_BUURT: 'Mijn buurt',
  BELASTINGEN: 'Belastingen + updates',
  MILIEUZONE: 'Milieuzone',
};

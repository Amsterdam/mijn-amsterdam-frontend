import { StateKey } from 'AppState';
import { IS_ACCEPTANCE, IS_PRODUCTION } from '../env';
import { FeatureToggle } from './App.constants';

export const LOGIN_URL = process.env.REACT_APP_LOGIN_URL || '/login';
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
  MELDINGEN: `${API_BASE_URL}/mijn-meldingen`,
  MY_CASES: `${API_BASE_URL}/focus/aanvragen`,
  MIJN_TIPS: `${API_BASE_URL}/tips/gettips`,
  BRP: `${API_BASE_URL}/brp/brp`,
  WMO: `${API_BASE_URL}/wmoned/voorzieningen`,
  FOCUS: `${API_BASE_URL}/focus/aanvragen`,
  FOCUS_INKOMEN_SPECIFICATIES: `${API_BASE_URL}/focus/uitkeringsspecificaties`,
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
  FOCUS_INKOMEN_SPECIFICATIES: {
    postponeFetch: IS_PRODUCTION || IS_ACCEPTANCE,
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

import { StateKey } from 'AppState';
import { ErrorMessageMap } from 'components/ErrorMessages/ErrorMessages';
import { FeatureToggle } from './App.constants';

export const LOGIN_URL = process.env.REACT_APP_LOGIN_URL || '/login';
export const LOGOUT_URL = process.env.REACT_APP_LOGOUT_URL || '/logout';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const DATAPUNT_API_BASE_URL = process.env.REACT_APP_DATAPUNT_API_URL;

export type ApiName = StateKey | 'BAG' | 'AUTH' | 'AFVAL_OPHAAL_GEBIEDEN';

export const ApiUrls: TypeIndex<ApiName, string> = {
  BELASTINGEN: `${API_BASE_URL}/belasting/get`,
  MELDINGEN: `${API_BASE_URL}/mijn-meldingen`,
  MY_CASES: `${API_BASE_URL}/focus/aanvragen`,
  MIJN_TIPS: `${API_BASE_URL}/tips/gettips`,
  BRP: `${API_BASE_URL}/brp/brp`,
  WMO: `${API_BASE_URL}/wmoned/voorzieningen`,
  FOCUS: `${API_BASE_URL}/focus/aanvragen`,
  AUTH: `${API_BASE_URL}/auth/check`,
  ERFPACHT: `${API_BASE_URL}/erfpacht/check-erfpacht`,
  BAG: `${DATAPUNT_API_BASE_URL}/atlas/search/adres/`,
  AFVAL_OPHAAL_GEBIEDEN: `${DATAPUNT_API_BASE_URL}/afvalophaalgebieden/search/`,
};

export interface ApiConfig {
  postponeFetch: boolean;
}

export const ApiConfig: TypeIndex<ApiName, ApiConfig> = {
  FOCUS: {
    postponeFetch: false,
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
};

export const errorMessageMap: ErrorMessageMap = {
  BRP: {
    name: 'Persoonsgegevens',
    error: 'Communicatie met api mislukt.',
  },
  MELDINGEN: {
    name: 'Actueel',
    error: 'Communicatie met api mislukt.',
  },
  MY_CASES: {
    name: 'Mijn lopende aanvragen',
    error: 'Communicatie met api mislukt.',
  },
  MIJN_TIPS: {
    name: 'Mijn tips',
    error: 'Communicatie met api mislukt.',
  },
  WMO: {
    name: 'Zorg en ondersteuning',
    error: 'Communicatie met api mislukt.',
  },
  FOCUS: {
    name: 'Stadspas of Bijstandsuitkering',
    error: 'Communicatie met api mislukt.',
  },
  ERFPACHT: {
    name: 'Erfpacht',
    error: 'Communicatie met api mislukt.',
  },
  GARBAGE: {
    name: 'Afval',
    error: 'Communicatie met api mislukt.',
  },
  BELASTINGEN: {
    name: 'Belasting',
    error: 'Communicatie met api mislukt.',
  },
};

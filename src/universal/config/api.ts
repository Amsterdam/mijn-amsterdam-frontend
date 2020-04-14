import {
  fetchWMO,
  fetchBRP,
  fetchTIPS,
  fetchBELASTING,
  fetchERFPACHT,
  fetchBAG,
  fetchAFVAL,
  fetchMILIEUZONE,
  fetchFOCUSAanvragen,
  fetchFOCUSSpecificaties,
} from '../../server/services';
import { FeatureToggle } from './app';

export type ApiResult<T extends (...args: any[]) => any> = ResolvedType<
  ReturnType<T>
>;

export interface BFFApiData {
  BELASTINGEN: ApiResult<typeof fetchBELASTING>;
  TIPS: ApiResult<typeof fetchTIPS>;
  BRP: ApiResult<typeof fetchBRP>;
  WMO: ApiResult<typeof fetchWMO>;
  FOCUS_AANVRAGEN: ApiResult<typeof fetchFOCUSAanvragen>;
  FOCUS_SPECIFICATIES: ApiResult<typeof fetchFOCUSSpecificaties>;
  ERFPACHT: ApiResult<typeof fetchERFPACHT>;
  BAG: ApiResult<typeof fetchBAG>;
  AFVAL: ApiResult<typeof fetchAFVAL>;
  MILIEUZONE: ApiResult<typeof fetchMILIEUZONE>;
  [key: string]: any;
}

export type ApiStateKey = keyof BFFApiData | string;

export const LOGIN_URL = process.env.REACT_APP_LOGIN_URL || '/api/login';
export const LOGIN_EHERKENNING_URL = '/api1/login';
export const LOGOUT_URL = process.env.REACT_APP_LOGOUT_URL || '/logout';
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api';
export const BFF_API_BASE_URL =
  process.env.REACT_APP_BFF_API_BASE_URL || '/api/bff';
export const DATAPUNT_API_BASE_URL = process.env.REACT_APP_DATAPUNT_API_URL;

export const BFFApiUrls: Record<string, string> = {
  SERVICES_RELATED: `${BFF_API_BASE_URL}/services/related`,
  SERVICES_DIRECT: `${BFF_API_BASE_URL}/services/direct`,
  SERVICES_GENERATED: `${BFF_API_BASE_URL}/services/generated`,
  SERVICES_MAP: `${BFF_API_BASE_URL}/services/map`,
};

export const ApiUrls: Record<ApiStateKey, string> = {
  BELASTINGEN: `${API_BASE_URL}/belastingen/get`,
  TIPS: `${API_BASE_URL}/tips/gettips`,
  BRP: `${API_BASE_URL}/brp/brp`,
  WMO: `${API_BASE_URL}/wmoned/voorzieningen`,
  FOCUS_AANVRAGEN: `${API_BASE_URL}/focus/aanvragen`,
  FOCUS_SPECIFICATIES: `${API_BASE_URL}/focus/combined`,
  AUTH: `${API_BASE_URL}/auth/check`,
  ERFPACHT: `${API_BASE_URL}/erfpacht/check-erfpacht`,
  BAG: `${DATAPUNT_API_BASE_URL}/atlas/search/adres/`,
  AFVAL: `${DATAPUNT_API_BASE_URL}/afvalophaalgebieden/search/`,
  MILIEUZONE: `${API_BASE_URL}/milieu/get`,
};

export interface ApiConfig {
  postponeFetch: boolean;
}

export const ApiConfig: Record<ApiStateKey, ApiConfig> = {
   FOCUS_SPECIFICATIES: {
    postponeFetch: !FeatureToggle.focusUitkeringsspecificatiesActive,
  },
  FOCUS_AANVRAGEN: {
    postponeFetch: !FeatureToggle.focusAanvragenActive,
  },
  BELASTINGEN: {
    postponeFetch: !FeatureToggle.belastingApiActive,
  },
  MILIEUZONE: {
    postponeFetch: !FeatureToggle.milieuzoneApiActive,
  },
};

export const ErrorNames: Record<ApiStateKey, string> = {
  BRP: 'Persoonlijke gegevens + actuele updates',
  CASES: 'Lopende zaken',
  TIPS: 'Tips',
  NOTIFICATIONS: 'Actuele updates',
  WMO: 'Zorg en ondersteuning',
  FOCUS_AANVRAGEN: 'Inkomen en Stadspas + actuele updates',
  FOCUS_SPECIFICATIES:
    'Uitkeringsspecificaties en jaaropgaven + actuele updates',
  CHAPTERS: "Thema's",
  ERFPACHT: 'Erfpacht',
  AFVAL: 'Afval gegevens rond uw Lat/Lon locatie',
  BUURT: 'Mijn buurt',
  BELASTINGEN: 'Belastingen + actuele updates',
  MILIEUZONE: 'Milieuzone + actuele updates',
  HOME: 'Lat/Lon locatie gegevens van uw adres.',
};

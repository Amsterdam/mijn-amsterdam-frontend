import { FeatureToggle } from '../universal/config';
import { ApiStateKey } from './services/state';

// Urls used in the BFF api
// Microservices (Tussen Api) base url
const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || 'localhost';

export const BFF_MS_API_BASE_URL =
  process.env.BFF_MS_API_BASE_URL || `http://${HOST}:${PORT}/api`;
export const BFF_DATAPUNT_API_BASE_URL =
  process.env.BFF_DATAPUNT_API_BASE_URL || BFF_MS_API_BASE_URL;
export const BFF_BASE_PATH = process.env.BFF_BASE_PATH || '/api/bff';

export const ApiUrls: Record<ApiStateKey, string> = {
  BELASTINGEN: `${BFF_MS_API_BASE_URL}/belastingen/get`,
  TIPS: `${BFF_MS_API_BASE_URL}/tips/gettips`,
  BRP: `${BFF_MS_API_BASE_URL}/brp/brp`,
  WMO: `${BFF_MS_API_BASE_URL}/wmoned/voorzieningen`,
  FOCUS_AANVRAGEN: `${BFF_MS_API_BASE_URL}/focus/aanvragen`,
  FOCUS_SPECIFICATIES: `${BFF_MS_API_BASE_URL}/focus/combined`,
  ERFPACHT: `${BFF_MS_API_BASE_URL}/erfpacht/check-erfpacht`,
  BAG: `${BFF_DATAPUNT_API_BASE_URL}/atlas/search/adres/`,
  AFVAL: `${BFF_DATAPUNT_API_BASE_URL}/afvalophaalgebieden/search/`,
  MILIEUZONE: `${BFF_MS_API_BASE_URL}/milieu/get`,
};

export interface ApiConfig {
  postponeFetch: boolean;
}

export const ApiConfig: Record<ApiStateKey | string, ApiConfig> = {
  FOCUS_SPECIFICATIES: {
    postponeFetch: !FeatureToggle.focusUitkeringsspecificatiesActive,
  },
  FOCUS_AANVRAGEN: {
    postponeFetch: !FeatureToggle.focusAanvragenActive,
  },
  BELASTINGEN: {
    postponeFetch: !FeatureToggle.belastingApiActive,
  },
  BELASTINGEN_GENERATED: {
    postponeFetch: !FeatureToggle.belastingApiActive,
  },
  MILIEUZONE: {
    postponeFetch: !FeatureToggle.milieuzoneApiActive,
  },
  MILIEUZONE_GENERATED: {
    postponeFetch: !FeatureToggle.milieuzoneApiActive,
  },
};

export function getApiConfigValue(
  name: ApiStateKey,
  param: keyof ApiConfig,
  defaultValue: any
) {
  const cfg = ApiConfig[name] && ApiConfig[name]![param];
  return typeof cfg !== 'undefined' ? cfg : defaultValue;
}

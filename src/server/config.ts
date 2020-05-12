import { FeatureToggle } from '../universal/config';
import { ApiStateKey } from './services/state';

// Urls used in the BFF api
// Microservices (Tussen Api) base url
const BFF_HOST = process.env.BFF_HOST || 'localhost';
const BFF_PORT = process.env.BFF_PORT || 5000;

export const BFF_MS_API_BASE_URL =
  process.env.BFF_MS_API_BASE_URL || `http://${BFF_HOST}:${BFF_PORT}/test-api`;
export const BFF_DATAPUNT_API_BASE_URL =
  process.env.BFF_DATAPUNT_API_BASE_URL || BFF_MS_API_BASE_URL;

export const ApiUrls: Record<ApiStateKey, string> = {
  BELASTINGEN: `${BFF_MS_API_BASE_URL}/belastingen/get`,
  TIPS: `${BFF_MS_API_BASE_URL}/tips/gettips`,
  BRP: `${BFF_MS_API_BASE_URL}/brp/brp`,
  WMO: `${BFF_MS_API_BASE_URL}/wmoned/voorzieningen`,
  FOCUS_AANVRAGEN: `${BFF_MS_API_BASE_URL}/focus/aanvragen`,
  FOCUS_COMBINED: `${BFF_MS_API_BASE_URL}/focus/combined`,
  ERFPACHT: `${BFF_MS_API_BASE_URL}/erfpacht/check-erfpacht`,
  BAG: `${BFF_DATAPUNT_API_BASE_URL}/atlas/search/adres/`,
  AFVAL: `${BFF_DATAPUNT_API_BASE_URL}/afvalophaalgebieden/search/`,
  MILIEUZONE: `${BFF_MS_API_BASE_URL}/milieu/get`,
};

export interface ApiConfig {
  postponeFetch: boolean;
}

export const ApiConfig: Record<ApiStateKey | string, ApiConfig> = {
  FOCUS_COMBINED: {
    postponeFetch: !FeatureToggle.focusCombinedActive,
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

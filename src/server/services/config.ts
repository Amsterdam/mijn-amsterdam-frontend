import {
  API_BASE_URL,
  DATAPUNT_API_BASE_URL,
  FeatureToggle,
} from '../../universal/config';
import { ApiStateKey } from './state';

export const ApiUrls: Record<ApiStateKey, string> = {
  BELASTINGEN: `${API_BASE_URL}/belastingen/get`,
  TIPS: `${API_BASE_URL}/tips/gettips`,
  BRP: `${API_BASE_URL}/brp/brp`,
  WMO: `${API_BASE_URL}/wmoned/voorzieningen`,
  FOCUS_AANVRAGEN: `${API_BASE_URL}/focus/aanvragen`,
  FOCUS_SPECIFICATIES: `${API_BASE_URL}/focus/combined`,
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

export function getApiConfigValue(
  name: ApiStateKey,
  param: keyof ApiConfig,
  defaultValue: any
) {
  const cfg = ApiConfig[name] && ApiConfig[name]![param];
  return typeof cfg !== 'undefined' ? cfg : defaultValue;
}

import { AxiosRequestConfig } from 'axios';
import { FeatureToggle, API_BASE_PATH } from '../universal/config';
import { IS_ACCEPTANCE, IS_AP, IS_PRODUCTION } from '../universal/config/env';

export const TMA_SAML_HEADER: string = 'x-saml-attribute-token1';
export const DEV_USER_TYPE_HEADER: string = 'x-user-type';
export const ICL_COOKIE_NAME: string = 'icl'; // Is commercial login
export const BFF_REQUEST_CACHE_ENABLED =
  typeof process.env.BFF_REQUEST_CACHE_ENABLED !== 'undefined'
    ? process.env.BFF_REQUEST_CACHE_ENABLED === 'true'
    : true;

// Urls used in the BFF api
// Microservices (Tussen Api) base url
export const BFF_HOST = process.env.BFF_HOST || 'localhost';
export const BFF_PORT = process.env.BFF_PORT || 5000;
export const BFF_BASE_PATH = IS_AP ? '/bff' : '/test-api/bff';
export const BFF_PUBLIC_BASE_PATH = IS_AP ? '/public' : '/test-api/public';

const BFF_MS_API_HOST = IS_PRODUCTION
  ? process.env.BFF_MS_API_HOST || 'mijn.data.amsterdam.nl'
  : IS_ACCEPTANCE
  ? process.env.BFF_MS_API_HOST || 'acc.mijn.data.amsterdam.nl'
  : 'localhost';

const BFF_MS_API_PORT = IS_AP ? '' : `:${process.env.BFF_PORT || 5000}`;
const BFF_MS_API_PROTOCOL = IS_AP ? 'https' : 'http';

export const BFF_MS_API_BASE_URL = `${BFF_MS_API_PROTOCOL}://${BFF_MS_API_HOST}${BFF_MS_API_PORT}${API_BASE_PATH}`;

export const BFF_DATAPUNT_API_BASE_URL = IS_AP
  ? 'https://api.data.amsterdam.nl'
  : BFF_MS_API_BASE_URL;

export interface DataRequestConfig extends AxiosRequestConfig {
  cacheTimeout?: number;
  cancelTimeout?: number;
  postponeFetch?: boolean;
  urls?: Record<string, string>;
}

const ONE_SECOND_MS = 1000;
const ONE_MINUTE_MS = 60 * ONE_SECOND_MS;
const ONE_HOUR_MS = 60 * ONE_MINUTE_MS;

export const DEFAULT_API_CACHE_TTL_MS = 30 * ONE_SECOND_MS;
export const DEFAULT_CANCEL_TIMEOUT_MS = 10 * ONE_SECOND_MS;

export const DEFAULT_REQUEST_CONFIG: DataRequestConfig = {
  cancelTimeout: DEFAULT_CANCEL_TIMEOUT_MS,
  method: 'get',
  cacheTimeout: DEFAULT_API_CACHE_TTL_MS,
  postponeFetch: false,
};

export type SourceApiKey =
  | 'AUTH'
  | 'WMO'
  | 'FOCUS_COMBINED'
  | 'FOCUS_AANVRAGEN'
  | 'BELASTINGEN'
  | 'MILIEUZONE'
  | 'SIA'
  | 'VERGUNNINGEN'
  | 'CMS_CONTENT_GENERAL_INFO'
  | 'CMS_CONTENT_FOOTER'
  | 'CMS_MAINTENANCE_NOTIFICATIONS'
  | 'TIPS'
  | 'BRP'
  | 'ERFPACHT'
  | 'BAG'
  | 'AKTES'
  | 'AFVAL'
  | 'KVK';

type ApiDataRequestConfig = Record<SourceApiKey, DataRequestConfig>;

export const ApiConfig: ApiDataRequestConfig = {
  AUTH: {
    url: `${BFF_MS_API_BASE_URL}/auth/check`,
    cacheTimeout: 0,
  },
  WMO: {
    url: `${BFF_MS_API_BASE_URL}/wmoned/voorzieningen`,
  },
  FOCUS_COMBINED: {
    url: `${BFF_MS_API_BASE_URL}/focus/combined`,
  },
  FOCUS_AANVRAGEN: {
    url: `${BFF_MS_API_BASE_URL}/focus/aanvragen`,
  },
  BELASTINGEN: {
    url: `${BFF_MS_API_BASE_URL}/belastingen/get`,
    postponeFetch: !FeatureToggle.belastingApiActive,
  },
  MILIEUZONE: {
    url: `${BFF_MS_API_BASE_URL}/milieu/get`,
    postponeFetch: !FeatureToggle.milieuzoneApiActive,
  },
  SIA: {
    url: `${BFF_MS_API_BASE_URL}/sia/get`,
    postponeFetch: !FeatureToggle.siaApiActive,
  },
  VERGUNNINGEN: {
    url: `${BFF_MS_API_BASE_URL}/decosjoin/getvergunningen`,
    postponeFetch: !FeatureToggle.vergunningenActive,
  },
  CMS_CONTENT_GENERAL_INFO: {
    cacheTimeout: 4 * ONE_HOUR_MS,
    urls: {
      private:
        'https://www.amsterdam.nl/mijn-content/artikelen/ziet-amsterdam/?AppIdt=app-data',
      'private-commercial':
        'https://www.amsterdam.nl/mijn-content/artikelen/overzicht-producten-eenmanszaak/?AppIdt=app-data',
      commercial:
        'https://www.amsterdam.nl/mijn-content/artikelen/overzicht-producten-ondernemers/?AppIdt=app-data',
    },
  },
  CMS_CONTENT_FOOTER: {
    url: `https://www.amsterdam.nl/algemene_onderdelen/overige/footer/?AppIdt=app-data`,
    cacheTimeout: 4 * ONE_HOUR_MS,
    postponeFetch: !FeatureToggle.cmsFooterActive,
  },
  CMS_MAINTENANCE_NOTIFICATIONS: {
    url: `https://www.amsterdam.nl/storingsmeldingen/alle-meldingen-mijn-amsterdam?new_json=true&reload=true`,
    cacheTimeout: ONE_HOUR_MS,
  },
  TIPS: {
    url: `${BFF_MS_API_BASE_URL}/tips/gettips`,
  },
  BRP: { url: `${BFF_MS_API_BASE_URL}/brp/brp` },
  AKTES: {
    url: `${BFF_MS_API_BASE_URL}/aktes/aktes`,
    postponeFetch: !FeatureToggle.aktesActive,
  },
  ERFPACHT: { url: `${BFF_MS_API_BASE_URL}/erfpacht/check-erfpacht` },
  BAG: { url: `${BFF_DATAPUNT_API_BASE_URL}/atlas/search/adres/` },
  AFVAL: {
    url: `${BFF_DATAPUNT_API_BASE_URL}/afvalophaalgebieden/search/`,
  },
  KVK: {
    url: `${BFF_MS_API_BASE_URL}/brp/hr`,
  },
};

export const ApiUrls = Object.entries(ApiConfig).reduce(
  (acc, [apiName, { url }]) => {
    return Object.assign(acc, { [apiName]: url || '' });
  },
  {} as Record<SourceApiKey, string>
);

export function getApiConfig(name: SourceApiKey, config?: DataRequestConfig) {
  return Object.assign(ApiConfig[name] || {}, config || {});
}

export const BffEndpoints = {
  SERVICES_TIPS: `/services/tips`,
  SERVICES_TIPS_REQUEST_DATA_OVERVIEW: `/services/tips/requestdataoverview`,
  SERVICES_ALL: `/services/all`,
  SERVICES_STREAM: `/services/stream`,
  HEALTH: `/status/health`,
  CMS_CONTENT: `/public/services/cms`,
  CMS_MAINTENANCE_NOTIFICATIONS: `/public/services/cms/maintenance-notifications`,
  MAP_DATASETS: `/map/datasets/:datasetId?/:id?`,
  CACHE_OVERVIEW: `/status/cache`,
  API_DIRECT: `/direct/:apiName`,
};

export const PUBLIC_BFF_ENDPOINTS: string[] = [
  BffEndpoints.HEALTH,
  BffEndpoints.CMS_CONTENT,
  BffEndpoints.CMS_MAINTENANCE_NOTIFICATIONS,
  BffEndpoints.CACHE_OVERVIEW,
];

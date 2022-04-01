import { AxiosRequestConfig } from 'axios';
import { CorsOptions } from 'cors';
import { ConfigParams } from 'express-openid-connect';
import https from 'https';
import { FeatureToggle } from '../universal/config';
import { IS_ACCEPTANCE, IS_AP, IS_PRODUCTION } from '../universal/config/env';

export const BFF_REQUEST_CACHE_ENABLED =
  typeof process.env.BFF_REQUEST_CACHE_ENABLED !== 'undefined'
    ? process.env.BFF_REQUEST_CACHE_ENABLED === 'true'
    : true;

// Urls used in the BFF api
// Microservices (Tussen Api) base url
export const BFF_HOST = process.env.BFF_HOST || 'localhost';
export const BFF_PORT = process.env.BFF_PORT || 5000;
export const BFF_BASE_PATH = '/bff';

const BFF_MS_API_HOST = IS_PRODUCTION
  ? process.env.BFF_MS_API_HOST || 'mijn.data.amsterdam.nl'
  : IS_ACCEPTANCE
  ? process.env.BFF_MS_API_HOST || 'acc.mijn.data.amsterdam.nl'
  : 'localhost';

const BFF_MS_API_PORT = IS_AP ? '' : `:${BFF_PORT}`;
const BFF_MS_API_PROTOCOL = IS_AP ? 'https' : 'http';

export const BFF_MS_API_BASE_URL = `${BFF_MS_API_PROTOCOL}://${BFF_MS_API_HOST}${BFF_MS_API_PORT}`;

export const BFF_DATAPUNT_API_BASE_URL = IS_AP
  ? 'https://api.data.amsterdam.nl'
  : BFF_MS_API_BASE_URL;

export interface DataRequestConfig extends AxiosRequestConfig {
  cacheTimeout?: number;
  cancelTimeout?: number;
  postponeFetch?: boolean;
  urls?: Record<string, string>;
  cacheKey?: string;
  hasBearerToken?: boolean;
}

const ONE_SECOND_MS = 1000;
const ONE_MINUTE_MS = 60 * ONE_SECOND_MS;
const ONE_HOUR_MS = 60 * ONE_MINUTE_MS;

export const DEFAULT_API_CACHE_TTL_MS = 45 * ONE_SECOND_MS; // This means that every request that depends on the response of another will use the cached version of the response for a maximum of 45 seconds.
export const DEFAULT_CANCEL_TIMEOUT_MS = 20 * ONE_SECOND_MS; // This means a request will be aborted after 20 seconds without a response.

export const DEFAULT_REQUEST_CONFIG: DataRequestConfig = {
  cancelTimeout: DEFAULT_CANCEL_TIMEOUT_MS,
  method: 'get',
  cacheTimeout: DEFAULT_API_CACHE_TTL_MS,
  postponeFetch: false,
  hasBearerToken: true,
};

export type SourceApiKey =
  | 'AUTH'
  | 'WMO'
  | 'WPI_E_AANVRAGEN'
  | 'WPI_AANVRAGEN'
  | 'WPI_SPECIFICATIES'
  | 'WPI_STADSPAS'
  | 'BELASTINGEN'
  | 'MILIEUZONE'
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
  | 'TOERISTISCHE_VERHUUR_REGISTRATIES'
  | 'KVK'
  | 'SEARCH_CONFIG'
  | 'SUBSIDIE'
  | 'KREFIA';

type ApiDataRequestConfig = Record<SourceApiKey, DataRequestConfig>;

export const ApiConfig: ApiDataRequestConfig = {
  AUTH: {
    url: `${BFF_MS_API_BASE_URL}/auth/check`,
    cacheTimeout: 0,
  },
  WMO: {
    url: `${BFF_MS_API_BASE_URL}/wmoned/voorzieningen`,
  },
  WPI_E_AANVRAGEN: {
    url: `${BFF_MS_API_BASE_URL}/wpi/e-aanvragen`,
  },
  WPI_AANVRAGEN: {
    url: `${BFF_MS_API_BASE_URL}/wpi/uitkering-en-stadspas/aanvragen`,
  },
  WPI_SPECIFICATIES: {
    url: `${BFF_MS_API_BASE_URL}/wpi/uitkering/specificaties-en-jaaropgaven`,
  },
  WPI_STADSPAS: {
    url: `${BFF_MS_API_BASE_URL}/wpi/stadspas`,
  },
  BELASTINGEN: {
    url: `${BFF_MS_API_BASE_URL}/belastingen/get`,
    postponeFetch: !FeatureToggle.belastingApiActive,
  },
  MILIEUZONE: {
    url: `${BFF_MS_API_BASE_URL}/milieu/get`,
    postponeFetch: !FeatureToggle.milieuzoneApiActive,
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
    url: 'https://www.amsterdam.nl/algemene_onderdelen/overige/footer/?AppIdt=app-data',
    cacheTimeout: 4 * ONE_HOUR_MS,
    postponeFetch: !FeatureToggle.cmsFooterActive,
  },
  CMS_MAINTENANCE_NOTIFICATIONS: {
    url: 'https://www.amsterdam.nl/storingsmeldingen/alle-meldingen-mijn-amsterdam?new_json=true&reload=true',
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
  ERFPACHT: {
    url: `${BFF_MS_API_BASE_URL}/erfpacht${
      FeatureToggle.erfpachtV2EndpointActive ? '/v2' : ''
    }/check-erfpacht`,
  },
  BAG: { url: `${BFF_DATAPUNT_API_BASE_URL}/atlas/search/adres/` },
  AFVAL: {
    url: `${BFF_DATAPUNT_API_BASE_URL}/afvalophaalgebieden/search/`,
  },
  KVK: {
    url: `${BFF_MS_API_BASE_URL}/brp/hr`,
  },
  TOERISTISCHE_VERHUUR_REGISTRATIES: {
    url: `${BFF_MS_API_BASE_URL}/vakantie-verhuur/get`,
    postponeFetch: !FeatureToggle.toeristischeVerhuurActive,
  },
  KREFIA: {
    url: `${BFF_MS_API_BASE_URL}/krefia/all`,
    postponeFetch: !FeatureToggle.krefiaActive,
  },
  SUBSIDIE: {
    url: `${BFF_MS_API_BASE_URL}/subsidies/summary`,
    postponeFetch: !FeatureToggle.subsidieActive,
  },
  SEARCH_CONFIG: {
    url: 'https://raw.githubusercontent.com/Amsterdam/mijn-amsterdam-frontend/main/src/client/components/Search/search-config.json',
    httpsAgent: new https.Agent({
      rejectUnauthorized: false, // NOTE: Risk is assessed and tolerable for now because this concerns a request to a wel known actor (GH), no sensitive data is involved and no JS code is evaluated.
    }),
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

export const RelayPathsAllowed = {
  VERGUNNINGEN_LIST_DOCUMENTS: '/decosjoin/listdocuments/:key',
  VERGUNNINGEN_DOCUMENT_DOWNLOAD: '/decosjoin/document/:key',
  WPI_DOCUMENT_DOWNLOAD: '/wpi/document',
  WPI_STADSPAS_TRANSACTIES: '/wpi/stadspas/transacties/:id',
  BRP_BEWONERS: '/brp/aantal_bewoners',
  TIP_IMAGES: '/tips/static/tip_images/:fileName',
};

export const PUBLIC_AUTH_BASE = process.env.BFF_OIDC_BASE_PATH || '';
export const PUBLIC_AUTH_BASE_DIGID = `${PUBLIC_AUTH_BASE}/digid`;
export const PUBLIC_AUTH_BASE_EHERKENNING = `${PUBLIC_AUTH_BASE}/eherkenning`;
export const PUBLIC_AUTH_LOGIN = `${process.env.BFF_OIDC_LOGIN}`;
export const PUBLIC_AUTH_LOGOUT = `${process.env.BFF_OIDC_LOGOUT}`;
export const PUBLIC_AUTH_CALLBACK = `${process.env.BFF_OIDC_CALLBACK}`;

export const BffEndpoints = {
  SERVICES_TIPS: '/services/tips',
  SERVICES_TIPS_REQUEST_DATA_OVERVIEW: '/services/tips/requestdataoverview',
  SERVICES_ALL: '/services/all',
  SERVICES_STREAM: '/services/stream',
  MAP_DATASETS: '/map/datasets/:datasetId?/:id?',
  API_DIRECT: '/direct/:apiName',
  SEARCH_CONFIG: '/services/search-config',

  // start: OIDC config
  PUBLIC_AUTH_BASE_DIGID,
  PUBLIC_AUTH_BASE_EHERKENNING,

  // Digid
  PUBLIC_AUTH_CALLBACK_DIGID:
    process.env.BFF_OIDC_BASE_URL +
    PUBLIC_AUTH_BASE_DIGID +
    PUBLIC_AUTH_CALLBACK,
  PUBLIC_AUTH_LOGIN_DIGID: PUBLIC_AUTH_BASE_DIGID + PUBLIC_AUTH_LOGIN,
  PUBLIC_AUTH_LOGOUT_DIGID: PUBLIC_AUTH_BASE_DIGID + PUBLIC_AUTH_LOGOUT,

  // EHerkenning
  PUBLIC_AUTH_CALLBACK_EHERKENNING:
    process.env.BFF_OIDC_BASE_URL +
    PUBLIC_AUTH_BASE_EHERKENNING +
    PUBLIC_AUTH_CALLBACK,
  PUBLIC_AUTH_LOGIN_EHERKENNING:
    PUBLIC_AUTH_BASE_EHERKENNING + PUBLIC_AUTH_LOGIN,
  PUBLIC_AUTH_LOGOUT_EHERKENNING:
    PUBLIC_AUTH_BASE_EHERKENNING + PUBLIC_AUTH_LOGOUT,

  // Application specific urls
  PUBLIC_AUTH_CHECK: `${PUBLIC_AUTH_BASE}/check`,
  PUBLIC_AUTH_LOGOUT: `${PUBLIC_AUTH_BASE}/logout`,
  // end: OIDC config

  PUBLIC_CMS_CONTENT: '/public/services/cms',
  PUBLIC_CMS_MAINTENANCE_NOTIFICATIONS:
    '/public/services/cms/maintenance-notifications',
  PUBLIC_CACHE_OVERVIEW: '/status/cache',
  PUBLIC_HEALTH: '/status/health',
};

export const PUBLIC_BFF_ENDPOINTS: string[] = [
  BffEndpoints.PUBLIC_HEALTH,
  BffEndpoints.PUBLIC_CMS_CONTENT,
  BffEndpoints.PUBLIC_CMS_MAINTENANCE_NOTIFICATIONS,
  BffEndpoints.PUBLIC_CACHE_OVERVIEW,
];

export const OIDC_SESSION_MAX_AGE_SECONDS = 15 * 60;
export const OIDC_SESSION_COOKIE_NAME = 'appSession';
export const OIDC_SECRET = `${process.env.BFF_OIDC_SECRET}`;

const oidcConfigBase: ConfigParams = {
  authRequired: false,
  auth0Logout: false,
  idpLogout: true,
  secret: OIDC_SECRET,
  baseURL: process.env.BFF_OIDC_BASE_URL,
  issuerBaseURL: process.env.BFF_OIDC_ISSUER_BASE_URL,
  attemptSilentLogin: false,
  authorizationParams: { prompt: 'login' },
  session: {
    rolling: false,
    rollingDuration: undefined,
    absoluteDuration: OIDC_SESSION_MAX_AGE_SECONDS,
    name: OIDC_SESSION_COOKIE_NAME,
  },
};

export const oidcConfigDigid: ConfigParams = {
  ...oidcConfigBase,
  clientID: process.env.BFF_OIDC_CLIENT_ID_DIGID,
  routes: {
    login: false,
    logout: PUBLIC_AUTH_LOGOUT,
    callback: PUBLIC_AUTH_CALLBACK, // Relative to the Router path PUBLIC_AUTH_BASE_DIGID
    postLogoutRedirect: process.env.BFF_FRONTEND_URL,
  },
};

export const oidcConfigEherkenning: ConfigParams = {
  ...oidcConfigBase,
  clientID: process.env.BFF_OIDC_CLIENT_ID_EHERKENNING,
  routes: {
    login: false,
    logout: PUBLIC_AUTH_LOGOUT,
    callback: PUBLIC_AUTH_CALLBACK, // Relative to the Router path PUBLIC_AUTH_BASE_EHERKENNING
    postLogoutRedirect: process.env.BFF_FRONTEND_URL,
  },
};

export const corsOptions: CorsOptions = {
  origin: process.env.BFF_FRONTEND_URL,
  credentials: true,
};

import { AxiosRequestConfig } from 'axios';
import { CorsOptions } from 'cors';
import { ConfigParams } from 'express-openid-connect';
import fs from 'fs';
import https from 'https';
import * as jose from 'jose';
import { FeatureToggle } from '../universal/config';
import { IS_OT, IS_TAP, IS_TEST } from '../universal/config/env';
import {
  ApiErrorResponse,
  ApiPostponeResponse,
  ApiSuccessResponse,
} from './../universal/helpers/api';
import { TokenData } from './helpers/app';

export function getCertificateSync(envVarName: string | undefined) {
  const path = envVarName && process.env[envVarName];
  if (path) {
    try {
      return fs.readFileSync(path).toString();
    } catch (error) {}
  }

  return undefined;
}

function decodeBase64EncodedCertificateFromEnv(name: string | undefined) {
  const data = name && process.env[name];
  if (data) {
    return Buffer.from(data, 'base64').toString('utf-8');
  }
  return undefined;
}

function getCert(envVarName: string | undefined) {
  // TODO: Should be only decodeBase64EncodedCertificateFromEnv when we've migrated to AZ
  return IS_TEST
    ? decodeBase64EncodedCertificateFromEnv(envVarName)
    : getCertificateSync(envVarName);
}

export const BFF_REQUEST_CACHE_ENABLED =
  typeof process.env.BFF_REQUEST_CACHE_ENABLED !== 'undefined'
    ? String(process.env.BFF_REQUEST_CACHE_ENABLED).toLowerCase() === 'true'
    : true;

export const RELEASE_VERSION = `mijnamsterdam-bff@${process.env.npm_package_version}`;

// Urls used in the BFF api
// Microservices (Tussen Api) base url
export const BFF_HOST = process.env.BFF_HOST || 'localhost';
export const BFF_PORT = process.env.BFF_PORT || 5000;
export const BFF_BASE_PATH = '/api/v1';

export interface DataRequestConfig extends AxiosRequestConfig {
  cacheTimeout?: number;
  cancelTimeout?: number;
  postponeFetch?: boolean;
  urls?: Record<string, string>;

  /**
   * The cacheKey is important if the automatically generated key doesn't suffice. For example if the url changes every request.
   * This can be the case if an IV encrypted parameter is added (erfpacht) to the url. If the url changes everytime the cache won't be hit.
   * In this case we can use a cacheKey. !!!!!Be sure this key is unique to the visitor.!!!!!! The for example the requestID parameter can be used.
   */
  cacheKey?: string;
  /**
   * If true the token passed via `authProfileAndToken` will be sent via { Authorization: `Bearer ${authProfileAndToken.token}` } with the request.
   * If this flag _and_ a custom Authorization header is configured for a request, the custom Header takes presedence.
   */
  passthroughOIDCToken?: boolean;
  debugRequestConfig?: boolean;

  combinePaginatedResults?: <T>(
    responseData: any,
    newRequest:
      | ApiSuccessResponse<T>
      | ApiErrorResponse<null>
      | ApiPostponeResponse
  ) => any;

  page?: number;
  maximumAmountOfPages?: number;
}

export const ONE_SECOND_MS = 1000;
export const ONE_MINUTE_MS = 60 * ONE_SECOND_MS;
export const ONE_HOUR_MS = 60 * ONE_MINUTE_MS;

export const OIDC_TOKEN_EXP = ONE_HOUR_MS * 24 * 3; // The TMA currently has a token expiration time of 3 hours

export const DEFAULT_API_CACHE_TTL_MS = (IS_OT ? 65 : 45) * ONE_SECOND_MS; // This means that every request that depends on the response of another will use the cached version of the response for a maximum of 45 seconds.
export const DEFAULT_CANCEL_TIMEOUT_MS = (IS_OT ? 60 : 20) * ONE_SECOND_MS; // This means a request will be aborted after 20 seconds without a response.

export const DEFAULT_REQUEST_CONFIG: DataRequestConfig = {
  cancelTimeout: DEFAULT_CANCEL_TIMEOUT_MS,
  method: 'get',
  cacheTimeout: DEFAULT_API_CACHE_TTL_MS,
  postponeFetch: false,
  passthroughOIDCToken: false,
  page: 1,
  maximumAmountOfPages: 0,
};

export type SourceApiKey =
  | 'WMO'
  | 'WPI_E_AANVRAGEN'
  | 'WPI_AANVRAGEN'
  | 'WPI_SPECIFICATIES'
  | 'WPI_STADSPAS'
  | 'BELASTINGEN'
  | 'BEZWAREN_LIST'
  | 'BEZWAREN_DOCUMENT'
  | 'BEZWAREN_DOCUMENTS'
  | 'BEZWAREN_STATUS'
  | 'CLEOPATRA'
  | 'VERGUNNINGEN'
  | 'CMS_CONTENT_GENERAL_INFO'
  | 'CMS_CONTENT_FOOTER'
  | 'CMS_MAINTENANCE_NOTIFICATIONS'
  | 'BRP'
  | 'ERFPACHT'
  | 'ERFPACHTv2'
  | 'BAG'
  | 'AFVAL'
  | 'TOERISTISCHE_VERHUUR_REGISTRATIES'
  | 'KVK'
  | 'SEARCH_CONFIG'
  | 'SUBSIDIE'
  | 'KREFIA'
  | 'SIA'
  | 'ENABLEU_2_SMILE'
  | 'LOOD_365'
  | 'LOOD_365_OAUTH';

type ApiDataRequestConfig = Record<SourceApiKey, DataRequestConfig>;

export const ApiConfig: ApiDataRequestConfig = {
  WMO: {
    url: `${process.env.BFF_WMO_API_BASE_URL}/wmoned/voorzieningen`,
    passthroughOIDCToken: true,
  },
  WPI_E_AANVRAGEN: {
    url: `${process.env.BFF_WPI_API_BASE_URL}/wpi/e-aanvragen`,
    passthroughOIDCToken: true,
  },
  WPI_AANVRAGEN: {
    url: `${process.env.BFF_WPI_API_BASE_URL}/wpi/uitkering-en-stadspas/aanvragen`,
    passthroughOIDCToken: true,
  },
  WPI_SPECIFICATIES: {
    url: `${process.env.BFF_WPI_API_BASE_URL}/wpi/uitkering/specificaties-en-jaaropgaven`,
    passthroughOIDCToken: true,
  },
  WPI_STADSPAS: {
    url: `${process.env.BFF_WPI_API_BASE_URL}/wpi/stadspas`,
    passthroughOIDCToken: true,
  },
  BEZWAREN_LIST: {
    url: `${process.env.BFF_BEZWAREN_API}/zgw/v1/zaken/_zoek`,
    method: 'POST',
    postponeFetch: !FeatureToggle.bezwarenActive,
  },
  BEZWAREN_DOCUMENT: {
    url: `${process.env.BFF_BEZWAREN_API}/zgw/v1/enkelvoudiginformatieobjecten/:id/download`,
    postponeFetch: !FeatureToggle.bezwarenActive,
  },
  BEZWAREN_DOCUMENTS: {
    url: `${process.env.BFF_BEZWAREN_API}/zgw/v1/enkelvoudiginformatieobjecten`,
    postponeFetch: !FeatureToggle.bezwarenActive,
  },
  BEZWAREN_STATUS: {
    url: `${process.env.BFF_BEZWAREN_API}/zgw/v1/statussen`,
    postponeFetch: !FeatureToggle.bezwarenActive,
  },
  BELASTINGEN: {
    url: `${process.env.BFF_BELASTINGEN_ENDPOINT}`,
    postponeFetch: !FeatureToggle.belastingApiActive,
  },
  CLEOPATRA: {
    url: `${process.env.BFF_CLEOPATRA_API_ENDPOINT}`,
    postponeFetch: !FeatureToggle.cleopatraApiActive,
    method: 'POST',
    httpsAgent: new https.Agent({
      cert: getCert('BFF_SERVER_CLIENT_CERT'),
      key: getCert('BFF_SERVER_CLIENT_KEY'),
    }),
  },
  SIA: {
    url: `${process.env.BFF_SIA_BASE_URL}/private/signals/`,
    postponeFetch: !FeatureToggle.siaApiActive,
  },
  VERGUNNINGEN: {
    url: `${process.env.BFF_VERGUNNINGEN_API_BASE_URL}/decosjoin/getvergunningen`,
    postponeFetch: !FeatureToggle.vergunningenActive,
    passthroughOIDCToken: true,
  },
  CMS_CONTENT_GENERAL_INFO: {
    cacheTimeout: 4 * ONE_HOUR_MS,
    urls: {
      private:
        'https://www.amsterdam.nl/mijn-content/artikelen/ziet-amsterdam/?AppIdt=app-data',
      'private-attributes':
        'https://www.amsterdam.nl/mijn-content/artikelen/ziet-amsterdam/?AppIdt=app-data',
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
  BRP: {
    url: `${process.env.BFF_MKS_API_BASE_URL}/brp/brp`,
    passthroughOIDCToken: true,
  },
  ERFPACHT: {
    url: `${process.env.BFF_MIJN_ERFPACHT_API_URL}`,
  },
  BAG: {
    url: `https://api.data.amsterdam.nl/atlas/search/adres/`,
  },
  ERFPACHTv2: {
    url: process.env.BFF_ERFPACHT_API_URL,
    passthroughOIDCToken: true,
    httpsAgent: new https.Agent({
      ca: IS_TAP ? getCert(process.env.BFF_SERVER_CLIENT_CERT) : [],
    }),
    postponeFetch:
      !FeatureToggle.erfpachtV2EndpointActive ||
      !process.env.BFF_ERFPACHT_API_URL_ONT,
    headers: {
      'X-HERA-REQUESTORIGIN': 'MijnAmsterdam',
    },
  },
  AFVAL: {
    url: `https://api.data.amsterdam.nl/v1/afvalwijzer/afvalwijzer/`,
    headers: { 'X-Api-Key': process.env.BFF_DATA_AMSTERDAM_API_KEY },
  },
  KVK: {
    url: `${process.env.BFF_MKS_API_BASE_URL}/brp/hr`,
    passthroughOIDCToken: true,
  },
  TOERISTISCHE_VERHUUR_REGISTRATIES: {
    url: `${process.env.BFF_LVV_API_URL}`,
    headers: {
      'X-Api-Key': process.env.BFF_LVV_API_KEY + '',
      'Content-Type': 'application/json',
    },
    postponeFetch: !FeatureToggle.toeristischeVerhuurActive,
  },
  KREFIA: {
    url: `${process.env.BFF_KREFIA_API_BASE_URL}/krefia/all`,
    postponeFetch: !FeatureToggle.krefiaActive,
    passthroughOIDCToken: true,
  },
  SUBSIDIE: {
    url: `${process.env.BFF_SISA_API_ENDPOINT}`,
    postponeFetch: !FeatureToggle.subsidieActive,
  },
  SEARCH_CONFIG: {
    url: 'https://raw.githubusercontent.com/Amsterdam/mijn-amsterdam-frontend/main/src/client/components/Search/search-config.json',
    httpsAgent: new https.Agent({
      rejectUnauthorized: false, // NOTE: Risk is assessed and tolerable for now because this concerns a request to a well known actor (GH), no sensitive data is involved and no JS code is evaluated.
    }),
  },
  ENABLEU_2_SMILE: {
    url: `${process.env.BFF_ENABLEU_2_SMILE_ENDPOINT}`,
    method: 'POST',
  },
  LOOD_365: {
    url: `${process.env.BFF_LOOD_API_URL}`,
    method: 'POST',
    postponeFetch: !FeatureToggle.bodemActive,
  },
  LOOD_365_OAUTH: {
    url: `${process.env.BFF_LOOD_OAUTH}/${process.env.BFF_LOOD_TENANT}/oauth2/v2.0/token`,
    method: 'POST',
    postponeFetch: !FeatureToggle.bodemActive,
    cacheTimeout: 59 * ONE_MINUTE_MS,
  },
};

type ApiUrlObject = string | Partial<Record<ProfileType, string>>;
type ApiUrlEntry = [apiKey: SourceApiKey, apiUrl: ApiUrlObject];

export const ApiUrls = Object.entries(ApiConfig).reduce(
  (acc, [apiName, { url, urls }]) => {
    if (urls) {
      return Object.assign(acc, { [apiName]: urls });
    }
    return Object.assign(acc, { [apiName]: url || '' });
  },
  {} as Record<SourceApiKey, ApiUrlObject>
);

export type ApiUrlEntries = ApiUrlEntry[];
export const apiUrlEntries = Object.entries(ApiUrls) as ApiUrlEntries;

export function getApiConfig(name: SourceApiKey, config?: DataRequestConfig) {
  return Object.assign({}, ApiConfig[name] || {}, config || {});
}

export const RelayPathsAllowed = {
  VERGUNNINGEN_LIST_DOCUMENTS: '/decosjoin/listdocuments/:key',
  VERGUNNINGEN_DOCUMENT_DOWNLOAD: '/decosjoin/document/:key',
  WPI_DOCUMENT_DOWNLOAD: '/wpi/document',
  WPI_STADSPAS_TRANSACTIES: '/wpi/stadspas/transacties/:id',
  BRP_BEWONERS: '/brp/aantal_bewoners',
  LOOD_DOCUMENT_DOWNLOAD: '/services/lood/:id/attachments',
  BEZWAREN_DOCUMENT: '/services/bezwaren/:id/attachments',
};

export const AUTH_BASE = '/api/v1/auth';
export const AUTH_BASE_DIGID = `${AUTH_BASE}/digid`;
export const AUTH_BASE_EHERKENNING = `${AUTH_BASE}/eherkenning`;
export const AUTH_BASE_YIVI = `${AUTH_BASE}/yivi`;

export const AUTH_BASE_SSO = `${AUTH_BASE}/sso`;
export const AUTH_BASE_SSO_DIGID = `${AUTH_BASE}/digid/sso`;
export const AUTH_BASE_SSO_EHERKENNING = `${AUTH_BASE}/eherkenning/sso`;

export const AUTH_LOGIN = `${process.env.BFF_OIDC_LOGIN}`;
export const AUTH_LOGOUT = `${process.env.BFF_OIDC_LOGOUT}`;
export const AUTH_CALLBACK = `${process.env.BFF_OIDC_CALLBACK}`;

export const BFF_OIDC_BASE_URL = `${
  process.env.BFF_OIDC_BASE_URL ?? 'https://mijn-bff.amsterdam.nl'
}`;

export const BFF_OIDC_ISSUER_BASE_URL = `${process.env.BFF_OIDC_ISSUER_BASE_URL}`;

export const BffEndpoints = {
  ROOT: '/',
  API_RELAY: '/relay',
  SERVICES_ALL: '/services/all',
  SERVICES_STREAM: '/services/stream',
  MAP_DATASETS: '/map/datasets/:datasetId?/:id?',
  SEARCH_CONFIG: '/services/search-config',

  // Signalen endpoints
  SIA_ATTACHMENTS: '/services/signals/:id/attachments',
  SIA_HISTORY: '/services/signals/:id/history',
  SIA_LIST: '/services/signals/:status/:page',

  // Bezwaren
  BEZWAREN_ATTACHMENTS: '/services/bezwaren/:id/attachments',

  // start: OIDC config
  AUTH_BASE_DIGID,
  AUTH_BASE_EHERKENNING,
  AUTH_BASE_SSO,
  AUTH_BASE_SSO_DIGID,
  AUTH_BASE_SSO_EHERKENNING,
  AUTH_BASE_YIVI,

  // Digid
  AUTH_CALLBACK_DIGID: BFF_OIDC_BASE_URL + AUTH_BASE_DIGID + AUTH_CALLBACK,
  AUTH_LOGIN_DIGID: AUTH_BASE_DIGID + AUTH_LOGIN,
  AUTH_LOGIN_DIGID_LANDING: AUTH_BASE_DIGID + AUTH_LOGIN + '/landing',
  AUTH_LOGOUT_DIGID: AUTH_BASE_DIGID + AUTH_LOGOUT,

  // EHerkenning
  AUTH_CALLBACK_EHERKENNING:
    BFF_OIDC_BASE_URL + AUTH_BASE_EHERKENNING + AUTH_CALLBACK,
  AUTH_LOGIN_EHERKENNING: AUTH_BASE_EHERKENNING + AUTH_LOGIN,
  AUTH_LOGIN_EHERKENNING_LANDING:
    AUTH_BASE_EHERKENNING + AUTH_LOGIN + '/landing',
  AUTH_LOGOUT_EHERKENNING: AUTH_BASE_EHERKENNING + AUTH_LOGOUT,

  // YIVI
  AUTH_CALLBACK_YIVI: BFF_OIDC_BASE_URL + AUTH_BASE_YIVI + AUTH_CALLBACK,
  AUTH_LOGIN_YIVI: AUTH_BASE_YIVI + AUTH_LOGIN,
  AUTH_LOGIN_YIVI_LANDING: AUTH_BASE_YIVI + AUTH_LOGIN + '/landing',
  AUTH_LOGOUT_YIVI: AUTH_BASE_YIVI + AUTH_LOGOUT,

  // Application specific urls
  AUTH_CHECK: `${AUTH_BASE}/check`,
  AUTH_CHECK_EHERKENNING: `${AUTH_BASE_EHERKENNING}/check`,
  AUTH_CHECK_DIGID: `${AUTH_BASE_DIGID}/check`,
  AUTH_CHECK_YIVI: `${AUTH_BASE_YIVI}/check`,
  AUTH_TOKEN_DATA: `${AUTH_BASE}/token-data`,
  AUTH_TOKEN_DATA_EHERKENNING: `${AUTH_BASE_EHERKENNING}/token-data`,
  AUTH_TOKEN_DATA_DIGID: `${AUTH_BASE_DIGID}/token-data`,
  AUTH_TOKEN_DATA_YIVI: `${AUTH_BASE_YIVI}/token-data`,
  AUTH_LOGOUT: `${AUTH_BASE}/logout`,
  // end: OIDC config

  CMS_CONTENT: '/services/cms',
  CMS_MAINTENANCE_NOTIFICATIONS: '/services/cms/maintenance-notifications',
  CACHE_OVERVIEW: '/status/cache',
  LOGIN_STATS: '/status/logins/:authMethod?',
  LOGIN_RAW: '/status/logins/table',
  SESSION_BLACKLIST_RAW: '/status/session-blacklist/table',
  STATUS_HEALTH: '/status/health',
  STATUS_HEALTH2: '/bff/status/health',
  TEST_ACCOUNTS_OVERVIEW: '/status/user-data-overview',
  LOODMETING_ATTACHMENTS: '/services/lood/:id/attachments',
};

export const PUBLIC_BFF_ENDPOINTS: string[] = [
  BffEndpoints.STATUS_HEALTH,
  BffEndpoints.STATUS_HEALTH2,
  BffEndpoints.CMS_CONTENT,
  BffEndpoints.CMS_MAINTENANCE_NOTIFICATIONS,
  BffEndpoints.CACHE_OVERVIEW,
];

export const OIDC_SESSION_MAX_AGE_SECONDS = 15 * 60; // 15 minutes
export const OIDC_SESSION_COOKIE_NAME = '__MA-appSession';
export const OIDC_COOKIE_ENCRYPTION_KEY = `${process.env.BFF_GENERAL_ENCRYPTION_KEY}`;
export const OIDC_ID_TOKEN_EXP = '1 hours'; // Arbitrary, MA wants a token to be valid for a maximum of 1 hours.
export const OIDC_IS_TOKEN_EXP_VERIFICATION_ENABLED = true;

const oidcConfigBase: ConfigParams = {
  authRequired: false,
  auth0Logout: false,
  idpLogout: true,
  // Cookie encryption
  secret: OIDC_COOKIE_ENCRYPTION_KEY,
  // Client secret
  clientSecret: process.env.BFF_OIDC_SECRET,
  baseURL: BFF_OIDC_BASE_URL,
  issuerBaseURL: BFF_OIDC_ISSUER_BASE_URL,
  attemptSilentLogin: false,
  authorizationParams: { prompt: 'login', response_type: 'code' },
  clockTolerance: 120, // 2 minutes
  session: {
    rolling: true,
    rollingDuration: OIDC_SESSION_MAX_AGE_SECONDS,
    name: OIDC_SESSION_COOKIE_NAME,
  },
  routes: {
    login: false,
    logout: false,
    callback: false,
  },
  afterCallback: (req, res, session) => {
    const claims = jose.decodeJwt(session.id_token) as {
      nonce: string;
    };

    const authVerification = JSON.parse(
      req.cookies.auth_verification.split('.')[0]
    );

    if (claims.nonce !== authVerification.nonce) {
      throw new Error(`Nonce invalid`);
    }

    if (req.query.state !== authVerification.state) {
      throw new Error(`State invalid`);
    }

    return session;
  },
};

export const oidcConfigDigid: ConfigParams = {
  ...oidcConfigBase,
  clientID: process.env.BFF_OIDC_CLIENT_ID_DIGID,
};

export const oidcConfigEherkenning: ConfigParams = {
  ...oidcConfigBase,
  clientID: process.env.BFF_OIDC_CLIENT_ID_EHERKENNING,
};

export const oidcConfigYivi: ConfigParams = {
  ...oidcConfigBase,
  clientID: process.env.BFF_OIDC_CLIENT_ID_YIVI,
  authorizationParams: { prompt: 'login', max_age: 0, response_type: 'code' },
};

// Op 1.13 met ketenmachtiging
export const EH_ATTR_INTERMEDIATE_PRIMARY_ID =
  'urn:etoegang:core:LegalSubjectID';
export const EH_ATTR_INTERMEDIATE_SECONDARY_ID =
  'urn:etoegang:1.9:IntermediateEntityID:KvKnr';

// 1.13 inlog zonder ketenmachtiging:
export const EH_ATTR_PRIMARY_ID = 'urn:etoegang:core:LegalSubjectID';

// < 1.13 id
export const EH_ATTR_PRIMARY_ID_LEGACY =
  'urn:etoegang:1.9:EntityConcernedID:KvKnr';

export const DIGID_ATTR_PRIMARY = 'sub';
export const YIVI_ATTR_PRIMARY = 'sub';

export const OIDC_TOKEN_ID_ATTRIBUTE = {
  eherkenning: (tokenData: TokenData) => {
    if (FeatureToggle.ehKetenmachtigingActive) {
      if (
        EH_ATTR_INTERMEDIATE_PRIMARY_ID in tokenData &&
        EH_ATTR_INTERMEDIATE_SECONDARY_ID in tokenData
      ) {
        return EH_ATTR_INTERMEDIATE_PRIMARY_ID;
      }

      if (EH_ATTR_PRIMARY_ID in tokenData) {
        return EH_ATTR_PRIMARY_ID;
      }
    }

    // Attr Prior to 1.13
    return EH_ATTR_PRIMARY_ID_LEGACY;
  },
  digid: () => DIGID_ATTR_PRIMARY,
  yivi: () => YIVI_ATTR_PRIMARY,
};

export type TokenIdAttribute =
  | typeof DIGID_ATTR_PRIMARY
  | typeof EH_ATTR_PRIMARY_ID
  | typeof YIVI_ATTR_PRIMARY;

export const TOKEN_ID_ATTRIBUTE: Record<AuthMethod, TokenIdAttribute> = {
  eherkenning: EH_ATTR_PRIMARY_ID,
  digid: DIGID_ATTR_PRIMARY,
  yivi: YIVI_ATTR_PRIMARY,
};

export const profileTypeByAuthMethod: Record<AuthMethod, ProfileType[]> = {
  digid: ['private'],
  eherkenning: ['commercial'],
  yivi: ['private-attributes'],
};

export const OIDC_TOKEN_AUD_ATTRIBUTE_VALUE = {
  get eherkenning() {
    return oidcConfigEherkenning.clientID;
  },
  get digid() {
    return oidcConfigDigid.clientID;
  },
  get yivi() {
    return oidcConfigYivi.clientID;
  },
};

export const corsOptions: CorsOptions = {
  origin: process.env.MA_FRONTEND_URL,
  credentials: true,
};

export const DEV_JWK_PUBLIC: any = {
  kty: 'RSA',
  e: 'AQAB',
  use: 'sig',
  kid: '8YN3pNDUUyho-tQB25afq8DKCrxt2V-bS6W9gRk0cgk',
  alg: 'RS256',
  n: '0CXtOrsyIGkhhJ_sHzGbyK9U6sug4HdjdSNaq-FVbFFO_OeAaS8NvzM7DJXkZvmvZ7HNIPdlRk0-TCELmbOGK1RlddQZA_iic9DePydxloNJIWmUVI5GK1T84PxhjnMfBAD3SWPdTZ0zG1IubAjUJT4nwl0uVdzp0-LixbmKPQU87dqA1jt7ZuC73M55oZAyi1e2fzvgdxWyM7-NyvkZqwG2eGoDQ3SNb0rArlHTgdsLf1YsGPxn1wN3bSjhrq6af4fCnB5UVRb-r3g4NN_VJxBOc2xGDDoOgaPW9XW-BhSefc2hqRjTwtjaGiZFLdEuZdcq_mUB-AHc0YYD3_4VXw',
};

export const DEV_JWK_PRIVATE: any = {
  p: '8b-T1GJux6AGYWz1FLaXdTVkXsVQ2_oNFMs-gJBRXMpDT_1g3LlrjtEd_Y2-HuaDbEAoS8ccGlC9IIjbYcunQBqD1whl3tiGFswzDk2DUaJjXZnPAjYHWUHa1cl3tkDEo9uzWJ0h201QH7bG0Ls2Jl1IPOtSzPcNHBO0iWg_WH0',
  kty: 'RSA',
  q: '3GtC1fHI297LqVHGN9btnf5nt7pT_TVWltYxio3DJvrNsAHiAHmwr87FNheSLcaBgUgqGYcGnQrvnW4Ly_c5Sb_xEMwigp5TcpjPYjHZGv5ML5Rf8yEZJAjiFJ6RuUWRHOZ0qRJSnFuVDdj1xfH4dUkZGfJ2vl9DMm6mRhGk6As',
  d: 'mYegF_YD30wsYPrk241n7vsEk7tnCqqFPd25_5XRwHeo33qSiQMgDKvpHjthoWMCMmY_e9V_af-Ht_eX6uM0T7mMrQCpAvjeOrcRd1vMuMxVoMOTmVrn_wZNEFaYTs4zTmy3-fYjQiB1le1kOGO6t03FXeQFTWgJQTTVOCrHAIILrOSj0HqtQomzsw9J7MLXd2eRuKDZydRSbJEhPg3NUzHeJjbuKJg6aVlj-gSaQ1s79vteIjm3pwItAkEsSP5R4LCrlxPPdIW4ghemGwi2jIfJhxzW7v3Q0sI6MYZ10FwkiUh9W1IUbUADQIT7Jf7EZ1yt_u8s7c9dvJ-NotHi4Q',
  e: 'AQAB',
  use: 'sig',
  kid: '8YN3pNDUUyho-tQB25afq8DKCrxt2V-bS6W9gRk0cgk',
  qi: 'fAfkX1oqy_U-vU_eaCgEHYvZZxS7r1pSZpqipFitJdHayqlZEVwddmQZZ30IX3tHk3NRfjm6zy6FCXrVXVleAOkPyJpPXVsK_GiUufh28u5hPncs3KaFU0tTQ373Vd7IgOF7IhshyImR6UAXQiLSPLaEFQdte5DRL4kMkgwYHF8',
  dp: 'EyIpjh64S95zgtR_1ULaW_F83y9YxgBVdrbbXIuPlPuBNlyEhRO72pLcf8vvJzzxW-j8B3tb0w1e2qtaSbQ3qZAvrR5CCdAzVKyWweQKp7Rljuv0gWVLUZovusn2Spt3tMxXtoTBQD0vQUNTGwQmNgUeCYxKgmRvSjCZEmMI2HU',
  alg: 'RS256',
  dq: '2xIAK4NTjrOw12hfCcCkChOAIisertsEZIYeVwbunx9Gr1gvtyk7YoCvoUNsFfLlZAjFTvnUqODlpiJptx7P4WzTu04oPon9hjg6Ze4FSb7VGbTuaEbNJfNuP_AaBXoO8BpceG2tjZm4Wzr3ivUja-5q9E73ld44ezdeKuX-cGE',
  n: '0CXtOrsyIGkhhJ_sHzGbyK9U6sug4HdjdSNaq-FVbFFO_OeAaS8NvzM7DJXkZvmvZ7HNIPdlRk0-TCELmbOGK1RlddQZA_iic9DePydxloNJIWmUVI5GK1T84PxhjnMfBAD3SWPdTZ0zG1IubAjUJT4nwl0uVdzp0-LixbmKPQU87dqA1jt7ZuC73M55oZAyi1e2fzvgdxWyM7-NyvkZqwG2eGoDQ3SNb0rArlHTgdsLf1YsGPxn1wN3bSjhrq6af4fCnB5UVRb-r3g4NN_VJxBOc2xGDDoOgaPW9XW-BhSefc2hqRjTwtjaGiZFLdEuZdcq_mUB-AHc0YYD3_4VXw',
};

export const DEV_JWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

export const securityHeaders = {
  'Permissions-Policy':
    'geolocation=(),midi=(),sync-xhr=(),microphone=(),camera=(),magnetometer=(),gyroscope=(),fullscreen=(self),payment=()',
  'Referrer-Policy': 'same-origin',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-Frame-Options': 'Deny',
  'X-Content-Type-Options': 'nosniff',
  'Content-Security-Policy': `
    default-src 'none';
    connect-src 'none';
    script-src 'none';
    img-src 'none';
    frame-src 'none';
    style-src 'none';
    font-src 'none';
    manifest-src 'none';
    object-src 'none';
    frame-ancestors 'none';
    require-trusted-types-for 'script'
  `.replace(/\n/g, ''),
};

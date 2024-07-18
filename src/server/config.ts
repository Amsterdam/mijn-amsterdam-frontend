import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { ConfigParams } from 'express-openid-connect';
import https from 'https';
import * as jose from 'jose';
import { FeatureToggle } from '../universal/config/feature-toggles';
import { IS_DEVELOPMENT, IS_OT, IS_TAP } from '../universal/config/env';
import { jsonCopy } from '../universal/helpers/utils';
import { TokenData } from './helpers/app';
import fs from 'fs';

export function getCertificateSync(envVarName: string | undefined) {
  const path = envVarName && process.env[envVarName];
  if (path) {
    try {
      const fileContents = fs.readFileSync(path).toString();
      return fileContents;
    } catch (error) {
      console.error(error);
    }
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

export function getCert(envVarName: string) {
  return IS_DEVELOPMENT
    ? getCertificateSync(envVarName)
    : decodeBase64EncodedCertificateFromEnv(envVarName);
}

export const IS_DEBUG = process.env.DEBUG === '1';

export const BFF_REQUEST_CACHE_ENABLED =
  typeof process.env.BFF_REQUEST_CACHE_ENABLED !== 'undefined'
    ? String(process.env.BFF_REQUEST_CACHE_ENABLED).toLowerCase() === 'true'
    : true;

export const RELEASE_VERSION = `mijnamsterdam-bff@${process.env.MA_RELEASE_VERSION_TAG ?? 'notset'}`;

// Urls used in the BFF api
// Microservices (Tussen Api) base url
export const BFF_HOST = process.env.BFF_HOST || 'localhost';
export const BFF_PORT = process.env.BFF_PORT || 5000;
export const BFF_BASE_PATH = '/api/v1';
export const BFF_BASE_PATH_PRIVATE = '/private/api/v1';
export const BFF_API_BASE_URL = process.env.BFF_API_BASE_URL ?? BFF_BASE_PATH;

export interface DataRequestConfig extends AxiosRequestConfig {
  cacheTimeout?: number;
  cancelTimeout?: number;
  postponeFetch?: boolean;
  urls?: Record<string, string>;

  // Construct an url that will be assigned to the url key in the local requestConfig.
  // Example: formatUrl: (requestConfig) => requestConfig.url + '/some/additional/path/segments/,
  formatUrl?: (requestConfig: DataRequestConfig) => string;

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

  /**
   * If you want to combine the responseData of multiple requests into on you can use this function.
   * It will fire a next request right after the response succeeded, you can merge the response data.
   * Mind you, the cancelTimeout might have to be increased because you'll probably make multiple requests pretending as one.
   */
  request?: <T>(requestConfig: DataRequestConfig) => Promise<AxiosResponse<T>>;
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
};

export type SourceApiKey =
  | 'AFIS'
  | 'AFVAL'
  | 'AMSAPP'
  | 'BAG'
  | 'BELASTINGEN'
  | 'BEZWAREN_DOCUMENT'
  | 'BEZWAREN_DOCUMENTS'
  | 'BEZWAREN_LIST'
  | 'BEZWAREN_STATUS'
  | 'BRP'
  | 'CLEOPATRA'
  | 'CMS_CONTENT_FOOTER'
  | 'CMS_CONTENT_GENERAL_INFO'
  | 'CMS_MAINTENANCE_NOTIFICATIONS'
  | 'DECOS_API'
  | 'ENABLEU_2_SMILE'
  | 'ERFPACHT'
  | 'ERFPACHTv2'
  | 'GPASS'
  | 'KREFIA'
  | 'KVK'
  | 'LOOD_365'
  | 'LOOD_365_OAUTH'
  | 'POWERBROWSER'
  | 'SEARCH_CONFIG'
  | 'SUBSIDIE'
  | 'SVWI'
  | 'TOERISTISCHE_VERHUUR_REGISTRATIES'
  | 'VERGUNNINGEN'
  | 'WPI_AANVRAGEN'
  | 'WPI_E_AANVRAGEN'
  | 'WPI_SPECIFICATIES'
  | 'ZORGNED_AV'
  | 'ZORGNED_JZD';

type ApiDataRequestConfig = Record<SourceApiKey, DataRequestConfig>;

export const ApiConfig: ApiDataRequestConfig = {
  AFIS: {
    method: 'post',
    url: `${process.env.BFF_AFIS_API_BASE_URL}`,
    postponeFetch: !FeatureToggle.afisActive,
    headers: {
      apiKey: process.env.BFF_ENABLEU_AFIS_API_KEY,
    },
  },
  ZORGNED_JZD: {
    method: 'post',
    url: `${process.env.BFF_ZORGNED_API_BASE_URL}`,
    headers: {
      Token: process.env.BFF_ZORGNED_API_TOKEN,
      'Content-type': 'application/json; charset=utf-8',
      'X-Mams-Api-User': 'JZD',
    },
    httpsAgent: new https.Agent({
      cert: getCert('BFF_SERVER_CLIENT_CERT'),
      key: getCert('BFF_SERVER_CLIENT_KEY'),
    }),
  },
  ZORGNED_AV: {
    method: 'post',
    url: `${process.env.BFF_ZORGNED_API_BASE_URL}`,
    headers: {
      Token: process.env.BFF_ZORGNED_API_TOKEN,
      'Content-type': 'application/json; charset=utf-8',
      'X-Mams-Api-User': 'AV',
    },
    httpsAgent: new https.Agent({
      cert: getCert('BFF_ZORGNED_AV_CERT'),
      key: getCert('BFF_ZORGNED_AV_KEY'),
    }),
  },
  GPASS: {
    url: `${process.env.BFF_GPASS_API_BASE_URL}`,
  },
  WPI_E_AANVRAGEN: {
    url: `${process.env.BFF_WPI_API_BASE_URL}/wpi/e-aanvragen`,
    passthroughOIDCToken: true,
  },
  WPI_AANVRAGEN: {
    url: `${process.env.BFF_WPI_API_BASE_URL}/wpi/uitkering/aanvragen`,
    passthroughOIDCToken: true,
  },
  WPI_SPECIFICATIES: {
    url: `${process.env.BFF_WPI_API_BASE_URL}/wpi/uitkering/specificaties-en-jaaropgaven`,
    passthroughOIDCToken: true,
  },
  SVWI: {
    url: `${process.env.BFF_SVWI_API_BASE_URL}/mijnamsterdam/v1/autorisatie/tegel`,
    passthroughOIDCToken: true,
    postponeFetch: !FeatureToggle.svwiLinkActive,
    headers: {
      'Ocp-Apim-Subscription-Key': process.env.BFF_SVWI_API_KEY,
    },
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
  DECOS_API: {
    url: `${process.env.BFF_DECOS_API_BASE_URL}`,
    postponeFetch: !FeatureToggle.decosServiceActive,
    headers: {
      Accept: 'application/itemdata',
      Authorization: `Basic ${Buffer.from(`${process.env.BFF_DECOS_API_USERNAME}:${process.env.BFF_DECOS_API_PASSWORD}`).toString('base64')}`,
      'Content-type': 'application/json; charset=utf-8',
    },
  },
  VERGUNNINGEN: {
    url: `${process.env.BFF_VERGUNNINGEN_API_BASE_URL}/decosjoin/getvergunningen`,
    postponeFetch: !FeatureToggle.vergunningenActive,
    passthroughOIDCToken: true,
  },
  POWERBROWSER: {
    method: 'POST',
    url: `${process.env.BFF_POWERBROWSER_API_URL}`,
    postponeFetch: !FeatureToggle.powerbrowserActive,
    headers: {
      apiKey: process.env.BFF_POWERBROWSER_API_KEY,
    },
  },
  CMS_CONTENT_GENERAL_INFO: {
    cacheTimeout: 4 * ONE_HOUR_MS,
    urls: {
      private: `${process.env.BFF_CMS_BASE_URL}/mijn-content/artikelen/ziet-amsterdam/?AppIdt=app-data`,
      'private-attributes': `${process.env.BFF_CMS_BASE_URL}/mijn-content/artikelen/ziet-amsterdam/?AppIdt=app-data`,
      commercial: `${process.env.BFF_CMS_BASE_URL}/mijn-content/artikelen/overzicht-producten-ondernemers/?AppIdt=app-data`,
    },
  },
  CMS_CONTENT_FOOTER: {
    url: `${process.env.BFF_CMS_BASE_URL}/algemene_onderdelen/overige/footer/?AppIdt=app-data`,
    cacheTimeout: 4 * ONE_HOUR_MS,
    postponeFetch: !FeatureToggle.cmsFooterActive,
  },
  CMS_MAINTENANCE_NOTIFICATIONS: {
    url: `${process.env.BFF_CMS_BASE_URL}/storingsmeldingen/alle-meldingen-mijn-amsterdam?new_json=true&reload=true`,
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
      ca: IS_TAP ? getCert('BFF_SERVER_CLIENT_CERT') : [],
    }),
    postponeFetch:
      !FeatureToggle.erfpachtV2EndpointActive ||
      !process.env.BFF_ERFPACHT_API_URL,
    headers: {
      'X-HERA-REQUESTORIGIN': 'MijnAmsterdam',
      apiKey: process.env.BFF_ENABLEU_ERFPACHT_API_KEY,
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
      rejectUnauthorized: false, // NOTE: Risk is assessed and tolerable for now because this concerns a request to a trusted source (GH), no sensitive data is involved and no JS code is evaluated.
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
  AMSAPP: {
    url: `${process.env.BFF_AMSAPP_ADMINISTRATIENUMMER_DELIVERY_ENDPOINT}`,
    method: 'POST',
    headers: {
      'X-Api-Key': process.env.BFF_AMSAPP_API_KEY,
    },
  },
};

type ApiUrlObject = string | Partial<Record<ProfileType, string>>;
type ApiUrlEntry = [apiKey: SourceApiKey, apiUrl: ApiUrlObject];

export type ApiUrlEntries = ApiUrlEntry[];

export function getApiConfig(
  name: SourceApiKey,
  config: DataRequestConfig = {}
): DataRequestConfig {
  let apiConfig = ApiConfig[name];

  // Take of the agent because it cannot be jsonCopied.
  const agent = apiConfig.httpsAgent;
  delete apiConfig.httpsAgent;

  // Copy the config to prevent assigning privacy/identity related information across requests
  let apiConfigCopy = jsonCopy(apiConfig);

  // copy the config and transfer the https agent instance.
  if (agent) {
    // re-assign the agent
    apiConfig.httpsAgent = agent;

    // also assign agent to copy
    apiConfigCopy.httpsAgent = agent;
  }

  let customUrl = '';

  if (typeof config.formatUrl === 'function') {
    customUrl = config.formatUrl(apiConfig);
  }

  return Object.assign(
    apiConfigCopy,
    config,
    customUrl ? { url: customUrl } : null
  );
}

export const AUTH_BASE = '/api/v1/auth';
export const AUTH_BASE_DIGID = `${AUTH_BASE}/digid`;
export const AUTH_BASE_EHERKENNING = `${AUTH_BASE}/eherkenning`;

export const AUTH_BASE_SSO = `${AUTH_BASE}/sso`;
export const AUTH_BASE_SSO_DIGID = `${AUTH_BASE}/digid/sso`;
export const AUTH_BASE_SSO_EHERKENNING = `${AUTH_BASE}/eherkenning/sso`;

export const AUTH_LOGIN = `${process.env.BFF_OIDC_LOGIN ?? '/login'}`;
export const AUTH_LOGOUT = `${process.env.BFF_OIDC_LOGOUT ?? '/logout'}`;
export const AUTH_CALLBACK = `${process.env.BFF_OIDC_CALLBACK ?? '/callback'}`;

export const BFF_OIDC_BASE_URL = `${
  process.env.BFF_OIDC_BASE_URL ?? 'https://mijn.amsterdam.nl'
}`;

export const BFF_OIDC_ISSUER_BASE_URL = `${process.env.BFF_OIDC_ISSUER_BASE_URL}`;

export const ExternalConsumerEndpoints = {
  // Publicly accessible
  public: {
    STADSPAS_AMSAPP_LOGIN: `${BFF_BASE_PATH}/services/amsapp/stadspas/login`,
    STADSPAS_ADMINISTRATIENUMMER: `${BFF_BASE_PATH}/services/amsapp/stadspas/administratienummer`,
  },
  // Privately accessible
  private: {
    STADSPAS_PASSEN: `${BFF_BASE_PATH_PRIVATE}/services/amsapp/stadspas/passen/:administratienummerEncrypted`,
  },
};

export const BffEndpoints = {
  ROOT: '/',
  SERVICES_ALL: '/services/all',
  SERVICES_TIPS: '/services/tips',
  SERVICES_STREAM: '/services/stream',
  MAP_DATASETS: '/map/datasets/:datasetId?/:id?',
  SEARCH_CONFIG: '/services/search-config',
  CMS_CONTENT: '/services/cms',
  FOOTER: '/services/footer',
  CMS_MAINTENANCE_NOTIFICATIONS: '/services/cms/maintenance-notifications',
  CACHE_OVERVIEW: '/admin/cache',
  LOGIN_STATS: '/admin/visitors/:authMethod?',
  LOGIN_RAW: '/admin/visitors/table',
  SESSION_BLACKLIST_RAW: '/admin/session-blacklist/table',
  STATUS_HEALTH: '/status/health',
  TEST_ACCOUNTS_OVERVIEW: '/admin/user-data-overview',

  TELEMETRY_PROXY: '/services/telemetry/v2/track',

  // Stadspas
  STADSPAS_TRANSACTIONS: '/services/stadspas/transactions/:transactionsKey?',

  // Vergunningen V2
  VERGUNNINGENv2_ZAKEN_SOURCE: '/services/vergunningen/v2/zaken/:id?',
  VERGUNNINGENv2_DETAIL: `/services/vergunningen/v2/:id`,
  VERGUNNINGENv2_DOCUMENT_DOWNLOAD:
    '/services/vergunningen/v2/documents/download/:id',

  // Vergunningen / Koppel api
  VERGUNNINGEN_DOCUMENT_DOWNLOAD:
    '/services/vergunningen/documents/download/:id',
  VERGUNNINGEN_LIST_DOCUMENTS: '/services/vergunningen/documents/list/:id',

  // MKS bewoners
  MKS_AANTAL_BEWONERS: '/service/mks/aantal-bewoners/:addressKeyEncrypted',

  // WPI Document download
  WPI_DOCUMENT_DOWNLOAD: '/services/wpi/document/:id',

  // WMO / Zorgned
  WMO_DOCUMENT_DOWNLOAD: `/services/wmo/document/:id`,

  // AV / Zorgned
  HLI_DOCUMENT_DOWNLOAD: `/services/v1/stadspas-en-andere-regelingen/document/:id`,

  // Legacy login links (still used in other portals)
  LEGACY_LOGIN_API_LOGIN: '/api/login',
  LEGACY_LOGIN_API1_LOGIN: '/api1/login',

  // Bezwaren
  BEZWAREN_DOCUMENT_DOWNLOAD: '/services/bezwaren/document/:id',
  BEZWAREN_DETAIL: '/services/bezwaren/:id',

  // ErfpachtV2
  ERFPACHTv2_DOSSIER_DETAILS:
    '/services/erfpachtv2/dossier/:dossierNummerUrlParam?',

  // Toeristische verhuur / Bed & Breakfast
  TOERISTISCHE_VERHUUR_BB_DOCUMENT_DOWNLOAD:
    '/services/toeristische-verhuur/bb/document/:id',

  // start: OIDC config
  AUTH_BASE_DIGID,
  AUTH_BASE_EHERKENNING,
  AUTH_BASE_SSO,
  AUTH_BASE_SSO_DIGID,
  AUTH_BASE_SSO_EHERKENNING,

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
  AUTH_LOGOUT_EHERKENNING_LOCAL:
    AUTH_BASE_EHERKENNING + `${AUTH_LOGOUT}/local-session`,

  // Application specific urls
  AUTH_CHECK: `${AUTH_BASE}/check`,
  AUTH_CHECK_EHERKENNING: `${AUTH_BASE_EHERKENNING}/check`,
  AUTH_CHECK_DIGID: `${AUTH_BASE_DIGID}/check`,
  AUTH_TOKEN_DATA: `${AUTH_BASE}/token-data`,
  AUTH_TOKEN_DATA_EHERKENNING: `${AUTH_BASE_EHERKENNING}/token-data`,
  AUTH_TOKEN_DATA_DIGID: `${AUTH_BASE_DIGID}/token-data`,
  AUTH_LOGOUT: `${AUTH_BASE}/logout`,
  // end: OIDC config
  // Bodem / loodmetingen
  LOODMETING_DOCUMENT_DOWNLOAD: '/services/lood/document/:id',
};

export const PUBLIC_BFF_ENDPOINTS: string[] = [
  BffEndpoints.STATUS_HEALTH,
  BffEndpoints.CMS_CONTENT,
  BffEndpoints.CMS_MAINTENANCE_NOTIFICATIONS,
  BffEndpoints.FOOTER,
  BffEndpoints.TELEMETRY_PROXY,
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
};

export type TokenIdAttribute =
  | typeof DIGID_ATTR_PRIMARY
  | typeof EH_ATTR_PRIMARY_ID;

export const TOKEN_ID_ATTRIBUTE: Record<AuthMethod, TokenIdAttribute> = {
  eherkenning: EH_ATTR_PRIMARY_ID,
  digid: DIGID_ATTR_PRIMARY,
};

export const profileTypeByAuthMethod: Record<AuthMethod, ProfileType[]> = {
  digid: ['private'],
  eherkenning: ['commercial'],
};

export const OIDC_TOKEN_AUD_ATTRIBUTE_VALUE = {
  get eherkenning() {
    return oidcConfigEherkenning.clientID;
  },
  get digid() {
    return oidcConfigDigid.clientID;
  },
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

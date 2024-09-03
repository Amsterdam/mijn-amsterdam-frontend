import { AxiosRequestConfig, AxiosResponse } from 'axios';
import https from 'https';
import { IS_OT, IS_TAP } from '../universal/config/env';
import { FeatureToggle } from '../universal/config/feature-toggles';
import { jsonCopy } from '../universal/helpers/utils';
import { getCert } from './helpers/cert';
import { getFromEnv } from './helpers/env';
import { BFF_BASE_PATH } from './routing/bff-routes';

export const BFF_API_BASE_URL = process.env.BFF_API_BASE_URL ?? BFF_BASE_PATH;

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
  | 'PARKEREN'
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
    postponeFetch: !FeatureToggle.afisActive,
    url: `${getFromEnv('BFF_AFIS_API_BASE_URL')}`,
    headers: {
      apiKey: process.env.BFF_ENABLEU_AFIS_API_KEY,
    },
  },
  ZORGNED_JZD: {
    method: 'post',
    url: `${getFromEnv('BFF_ZORGNED_API_BASE_URL')}`,
    headers: {
      Token: getFromEnv('BFF_ZORGNED_API_TOKEN'),
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
    url: `${getFromEnv('BFF_ZORGNED_API_BASE_URL')}`,
    headers: {
      Token: getFromEnv('BFF_ZORGNED_API_TOKEN'),
      'Content-type': 'application/json; charset=utf-8',
      'X-Mams-Api-User': 'AV',
    },
    httpsAgent: new https.Agent({
      cert: getCert('BFF_ZORGNED_AV_CERT'),
      key: getCert('BFF_ZORGNED_AV_KEY'),
    }),
  },
  GPASS: {
    url: `${getFromEnv('BFF_GPASS_API_BASE_URL')}`,
  },
  WPI_E_AANVRAGEN: {
    url: `${getFromEnv('BFF_WPI_API_BASE_URL')}/wpi/e-aanvragen`,
    passthroughOIDCToken: true,
  },
  WPI_AANVRAGEN: {
    url: `${getFromEnv('BFF_WPI_API_BASE_URL')}/wpi/uitkering/aanvragen`,
    passthroughOIDCToken: true,
  },
  WPI_SPECIFICATIES: {
    url: `${getFromEnv('BFF_WPI_API_BASE_URL')}/wpi/uitkering/specificaties-en-jaaropgaven`,
    passthroughOIDCToken: true,
  },
  SVWI: {
    url: `${getFromEnv('BFF_SVWI_API_BASE_URL')}/mijnamsterdam/v1/autorisatie/tegel`,
    passthroughOIDCToken: true,
    postponeFetch: !FeatureToggle.svwiLinkActive,
    headers: {
      'Ocp-Apim-Subscription-Key': getFromEnv('BFF_SVWI_API_KEY', false),
    },
  },
  BEZWAREN_LIST: {
    url: `${getFromEnv('BFF_BEZWAREN_API')}/zgw/v1/zaken/_zoek`,
    method: 'POST',
    postponeFetch: !FeatureToggle.bezwarenActive,
  },
  BEZWAREN_DOCUMENT: {
    url: `${getFromEnv('BFF_BEZWAREN_API')}/zgw/v1/enkelvoudiginformatieobjecten/:id/download`,
    postponeFetch: !FeatureToggle.bezwarenActive,
  },
  BEZWAREN_DOCUMENTS: {
    url: `${getFromEnv('BFF_BEZWAREN_API')}/zgw/v1/enkelvoudiginformatieobjecten`,
    postponeFetch: !FeatureToggle.bezwarenActive,
  },
  BEZWAREN_STATUS: {
    url: `${getFromEnv('BFF_BEZWAREN_API')}/zgw/v1/statussen`,
    postponeFetch: !FeatureToggle.bezwarenActive,
  },
  BELASTINGEN: {
    url: `${getFromEnv('BFF_BELASTINGEN_ENDPOINT')}`,
    postponeFetch: !FeatureToggle.belastingApiActive,
  },
  CLEOPATRA: {
    url: `${getFromEnv('BFF_CLEOPATRA_API_ENDPOINT')}`,
    postponeFetch: !FeatureToggle.cleopatraApiActive,
    method: 'POST',
    httpsAgent: new https.Agent({
      cert: getCert('BFF_SERVER_CLIENT_CERT'),
      key: getCert('BFF_SERVER_CLIENT_KEY'),
    }),
  },
  DECOS_API: {
    url: `${getFromEnv('BFF_DECOS_API_BASE_URL')}`,
    postponeFetch: !FeatureToggle.decosServiceActive,
    headers: {
      Accept: 'application/itemdata',
      Authorization: `Basic ${Buffer.from(`${getFromEnv('BFF_DECOS_API_USERNAME')}:${getFromEnv('BFF_DECOS_API_PASSWORD')}`).toString('base64')}`,
      'Content-type': 'application/json; charset=utf-8',
    },
  },
  VERGUNNINGEN: {
    url: `${getFromEnv('BFF_VERGUNNINGEN_API_BASE_URL')}/decosjoin/getvergunningen`,
    postponeFetch: !FeatureToggle.vergunningenActive,
    passthroughOIDCToken: true,
  },
  POWERBROWSER: {
    method: 'POST',
    url: `${getFromEnv('BFF_POWERBROWSER_API_URL')}`,
    postponeFetch: !FeatureToggle.powerbrowserActive,
    headers: {
      apiKey: getFromEnv('BFF_POWERBROWSER_API_KEY'),
    },
  },
  CMS_CONTENT_GENERAL_INFO: {
    cacheTimeout: 4 * ONE_HOUR_MS,
    urls: {
      private: `${getFromEnv('BFF_CMS_BASE_URL')}/mijn-content/artikelen/ziet-amsterdam/?AppIdt=app-data`,
      'private-attributes': `${getFromEnv('BFF_CMS_BASE_URL')}/mijn-content/artikelen/ziet-amsterdam/?AppIdt=app-data`,
      commercial: `${getFromEnv('BFF_CMS_BASE_URL')}/mijn-content/artikelen/overzicht-producten-ondernemers/?AppIdt=app-data`,
    },
  },
  CMS_CONTENT_FOOTER: {
    url: `${getFromEnv('BFF_CMS_BASE_URL')}/algemene_onderdelen/overige/footer/?AppIdt=app-data`,
    cacheTimeout: 4 * ONE_HOUR_MS,
    postponeFetch: !FeatureToggle.cmsFooterActive,
  },
  CMS_MAINTENANCE_NOTIFICATIONS: {
    url: `${getFromEnv('BFF_CMS_BASE_URL')}/storingsmeldingen/alle-meldingen-mijn-amsterdam?new_json=true&reload=true`,
    cacheTimeout: ONE_HOUR_MS,
  },
  BRP: {
    url: `${getFromEnv('BFF_MKS_API_BASE_URL')}/brp/brp`,
    passthroughOIDCToken: true,
  },
  ERFPACHT: {
    url: `${getFromEnv('BFF_MIJN_ERFPACHT_API_URL')}`,
    // NOTE: Temporarily disable https validation until we solve the cert verification error. See also: MIJN-9122
    httpsAgent: new https.Agent({
      rejectUnauthorized: false,
    }),
  },
  BAG: {
    url: `https://api.data.amsterdam.nl/atlas/search/adres/`,
  },
  ERFPACHTv2: {
    url: getFromEnv('BFF_ERFPACHT_API_URL'),
    passthroughOIDCToken: true,
    httpsAgent: new https.Agent({
      ca: IS_TAP ? getCert('BFF_SERVER_CLIENT_CERT') : [],
    }),
    postponeFetch:
      !FeatureToggle.erfpachtV2EndpointActive ||
      !getFromEnv('BFF_ERFPACHT_API_URL'),
    headers: {
      'X-HERA-REQUESTORIGIN': 'MijnAmsterdam',
      apiKey: getFromEnv('BFF_ENABLEU_ERFPACHT_API_KEY'),
    },
  },
  AFVAL: {
    url: `https://api.data.amsterdam.nl/v1/afvalwijzer/afvalwijzer/`,
    headers: { 'X-Api-Key': getFromEnv('BFF_DATA_AMSTERDAM_API_KEY ', false) },
  },
  KVK: {
    url: `${getFromEnv('BFF_MKS_API_BASE_URL')}/brp/hr`,
    passthroughOIDCToken: true,
  },
  PARKEREN: {
    url: `${getFromEnv('BFF_PARKEREN_API_BASE_URL')}`,
  },
  TOERISTISCHE_VERHUUR_REGISTRATIES: {
    url: `${getFromEnv('BFF_LVV_API_URL')}`,
    headers: {
      'X-Api-Key': getFromEnv('BFF_LVV_API_KEY') + '',
      'Content-Type': 'application/json',
    },
    postponeFetch: !FeatureToggle.toeristischeVerhuurActive,
  },
  KREFIA: {
    url: `${getFromEnv('BFF_KREFIA_API_BASE_URL')}/krefia/all`,
    postponeFetch: !FeatureToggle.krefiaActive,
    passthroughOIDCToken: true,
  },
  SUBSIDIE: {
    url: `${getFromEnv('BFF_SISA_API_ENDPOINT')}`,
    postponeFetch: !FeatureToggle.subsidieActive,
  },
  SEARCH_CONFIG: {
    url: 'https://raw.githubusercontent.com/Amsterdam/mijn-amsterdam-frontend/main/src/client/components/Search/search-config.json',
    httpsAgent: new https.Agent({
      rejectUnauthorized: false, // NOTE: Risk is assessed and tolerable for now because this concerns a request to a trusted source (GH), no sensitive data is involved and no JS code is evaluated.
    }),
  },
  ENABLEU_2_SMILE: {
    url: `${getFromEnv('BFF_ENABLEU_2_SMILE_ENDPOINT')}`,
    method: 'POST',
  },
  LOOD_365: {
    url: `${getFromEnv('BFF_LOOD_API_URL')}`,
    method: 'POST',
    postponeFetch: !FeatureToggle.bodemActive,
  },
  LOOD_365_OAUTH: {
    url: `${getFromEnv('BFF_LOOD_OAUTH')}/${getFromEnv('BFF_LOOD_TENANT')}/oauth2/v2.0/token`,
    method: 'POST',
    postponeFetch: !FeatureToggle.bodemActive,
    cacheTimeout: 59 * ONE_MINUTE_MS,
  },
  AMSAPP: {
    url: `${process.env.BFF_AMSAPP_ADMINISTRATIENUMMER_DELIVERY_ENDPOINT}`,
    method: 'POST',
    headers: {
      'X-Session-Credentials-Key': getFromEnv('BFF_AMSAPP_API_KEY'),
      Accept: 'application/json',
      'Content-Type': 'application/json',
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

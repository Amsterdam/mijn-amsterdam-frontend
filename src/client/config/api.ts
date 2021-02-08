import * as Cookies from 'js-cookie';
import {
  API_BASE_PATH,
  COOKIE_KEY_COMMERCIAL_LOGIN,
  IS_AP,
} from '../../universal/config';
import { IS_ACCEPTANCE } from '../../universal/config/env';
import { isError } from '../../universal/helpers';
import { AppState } from '../AppState';

export const IS_COMMERCIAL_PATH_MATCH =
  /\/(test-)?api1(-|\/)login/g.test(window.location.pathname) ||
  !!Cookies.get(COOKIE_KEY_COMMERCIAL_LOGIN);

// Urls directly used from front-end
export const TMA_LOGIN_URL_DIGID = `${API_BASE_PATH}/login`;
export const TMA_LOGIN_URL_EHERKENNING = `${API_BASE_PATH}1/login`;
export const TMA_LOGIN_URL_IRMA = `${API_BASE_PATH}1/login`;

export const TMA_LOGIN_URL_DIGID_AFTER_REDIRECT = IS_AP
  ? TMA_LOGIN_URL_DIGID
  : `/test-api-login`;
export const TMA_LOGIN_URL_EHERKENNING_AFTER_REDIRECT = IS_AP
  ? TMA_LOGIN_URL_EHERKENNING
  : `/test-api1-login`;
export const TMA_LOGIN_URL_IRMA_AFTER_REDIRECT = IS_AP
  ? TMA_LOGIN_URL_IRMA
  : `/test-api1-login`;

export const LOGIN_URL_DIGID = TMA_LOGIN_URL_DIGID;
export const LOGIN_URL_EHERKENNING = TMA_LOGIN_URL_EHERKENNING;
export const LOGIN_URL_IRMA = TMA_LOGIN_URL_IRMA;

const API_BASE_PATH_MODDED =
  API_BASE_PATH + (IS_COMMERCIAL_PATH_MATCH ? '1' : '');

export const BFF_API_BASE_URL = `${API_BASE_PATH_MODDED}/bff`;
export const AUTH_API_URL = `${API_BASE_PATH_MODDED}/auth/check`;
export const BFF_API_HEALTH_URL = `${BFF_API_BASE_URL}/status/health`;
export const LOGOUT_URL = '/logout';

export const BRP_RESIDENTS_API_URL = `${API_BASE_PATH_MODDED}/brp/aantal_bewoners`;
export const BFF_API_PUBLIC_BASE_URL = !IS_AP
  ? `http://localhost:5000/test-api/bff/public`
  : `https://${IS_ACCEPTANCE ? 'acc.' : ''}mijn-bff.amsterdam.nl/bff/public`;

export const BFFApiUrls = {
  SERVICES_SAURON: `${BFF_API_BASE_URL}/services/all`,
  SERVICES_SSE: `${BFF_API_BASE_URL}/services/stream`,
  MAP_DATASETS_WMS: `${BFF_API_BASE_URL}/map/datasets/wms`,
  MAP_DATASETS: `${BFF_API_BASE_URL}/map/datasets`,
  SERVICES_TIPS_URL: `${BFF_API_BASE_URL}/services/tips`,
  SERVICES_CMS_URL: `${BFF_API_PUBLIC_BASE_URL}/services/cms`,
};

export const ErrorNames: Record<string /* ApiStateKey */, string> = {
  BRP: 'Persoonlijke gegevens, paspoort, ID-kaart + actuele updates',
  CASES: 'Lopende zaken',
  TIPS: 'Tips',
  NOTIFICATIONS: 'Actuele updates',
  WMO: 'Zorg en ondersteuning',
  FOCUS_AANVRAGEN: 'Uitkering en Stadspas -aanvragen + actuele updates',
  FOCUS_TOZO: 'Aanvraag Tozo',
  FOCUS_SPECIFICATIES:
    'Uitkeringsspecificaties en jaaropgaven + actuele updates',
  FOCUS_STADSPAS: 'Informatie over uw stadspassen',
  ERFPACHT: 'Erfpacht',
  AFVAL: 'Afvalgegevens rond uw adres',
  BUURT: 'Mijn buurt / Mijn bedrijfsomgeving',
  BELASTINGEN: 'Belastingen + actuele updates',
  MILIEUZONE: 'Milieuzone + actuele updates',
  HOME: 'Uw locatie op de kaart',
  VERGUNNINGEN: 'Vergunningen + actuele updates',
  ALL: 'Alle gegevens', // indien data helemaal niet opgehaald kan worden
  CMS_CONTENT: 'Uitleg Mijn Amsterdam',
  AFVALPUNTEN: 'Afvalpunten',
  KVK: 'Mijn onderneming',
};

export function getApiErrors(appState: AppState) {
  return !!appState
    ? Object.entries(appState)
        .filter(([, apiResponseData]: any) => {
          return isError(apiResponseData);
        })
        .map(([stateKey, apiResponseData]: any) => {
          const name = ErrorNames[stateKey] || stateKey;
          return {
            stateKey,
            name,
            error:
              ('message' in apiResponseData ? apiResponseData.message : null) ||
              'Communicatie met api mislukt.',
          };
        })
    : [];
}

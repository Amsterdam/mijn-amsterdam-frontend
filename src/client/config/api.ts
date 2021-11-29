import * as Cookies from 'js-cookie';
import {
  API_BASE_PATH,
  AuthType,
  COOKIE_KEY_AUTH_TYPE,
  IS_AP,
} from '../../universal/config';
import { IS_ACCEPTANCE } from '../../universal/config/env';
import { isError } from '../../universal/helpers';
import { ApiResponse } from '../../universal/helpers/api';
import { AppState } from '../AppState';
import { Error } from '../components/ErrorMessages/ErrorMessages';

// Will be determined after we've been redirected by TMA
export const IS_COMMERCIAL_PATH_MATCH =
  /\/(test-)?api1(-|\/)login/g.test(window.location.pathname) ||
  Cookies.get(COOKIE_KEY_AUTH_TYPE) === AuthType.EHERKENNING;

export const IS_IRMA_PATH_MATCH =
  /\/(test-)?api2(-|\/)login/g.test(window.location.pathname) ||
  Cookies.get(COOKIE_KEY_AUTH_TYPE) === AuthType.IRMA;

// Urls directly used from front-end
export const TMA_LOGIN_URL_DIGID = `${API_BASE_PATH}/login`;
export const TMA_LOGIN_URL_EHERKENNING = `${API_BASE_PATH}1/login`;
export const TMA_LOGIN_URL_IRMA = `${API_BASE_PATH}2/login`;

export const TMA_LOGIN_URL_DIGID_AFTER_REDIRECT = IS_AP
  ? TMA_LOGIN_URL_DIGID
  : `/test-api-login`;
export const TMA_LOGIN_URL_EHERKENNING_AFTER_REDIRECT = IS_AP
  ? TMA_LOGIN_URL_EHERKENNING
  : `/test-api1-login`;
export const TMA_LOGIN_URL_IRMA_AFTER_REDIRECT = IS_AP
  ? TMA_LOGIN_URL_IRMA
  : `/test-api2-login`;

export const LOGIN_URL_DIGID = TMA_LOGIN_URL_DIGID;
export const LOGIN_URL_EHERKENNING = TMA_LOGIN_URL_EHERKENNING;
export const LOGIN_URL_IRMA = TMA_LOGIN_URL_IRMA;

const API_BASE_PATH_MODDED =
  API_BASE_PATH +
  (IS_COMMERCIAL_PATH_MATCH ? '1' : IS_IRMA_PATH_MATCH ? '2' : '');

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
  SERVICES_CMS_MAINTENANCE_NOTIFICATIONS_URL: `${BFF_API_PUBLIC_BASE_URL}/services/cms/maintenance-notifications`,
  SEARCH_CONFIGURATION: `${BFF_API_BASE_URL}/services/search-config`,
};

export const ErrorNames: Record<string /* ApiStateKey */, string> = {
  BRP: 'Persoonlijke gegevens, paspoort, ID-kaart + actuele updates',
  CASES: 'Lopende zaken',
  TIPS: 'Tips',
  NOTIFICATIONS: 'Actuele updates',
  WMO: 'Zorg en ondersteuning',
  FOCUS_AANVRAGEN: 'Uitkering en Stadspas -aanvragen + actuele updates',
  FOCUS_TOZO: 'Aanvraag Tozo',
  FOCUS_TONK: 'Aanvraag TONK',
  FOCUS_BBZ: 'Aanvraag Bbz',
  FOCUS_SPECIFICATIES:
    'Uitkeringsspecificaties en jaaropgaven + actuele updates',
  FOCUS_STADSPAS: 'Informatie over uw stadspassen',
  ERFPACHT: 'Erfpacht',
  AFVAL: 'Afvalgegevens rond uw adres',
  BUURT: 'Mijn buurt / Mijn bedrijfsomgeving',
  BELASTINGEN: 'Actuele updates over uw belastingen',
  MILIEUZONE: 'Milieuzone + actuele updates',
  MY_LOCATION: 'Uw locatie op de kaart',
  VERGUNNINGEN: 'Vergunningen + actuele updates',
  ALL: 'Alle gegevens', // indien data helemaal niet opgehaald kan worden
  CMS_CONTENT: 'Uitleg Mijn Amsterdam',
  AFVALPUNTEN: 'Afvalpunten',
  KVK: 'Mijn onderneming',
  TOERISTISCHE_VERHUUR: 'Toeristische verhuur + meldingen',
  TOERISTISCHE_VERHUUR_vergunningen:
    'Toeristische verhuur: Vergunningen + meldingen',
  TOERISTISCHE_VERHUUR_registraties:
    'Toeristische verhuur: Registratienummers + meldingen',
  FINANCIELE_HULP: 'Kredietbank & FIBU',
};

function createErrorDisplayData(
  stateKey: string,
  apiResponseData: ApiResponse<any>
): Error {
  const name = ErrorNames[stateKey] || stateKey;
  let errorMessage =
    ('message' in apiResponseData ? apiResponseData.message : null) ||
    'Communicatie met api mislukt.';
  return {
    stateKey,
    name,
    error: errorMessage,
  };
}

export function getApiErrors(appState: AppState): Error[] {
  return !!appState
    ? Object.entries(appState)
        .filter(([, apiResponseData]: [string, ApiResponse<any>]) => {
          return (
            isError(apiResponseData) ||
            (apiResponseData.status === 'OK' &&
              apiResponseData.failedDependencies)
          );
        })
        .flatMap(([stateKey, apiResponseData]: [string, ApiResponse<any>]) => {
          const apiErrors = [];

          if (
            apiResponseData.status === 'OK' &&
            apiResponseData?.failedDependencies
          ) {
            for (const [
              stateDependencyKey,
              apiDependencyResponseData,
            ] of Object.entries(apiResponseData.failedDependencies)) {
              apiErrors.push(
                createErrorDisplayData(
                  `${stateKey}_${stateDependencyKey}`,
                  apiDependencyResponseData
                )
              );
            }
          } else {
            apiErrors.push(createErrorDisplayData(stateKey, apiResponseData));
          }

          return apiErrors;
        })
    : [];
}

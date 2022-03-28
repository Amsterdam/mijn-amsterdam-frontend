import Cookies from 'js-cookie';
import {
  API_BASE_PATH,
  AuthType,
  COOKIE_KEY_AUTH_TYPE,
  IS_AP,
} from '../../universal/config';
import { IS_ACCEPTANCE } from '../../universal/config/env';
import { ApiResponse, FailedDependencies } from '../../universal/helpers/api';
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
  BRP: 'Persoonlijke gegevens, paspoort, ID-kaart',
  TIPS: 'Tips',
  NOTIFICATIONS: 'Actuele updates',
  WMO: 'Zorg en ondersteuning',
  WPI_AANVRAGEN: 'Uitkeringaanvragen',
  WPI_TOZO: 'Aanvraag Tozo',
  WPI_TONK: 'Aanvraag TONK',
  WPI_BBZ: 'Aanvraag Bbz',
  WPI_SPECIFICATIES: 'Uitkeringsspecificaties en jaaropgaven',
  WPI_STADSPAS_aanvragen: 'Stadspasaanvragen',
  WPI_STADSPAS_stadspas: 'Informatie over uw stadspassen',
  ERFPACHT: 'Erfpacht',
  SUBSIDIE: 'Subsidies',
  AFVAL: 'Afvalgegevens rond uw adres',
  BUURT: 'Mijn buurt / Mijn bedrijfsomgeving',
  BELASTINGEN: 'Actuele updates over uw belastingen',
  MILIEUZONE: 'Milieuzone',
  MY_LOCATION: 'Uw locatie op de kaart',
  VERGUNNINGEN: 'Vergunningen',
  ALL: 'Alle gegevens', // indien data helemaal niet opgehaald kan worden
  CMS_CONTENT: 'Uitleg Mijn Amsterdam',
  AFVALPUNTEN: 'Afvalpunten',
  KVK: 'Mijn onderneming',
  TOERISTISCHE_VERHUUR: 'Toeristische verhuur + meldingen',
  TOERISTISCHE_VERHUUR_vergunningen:
    'Toeristische verhuur: Vergunningen + meldingen',
  TOERISTISCHE_VERHUUR_registraties:
    'Toeristische verhuur: Registratienummers + meldingen',
  KREFIA: 'Kredietbank & FIBU',
};

export function createErrorDisplayData(
  stateKey: string,
  apiResponseData: ApiResponse<any> | null | string
): Error {
  const name = ErrorNames[stateKey] || stateKey;
  let errorMessage =
    (typeof apiResponseData === 'object' &&
    apiResponseData !== null &&
    'message' in apiResponseData
      ? apiResponseData.message
      : null) || 'Communicatie met api mislukt.';
  return {
    stateKey,
    name,
    error: errorMessage,
  };
}

export function createFailedDependenciesError(
  stateKey: string,
  failedDependencies: FailedDependencies
) {
  const apiErrors = [];
  for (const [stateDependencyKey, apiDependencyResponseData] of Object.entries(
    failedDependencies
  )) {
    apiErrors.push(
      createErrorDisplayData(
        `${stateKey}_${stateDependencyKey}`,
        apiDependencyResponseData
      )
    );
  }
  return apiErrors;
}

export function getApiErrors(appState: AppState): Error[] {
  if (!!appState) {
    const filteredResponses = Object.entries(appState).filter(
      ([, apiResponseData]: [string, ApiResponse<any> | string | null]) => {
        return (
          typeof apiResponseData !== 'object' ||
          apiResponseData == null ||
          apiResponseData?.status === 'ERROR' ||
          apiResponseData?.status === 'DEPENDENCY_ERROR' ||
          (apiResponseData?.status === 'OK' &&
            !!apiResponseData?.failedDependencies)
        );
      }
    );

    const apiErrors = [];

    for (const [stateKey, apiResponseData] of filteredResponses) {
      if (
        apiResponseData?.status === 'OK' &&
        apiResponseData?.failedDependencies
      ) {
        apiErrors.push(
          ...createFailedDependenciesError(
            stateKey,
            apiResponseData.failedDependencies
          )
        );
      } else {
        apiErrors.push(createErrorDisplayData(stateKey, apiResponseData));
      }
    }

    return apiErrors;
  }

  return [];
}

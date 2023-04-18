import { IS_ACCEPTANCE } from '../../universal/config';
import { ApiResponse, FailedDependencies } from '../../universal/helpers/api';
import { ApiError } from '../../universal/types';
import { AppState } from '../AppState';

const baseUrl = IS_ACCEPTANCE
  ? process.env.REACT_APP_BFF_API_URL_ACC
  : process.env.REACT_APP_BFF_API_URL;

export const BFF_API_BASE_URL = baseUrl || '/api/v1';

export const BFFApiUrls = {
  BRP_RESIDENTS_API_URL: `${BFF_API_BASE_URL}/relay/brp/aantal_bewoners`,
  MAP_DATASETS_WMS: `${BFF_API_BASE_URL}/map/datasets/wms`,
  MAP_DATASETS: `${BFF_API_BASE_URL}/map/datasets`,
  SEARCH_CONFIGURATION: `${BFF_API_BASE_URL}/services/search-config`,
  SERVICES_CMS_MAINTENANCE_NOTIFICATIONS_URL: `${BFF_API_BASE_URL}/services/cms/maintenance-notifications`,
  SERVICES_CMS_URL: `${BFF_API_BASE_URL}/services/cms`,
  SERVICES_SAURON: `${BFF_API_BASE_URL}/services/all`,
  SERVICES_SSE: `${BFF_API_BASE_URL}/services/stream`,
  SERVICES_TIPS_URL: `${BFF_API_BASE_URL}/services/tips`,
};

// Urls directly used from front-end
export const AUTH_PATH = process.env.REACT_APP_BFF_AUTH_PATH || '/auth';
export const LOGIN_URL_DIGID = `${BFF_API_BASE_URL + AUTH_PATH}/digid/login`;
export const LOGIN_URL_EHERKENNING = `${
  BFF_API_BASE_URL + AUTH_PATH
}/eherkenning/login`;
export const LOGIN_URL_YIVI = `${BFF_API_BASE_URL + AUTH_PATH}/yivi/login`;

export const LOGOUT_URL = `${BFF_API_BASE_URL + AUTH_PATH}/logout`;

export const AUTH_API_URL = `${BFF_API_BASE_URL}/auth/check`;
export const AUTH_API_URL_EHERKENNING = `${BFF_API_BASE_URL}/auth/eherkenning/check`;
export const AUTH_API_URL_DIGID = `${BFF_API_BASE_URL}/auth/digid/check`;

export const AUTH_API_URL_EHERKENNING_SSO_CHECK = `${BFF_API_BASE_URL}/auth/eherkenning/sso?checkAuthenticated=1`;
export const AUTH_API_URL_DIGID_SSO_CHECK = `${BFF_API_BASE_URL}/auth/digid/sso?checkAuthenticated=1`;

export const loginUrlByAuthMethod = {
  eherkenning: LOGIN_URL_EHERKENNING,
  digid: LOGIN_URL_DIGID,
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
  SIA: 'Mijn meldingen',
  TOERISTISCHE_VERHUUR: 'Toeristische verhuur + meldingen',
  TOERISTISCHE_VERHUUR_vergunningen:
    'Toeristische verhuur: Vergunningen + meldingen',
  TOERISTISCHE_VERHUUR_registraties:
    'Toeristische verhuur: Registratienummers + meldingen',
  KREFIA: 'Kredietbank & FIBU',
  KLACHTEN: 'Ingediende klachten',
  BEZWAREN: 'Ingediende bezwaren',
  HORECA: 'Horeca vergunningen',
};

export function createErrorDisplayData(
  stateKey: string,
  apiResponseData: ApiResponse<any> | null | string
): ApiError {
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

export function getApiErrors(appState: AppState): ApiError[] {
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

import { FeatureToggle } from '../../universal/config/feature-toggles';
import { ApiResponse, FailedDependencies } from '../../universal/helpers/api';
import { ApiError } from '../../universal/types';
import { AppState } from '../AppState';

export const BFF_API_BASE_URL = import.meta.env.REACT_APP_BFF_API_URL;
export const BFF_API_HEALTH_URL = `${BFF_API_BASE_URL}/status/health`;

export const BFFApiUrls = {
  MAP_DATASETS_WMS: `${BFF_API_BASE_URL}/map/datasets/wms`,
  MAP_DATASETS: `${BFF_API_BASE_URL}/map/datasets`,
  SEARCH_CONFIGURATION: `${BFF_API_BASE_URL}/services/search-config`,
  SERVICES_CMS_MAINTENANCE_NOTIFICATIONS_URL: `${BFF_API_BASE_URL}/services/cms/maintenance-notifications`,
  SERVICES_CMS_URL: `${BFF_API_BASE_URL}/services/cms`,
  SERVICES_SAURON: `${BFF_API_BASE_URL}/services/all`,
  SERVICES_SSE: `${BFF_API_BASE_URL}/services/stream`,
  ERFPACHTv2_DOSSIER_DETAILS: `${BFF_API_BASE_URL}/services/erfpachtv2/dossier`,
  BEZWAREN_DETAIL: `${BFF_API_BASE_URL}/services/bezwaren`,
};

// Urls directly used from front-end
export const LOGIN_URL_DIGID = `${BFF_API_BASE_URL}/auth/digid/login`;
export const LOGIN_URL_EHERKENNING = `${BFF_API_BASE_URL}/auth/eherkenning/login`;
export const LOGOUT_URL = `${BFF_API_BASE_URL}/auth/logout`;
export const AUTH_API_URL = `${BFF_API_BASE_URL}/auth/check`;
export const AUTH_API_URL_EHERKENNING = `${BFF_API_BASE_URL}/auth/eherkenning/check`;
export const AUTH_API_URL_DIGID = `${BFF_API_BASE_URL}/auth/digid/check`;
export const AUTH_API_URL_EHERKENNING_SSO_CHECK = `${BFF_API_BASE_URL}/auth/eherkenning/sso?checkAuthenticated=1`;
export const AUTH_API_URL_DIGID_SSO_CHECK = `${BFF_API_BASE_URL}/auth/digid/sso?checkAuthenticated=1`;

export const loginUrlByAuthMethod: Record<string, string> = {
  eherkenning: LOGIN_URL_EHERKENNING,
  digid: LOGIN_URL_DIGID,
};

export const ExcludePageViewTrackingUrls = [
  LOGIN_URL_DIGID,
  LOGIN_URL_EHERKENNING,
];

export const ErrorNames: Record<string /* ApiStateKey */, string> = {
  AFIS: 'Facturen en betalen',
  BRP: 'Persoonlijke gegevens, paspoort, ID-kaart',
  NOTIFICATIONS: 'Actuele updates',
  WMO: 'Zorg en ondersteuning',
  WPI_AANVRAGEN: 'Uitkeringaanvragen',
  WPI_TOZO: 'Aanvraag Tozo',
  WPI_TONK: 'Aanvraag TONK',
  WPI_BBZ: 'Aanvraag Bbz',
  WPI_SPECIFICATIES: 'Uitkeringsspecificaties en jaaropgaven',
  STADSPAS_stadspas: 'Informatie over uw stadspassen',
  ERFPACHT: 'Erfpacht',
  ERFPACHTv2: 'Erfpacht',
  SUBSIDIE: 'Subsidies',
  AFVAL: 'Afvalgegevens rond uw adres',
  BUURT: 'Mijn buurt / Mijn bedrijfsomgeving',
  BELASTINGEN: 'Actuele updates over uw belastingen',
  MILIEUZONE: 'Milieuzone',
  OVERTREDINGEN: 'Overtredingen voertuigen',
  MY_LOCATION: 'Uw locatie op de kaart',
  VERGUNNINGEN: 'Vergunningen en ontheffingen',
  ALL: 'Alle gegevens', // indien data helemaal niet opgehaald kan worden
  CMS_CONTENT: 'Uitleg Mijn Amsterdam',
  AFVALPUNTEN: 'Afvalpunten',
  SVWI: 'Werk & Inkomen portaal',
  KVK: 'Mijn onderneming',
  TOERISTISCHE_VERHUUR: 'Toeristische verhuur + meldingen',
  TOERISTISCHE_VERHUUR_lvvRegistraties:
    'Toeristische verhuur: Registratienummers + meldingen',
  TOERISTISCHE_VERHUUR_bbVergunningen: 'Uw vergunning Bed & Breakfast',
  TOERISTISCHE_VERHUUR_vakantieverhuurVergunningen:
    'Uw vergunning vakantieverhuur',
  KREFIA: 'Kredietbank & FIBU',
  KLACHTEN: 'Ingediende klachten',
  BEZWAREN: 'Ingediende bezwaren',
  HORECA: 'Horeca vergunningen',
  AVG: 'Ingediende AVG verzoeken',
  BODEM: 'Bodem: loodmetingen',
};

if (FeatureToggle.stadspasRequestsActive) {
  ErrorNames['STADSPAS_aanvragen'] = 'Stadspasaanvragen';
}

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

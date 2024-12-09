import { IS_PRODUCTION } from '../../universal/config/env';
import { ApiResponse, FailedDependencies } from '../../universal/helpers/api';
import { ApiError, AppState } from '../../universal/types';

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
  AFIS_BUSINESSPARTNER: `${BFF_API_BASE_URL}/services/afis/businesspartner`,
  AFIS_FACTUREN: `${BFF_API_BASE_URL}/services/afis/facturen`,
};

// Urls directly used from front-end
export const LOGIN_URL_DIGID = `${BFF_API_BASE_URL}/auth/digid/login`;
export const LOGIN_URL_EHERKENNING = `${BFF_API_BASE_URL}/auth/eherkenning/login`;
export const LOGOUT_URL = `${BFF_API_BASE_URL}/auth/logout`;
export const AUTH_API_URL = `${BFF_API_BASE_URL}/auth/check`;
export const AUTH_API_URL_EHERKENNING = `${BFF_API_BASE_URL}/auth/eherkenning/check`;
export const AUTH_API_URL_DIGID = `${BFF_API_BASE_URL}/auth/digid/check`;

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
  AFIS_facturenoverview: 'Facturen en betalen: Overzicht van facturen',
  AFIS_afgehandeld: 'Facturen en betalen: Afgehandelde facturen',
  AFIS_open: 'Facturen en betalen: Openstaande facturen',
  AFIS_overgedragen:
    'Facturen en betalen: Facturen in het incasso- en invorderingstraject van directie Belastingen',
  AFVAL: 'Afvalgegevens rond uw adres',
  AFVALPUNTEN: 'Afvalpunten',
  ALL: 'Alle gegevens', // indien data helemaal niet opgehaald kan worden
  AVG: 'Ingediende AVG verzoeken',
  BELASTINGEN: 'Actuele updates over uw belastingen',
  BEZWAREN: 'Ingediende bezwaren',
  BODEM: 'Bodem: loodmetingen',
  BRP: 'Persoonlijke gegevens, paspoort, ID-kaart',
  BUURT: 'Mijn buurt / Mijn bedrijfsomgeving',
  CMS_CONTENT: 'Uitleg Mijn Amsterdam',
  ERFPACHT: 'Mijn erfpacht',
  ERFPACHTv2: `Erfpacht${IS_PRODUCTION ? '' : ' V2 (Vernise)'}`,
  HLI_regelingen: 'Regelingen bij laag inkomen',
  HLI_stadspas: 'Stadspas, saldo en transacties',
  HORECA: 'Horeca vergunningen',
  KLACHTEN: 'Ingediende klachten',
  KREFIA: 'Kredietbank & FIBU',
  KVK: 'Mijn onderneming',
  MILIEUZONE: 'Milieuzone',
  MY_LOCATION: 'Uw locatie op de kaart',
  NOTIFICATIONS: 'Actuele updates',
  OVERTREDINGEN: 'Overtredingen voertuigen',
  PARKEREN: 'Parkeren',
  SUBSIDIE: 'Subsidies',
  SVWI: 'Werk & Inkomen portaal',
  TOERISTISCHE_VERHUUR_bbVergunningen: 'Uw vergunning Bed & Breakfast',
  TOERISTISCHE_VERHUUR_lvvRegistraties:
    'Toeristische verhuur: Registratienummers + meldingen',
  TOERISTISCHE_VERHUUR_vakantieverhuurVergunningen:
    'Uw vergunning vakantieverhuur',
  TOERISTISCHE_VERHUUR: 'Toeristische verhuur + meldingen',
  VAREN: 'Passagiers- en beroepsvaart',

  VERGUNNINGEN: 'Vergunningen en ontheffingen',
  WMO: 'Zorg en ondersteuning',
  WPI_AANVRAGEN: 'Uitkeringaanvragen',
  WPI_BBZ: 'Aanvraag Bbz',
  WPI_SPECIFICATIES: 'Uitkeringsspecificaties en jaaropgaven',
  WPI_TONK: 'Aanvraag TONK',
  WPI_TOZO: 'Aanvraag Tozo',
};

export function createErrorDisplayData(
  stateKey: string,
  apiResponseData: ApiResponse<unknown> | null | string
): ApiError {
  const name = ErrorNames[stateKey] || stateKey;
  const errorMessage =
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
        apiDependencyResponseData as ApiResponse<unknown>
      )
    );
  }
  return apiErrors;
}

export function getApiErrors(appState: AppState): ApiError[] {
  if (appState) {
    const filteredResponses = Object.entries(appState).filter(
      ([, apiResponseData]: [string, unknown]) => {
        return (
          typeof apiResponseData !== 'object' ||
          apiResponseData == null ||
          ('status' in apiResponseData &&
            (apiResponseData?.status === 'ERROR' ||
              apiResponseData?.status === 'DEPENDENCY_ERROR' ||
              (apiResponseData?.status === 'OK' &&
                'failedDependencies' in apiResponseData &&
                !!apiResponseData?.failedDependencies)))
        );
      }
    );

    const apiErrors = [];

    for (const [stateKey, apiResponseData] of filteredResponses) {
      if (
        apiResponseData?.status === 'OK' &&
        'failedDependencies' in apiResponseData &&
        apiResponseData?.failedDependencies
      ) {
        apiErrors.push(
          ...createFailedDependenciesError(
            stateKey,
            apiResponseData.failedDependencies
          )
        );
      } else {
        apiErrors.push(
          createErrorDisplayData(
            stateKey,
            apiResponseData as ApiResponse<unknown>
          )
        );
      }
    }

    return apiErrors;
  }

  return [];
}

import { AppState } from '../AppState';
import { isError } from '../../universal/helpers';
import { IS_AP, API_BASE_PATH } from '../../universal/config';

// Urls directly used from front-end
export const TMA_LOGIN_URL_DIGID = `${API_BASE_PATH}/login`;
export const TMA_LOGIN_URL_EHERKENNING = `${API_BASE_PATH}1/login`;
export const LOGIN_URL_DIGID = `${TMA_LOGIN_URL_DIGID}${
  !IS_AP ? '?target=digid' : ''
}`;
export const LOGIN_URL_EHERKENNING = `${TMA_LOGIN_URL_EHERKENNING}${
  !IS_AP ? '?target=eherkenning' : ''
}`;
export const LOGOUT_URL = '/logout';
export const BFF_API_BASE_URL = `${API_BASE_PATH}/bff`;
export const AUTH_API_URL = `${API_BASE_PATH}/auth/check`;
export const BFF_API_HEALTH_URL = `${BFF_API_BASE_URL}/status/health`;

export const BFFApiUrls: Record<string, string> = {
  SERVICES_SAURON: `${BFF_API_BASE_URL}/services/all`,
  SERVICES_SSE: `${BFF_API_BASE_URL}/services/stream`,
  SERVICES_TIPS: `${BFF_API_BASE_URL}/services/tips`,
};

export const ErrorNames: Record<string /* ApiStateKey */, string> = {
  BRP: 'Persoonlijke gegevens, Identiteitsbewijzen + actuele updates',
  CASES: 'Lopende zaken',
  TIPS: 'Tips',
  NOTIFICATIONS: 'Actuele updates',
  WMO: 'Zorg en ondersteuning',
  FOCUS_AANVRAGEN: 'Inkomen en Stadspas + actuele updates',
  FOCUS_TOZO: 'Tozo aanvraag regeling status',
  FOCUS_SPECIFICATIES:
    'Uitkeringsspecificaties en jaaropgaven + actuele updates',
  CHAPTERS: "Thema's",
  ERFPACHT: 'Erfpacht',
  AFVAL: 'Afval gegevens rond uw adres.',
  BUURT: 'Mijn buurt',
  BELASTINGEN: 'Belastingen + actuele updates',
  MILIEUZONE: 'Milieuzone + actuele updates',
  HOME: 'Uw locatie op de kaart.',
  VERGUNNINGEN: 'Vergunningen + actuele updates',
  ALL: 'Alle databronnen',
  CMS_CONTENT: 'Uitleg pagina',
  AFVALPUNTEN: 'Afvalpunten',
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
            name,
            error:
              ('message' in apiResponseData ? apiResponseData.message : null) ||
              'Communicatie met api mislukt.',
          };
        })
    : [];
}

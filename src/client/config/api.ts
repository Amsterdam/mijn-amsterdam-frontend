import { AppState } from '../AppState';
import { isError } from '../../universal/helpers';

// Urls directly used from front-end
export const TMA_LOGIN_URL = process.env.REACT_APP_LOGIN_URL || '/api/login';
export const LOGIN_URL_DIGID = `${TMA_LOGIN_URL}?target=digid`;
export const LOGIN_URL_EHERKENNING = `${TMA_LOGIN_URL}?target=eherkenning`;
export const LOGOUT_URL = process.env.REACT_APP_LOGOUT_URL || '/logout';
export const BFF_API_BASE_URL =
  process.env.REACT_APP_BFF_API_BASE_URL || '/api/bff';
export const AUTH_API_URL =
  process.env.REACT_APP_AUTH_API_URL || `/api/auth/check`;

export const BFFApiUrls: Record<string, string> = {
  SERVICES_SAURON: `${BFF_API_BASE_URL}/services/all`,
  SERVICES_SSE: `${BFF_API_BASE_URL}/services/stream`,
  SERVICES_TIPS: `${BFF_API_BASE_URL}/services/tips`,
};

export const ErrorNames: Record<string /* ApiStateKey */, string> = {
  BRP: 'Persoonlijke gegevens + actuele updates',
  CASES: 'Lopende zaken',
  TIPS: 'Tips',
  NOTIFICATIONS: 'Actuele updates',
  WMO: 'Zorg en ondersteuning',
  FOCUS_AANVRAGEN: 'Inkomen en Stadspas + actuele updates',
  FOCUS_SPECIFICATIES:
    'Uitkeringsspecificaties en jaaropgaven + actuele updates',
  CHAPTERS: "Thema's",
  ERFPACHT: 'Erfpacht',
  AFVAL: 'Afval gegevens rond uw Lat/Lon locatie',
  BUURT: 'Mijn buurt',
  BELASTINGEN: 'Belastingen + actuele updates',
  MILIEUZONE: 'Milieuzone + actuele updates',
  HOME: 'Lat/Lon locatie gegevens van uw adres.',
};

export function getApiErrors(appState: AppState) {
  return Object.entries(appState)
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
    });
}

import { AppState } from '../AppState';
import { isError } from '../../universal/helpers';
import { IS_AP, API_BASE_PATH } from '../../universal/config';
import { sub } from 'date-fns';

// Urls directly used from front-end
export const TMA_LOGIN_URL_DIGID = `${API_BASE_PATH}/login`;
export const TMA_LOGIN_URL_EHERKENNING = `${API_BASE_PATH}1/login`;

export const TMA_LOGIN_URL_DIGID_AFTER_REDIRECT = IS_AP
  ? TMA_LOGIN_URL_DIGID
  : `/test-api-login`;
export const TMA_LOGIN_URL_EHERKENNING_AFTER_REDIRECT = IS_AP
  ? TMA_LOGIN_URL_EHERKENNING
  : `/test-api1-login`;

export const LOGIN_URL_DIGID = TMA_LOGIN_URL_DIGID;
export const LOGIN_URL_EHERKENNING = TMA_LOGIN_URL_EHERKENNING;

let isCommercialPathMatch =
  window.location.pathname === '/api1/login' ||
  window.location.pathname === '/test-api1-login';

try {
  const commercialUserLastLogin = localStorage.getItem(
    'commercialUserLastLogin'
  );
  if (
    !isCommercialPathMatch &&
    commercialUserLastLogin &&
    sub(new Date(), {
      minutes: 10,
    }) <= new Date(commercialUserLastLogin)
  ) {
    isCommercialPathMatch = true;
  }
  if (isCommercialPathMatch) {
    localStorage.setItem('commercialUserLastLogin', new Date().toISOString());
  } else {
    localStorage.removeItem('commercialUserLastLogin');
  }
} catch (error) {}

const API_BASE_PATH_MODDED = API_BASE_PATH + (isCommercialPathMatch ? '1' : '');

export const BFF_API_BASE_URL = `${API_BASE_PATH_MODDED}/bff`;
export const AUTH_API_URL = `${API_BASE_PATH_MODDED}/auth/check`;
export const BFF_API_HEALTH_URL = `${BFF_API_BASE_URL}/status/health`;
export const LOGOUT_URL = '/logout';

export const BFFApiUrls: Record<string, string> = {
  SERVICES_SAURON: `${BFF_API_BASE_URL}/services/all`,
  SERVICES_SSE: `${BFF_API_BASE_URL}/services/stream`,
  SERVICES_TIPS: `${BFF_API_BASE_URL}/services/tips`,
};

export const ErrorNames: Record<string /* ApiStateKey */, string> = {
  BRP: 'Persoonlijke gegevens, paspoort, ID-kaart + actuele updates',
  CASES: 'Lopende zaken',
  TIPS: 'Tips',
  NOTIFICATIONS: 'Actuele updates',
  WMO: 'Zorg en ondersteuning',
  FOCUS_AANVRAGEN: 'Inkomen en Stadspas + actuele updates',
  FOCUS_TOZO: 'Aanvraag Tozo',
  FOCUS_SPECIFICATIES:
    'Uitkeringsspecificaties en jaaropgaven + actuele updates',
  ERFPACHT: 'Erfpacht',
  AFVAL: 'Afvalgegevens rond uw adres',
  BUURT: 'Mijn buurt',
  BELASTINGEN: 'Belastingen + actuele updates',
  MILIEUZONE: 'Milieuzone + actuele updates',
  HOME: 'Uw locatie op de kaart',
  VERGUNNINGEN: 'Vergunningen + actuele updates',
  ALL: 'Alle gegevens', // indien data helemaal niet opgehaald kan worden
  CMS_CONTENT: 'Uitleg Mijn Amsterdam',
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
            stateKey,
            name,
            error:
              ('message' in apiResponseData ? apiResponseData.message : null) ||
              'Communicatie met api mislukt.',
          };
        })
    : [];
}

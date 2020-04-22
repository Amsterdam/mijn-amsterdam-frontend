import { BFF_API_BASE_URL } from '../../universal/config';
import { isError } from 'util';
import { AppState } from '../AppState';

export const BFFApiUrls: Record<string, string> = {
  SERVICES_SAURON: `${BFF_API_BASE_URL}/services/all`,
  SERVICES_SSE: `${BFF_API_BASE_URL}/services/stream`,
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

import { themaId as inkomenThemaId } from '../../client/pages/Inkomen/Inkomen-thema-config';
import { themaId as profileThemaId } from '../../client/pages/Profile/Profile-thema-config';

export const ThemaIDs = {
  AFIS: 'AFIS',
  AFVAL: 'AFVAL',
  AVG: 'AVG',
  BELASTINGEN: 'BELASTINGEN',
  BEZWAREN: 'BEZWAREN',
  BODEM: 'BODEM',
  BURGERZAKEN: 'BURGERZAKEN',
  BUURT: 'BUURT',
  ERFPACHT: 'ERFPACHT',
  HLI: 'HLI',
  HORECA: 'HORECA',
  KLACHTEN: 'KLACHTEN',
  KREFIA: 'KREFIA',
  MILIEUZONE: 'MILIEUZONE',
  NOTIFICATIONS: 'NOTIFICATIONS',
  OVERTREDINGEN: 'OVERTREDINGEN',
  PARKEREN: 'PARKEREN',
  HOME: 'HOME', // Not really a theme, but used as a fallback
  SEARCH: 'SEARCH',
  SUBSIDIE: 'SUBSIDIE',
  SVWI: 'SVWI',
  TOERISTISCHE_VERHUUR: 'TOERISTISCHE_VERHUUR',
  VAREN: 'VAREN',
  VERGUNNINGEN: 'VERGUNNINGEN',
  ZORG: 'ZORG',
  ...inkomenThemaId,
  ...profileThemaId,
} as const;

export type ThemaID = (typeof ThemaIDs)[keyof typeof ThemaIDs];

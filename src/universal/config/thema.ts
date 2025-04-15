import { SomeOtherString } from '../helpers/types';

/**
 * @deprecated Use the thema ID's  specified in the Thema-config files instead.
 */
export const Themas = {
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
  JEUGD: 'JEUGD',
} as const;

/**
 * @deprecated Use the thema ID's  specified in the Thema-config files instead.
 */
export type ThemaID = (typeof Themas)[keyof typeof Themas] | SomeOtherString;

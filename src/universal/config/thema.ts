import { themaId as profileThemaId } from '../../client/pages/Profile/Profile-thema-config';

export const Themas = {
  ...profileThemaId,
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
  INKOMEN: 'INKOMEN',
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
} as const;

export type ThemaID = (typeof Themas)[keyof typeof Themas];

/**
 * @deprecated
 * Use the new thema config in the client instead.
 */
export const ThemaIDs = {
  BELASTINGEN: 'BELASTINGEN',
  BURGERZAKEN: 'BURGERZAKEN',
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
} as const;
/**
 * @deprecated
 * Use the new thema config in the client instead.
 */
export type ThemaID = (typeof ThemaIDs)[keyof typeof ThemaIDs];

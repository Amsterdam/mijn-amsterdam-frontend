/**
 * @deprecated
 * Use the new thema config in the client instead.
 */
export const ThemaIDs = {
  BELASTINGEN: 'BELASTINGEN',
  MILIEUZONE: 'MILIEUZONE',
  NOTIFICATIONS: 'NOTIFICATIONS',
  OVERTREDINGEN: 'OVERTREDINGEN',
  HOME: 'HOME', // Not really a theme, but used as a fallback
  SEARCH: 'SEARCH',
  SUBSIDIE: 'SUBSIDIE',
  SVWI: 'SVWI',
  VERGUNNINGEN: 'VERGUNNINGEN',
  ZORG: 'ZORG',
} as const;
/**
 * @deprecated
 * Use the new thema config in the client instead.
 */
export type ThemaID = (typeof ThemaIDs)[keyof typeof ThemaIDs];

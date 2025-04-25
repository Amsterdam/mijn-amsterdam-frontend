/**
 * @deprecated
 * Use the new thema config in the client instead.
 */
export const ThemaIDs = {
  NOTIFICATIONS: 'NOTIFICATIONS',
  HOME: 'HOME', // Not really a theme, but used as a fallback
  SEARCH: 'SEARCH',
  SVWI: 'SVWI',
} as const;
/**
 * @deprecated
 * Use the new thema config in the client instead.
 */
export type ThemaID = (typeof ThemaIDs)[keyof typeof ThemaIDs];

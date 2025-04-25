/**
 * @deprecated This file is deprecated. Use the new routes file instead.
 */
export const AppRoutes = {
  ROOT: '/',
  HOME: '/',

  API_LOGIN: '/api/login',
  API1_LOGIN: '/api1/login',
  API2_LOGIN: '/api2/login',
  NOTIFICATIONS: '/overzicht-updates/:page?',
  ACCESSIBILITY: '/toegankelijkheidsverklaring',
  GENERAL_INFO: '/uitleg',

  SEARCH: '/zoeken',

  BFF_500_ERROR: '/server-error-500',

  'KLANT_CONTACT/CONTACTMOMENTEN': '/contactmomenten/:page?',

  ZAAK_STATUS: '/zaak-status',
} as const;

export type RouteKey = keyof typeof AppRoutes;
export type AppRoute = (typeof AppRoutes)[RouteKey];

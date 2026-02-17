import { BffEndpoints } from './bff-routes';
import { routes as amsAppNotificationsRoutes } from '../services/amsapp/notifications/amsapp-notifications-service-config';
import { routes as amsAppStadspasRoutes } from '../services/amsapp/stadspas/amsapp-stadspas-service-config';

// Accessible without authentication

export const PUBLIC_BFF_ENDPOINTS = [
  // External consumer routes
  amsAppStadspasRoutes.public.STADSPAS_AMSAPP_LOGIN,
  amsAppStadspasRoutes.public.STADSPAS_AMSAPP_EXCHANGE_ADMINISTRATIENUMMER,
  amsAppNotificationsRoutes.public.NOTIFICATIONS_CONSUMER_REGISTRATION_LOGIN,
  amsAppNotificationsRoutes.public.NOTIFICATIONS_CONSUMER_REGISTRATION_ACTION,
  amsAppNotificationsRoutes.public.NOTIFICATIONS_CONSUMER_REGISTRATION_STATUS,

  // Internal routes
  BffEndpoints.STATUS_HEALTH,
  BffEndpoints.CMS_MAINTENANCE_NOTIFICATIONS,
  BffEndpoints.CMS_FOOTER,
  BffEndpoints.TELEMETRY_PROXY,
  BffEndpoints.SERVICES_TOGGLES,
] as const;

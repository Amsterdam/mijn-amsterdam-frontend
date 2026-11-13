import { isEnabled } from '../../config/azure-appconfiguration.ts';

export const routes = {
  admin: {
    SERVICE_ALERTS_OVERVIEW: '/service-alerts/overview',
    SERVICE_ALERTS_UPSERT: '/service-alerts/upsert',
  },
};

export const featureToggle = {
  router: {
    admin: {
      isEnabled: isEnabled('SERVICE_ALERTS.router.admin'),
    },
  },
};

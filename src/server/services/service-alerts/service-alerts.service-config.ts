import { isEnabled } from '../../config/azure-appconfiguration.ts';

export const routes = {
  protected: {
    SERVICE_ALERTS_OVERVIEW: '/service-alerts/overview',
  },
  admin: {
    SERVICE_ALERTS_CREATE_ALERT: '/service-alerts/:entryId/create-alert',
    SERVICE_ALERTS_EDIT_ALERT: '/service-alerts/:entryId/edit-alert',
  },
};

export const featureToggle = {
  router: {
    protected: {
      isEnabled: isEnabled('SERVICE_ALERTS.router.protected'),
    },
    admin: {
      isEnabled: isEnabled('SERVICE_ALERTS.router.admin'),
    },
  },
};

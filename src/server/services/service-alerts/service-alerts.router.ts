import { handleIsDBEnabled } from '../../routing/route-handlers.ts';
import { createBFFRouter } from '../../routing/route-helpers.ts';
import {
  handleGetServiceAlerts,
  handleUpsertServiceAlertRequest,
} from './service-alerts.route-handlers.ts';
import { featureToggle, routes } from './service-alerts.service-config.ts';

const serviceAlertsRouterAdmin = createBFFRouter({
  id: 'admin-service-alerts-router',
  isEnabled: featureToggle.router.admin.isEnabled,
});

serviceAlertsRouterAdmin.use(handleIsDBEnabled);

serviceAlertsRouterAdmin.get(
  routes.admin.SERVICE_ALERTS_OVERVIEW,
  handleGetServiceAlerts
);

serviceAlertsRouterAdmin.post(
  routes.admin.SERVICE_ALERTS_UPSERT,
  handleUpsertServiceAlertRequest
);

export const serviceAlertsRouter = {
  admin: serviceAlertsRouterAdmin,
};

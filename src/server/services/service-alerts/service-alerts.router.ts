import { createBFFRouter } from '../../routing/route-helpers.ts';
import { featureToggle } from './service-alerts.service-config.ts';

const serviceAlertsRouterProtected = createBFFRouter({
  id: 'protected-service-alerts-router',
  isEnabled: featureToggle.router.protected.isEnabled,
});

const serviceAlertsRouterAdmin = createBFFRouter({
  id: 'admin-service-alerts-router',
  isEnabled: featureToggle.router.admin.isEnabled,
});

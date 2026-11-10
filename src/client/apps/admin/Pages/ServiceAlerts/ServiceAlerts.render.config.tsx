import type { ApplicationRouteConfig } from '../../../../../universal/types/thema-types.ts';
import { ServiceAlerts } from './ServiceAlerts.tsx';
import { themaConfig } from './ServiceAlerts-thema-config.ts';

export const AdminServiceAlertsRoutes = [
  {
    route: themaConfig.route.path,
    Component: ServiceAlerts,
    isActive: themaConfig.featureToggle.active,
  },
] as const satisfies readonly ApplicationRouteConfig[];

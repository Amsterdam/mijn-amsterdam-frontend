import type { ApplicationRouteConfig } from '../../../../../universal/types/thema-types.ts';
import { ServiceAlerts, ServiceAlertToevoegen } from './ServiceAlerts.tsx';
import {
  routePathToevoegen,
  themaConfig,
} from './ServiceAlerts-thema-config.ts';

export const AdminServiceAlertsRoutes = [
  {
    route: themaConfig.route.path,
    Component: ServiceAlerts,
    isActive: themaConfig.featureToggle.active,
  },
  {
    route: routePathToevoegen,
    Component: ServiceAlertToevoegen,
    isActive: themaConfig.featureToggle.active,
  },
] as const satisfies readonly ApplicationRouteConfig[];

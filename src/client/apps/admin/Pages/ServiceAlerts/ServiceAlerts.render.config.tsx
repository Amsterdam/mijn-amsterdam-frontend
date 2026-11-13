import type { ApplicationRouteConfig } from '../../../../../universal/types/thema-types.ts';
import {
  ServiceAlertDetail,
  ServiceAlerts,
  ServiceAlertToevoegen,
} from './ServiceAlerts.tsx';
import {
  routePathDetail,
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
  {
    route: routePathDetail,
    Component: ServiceAlertDetail,
    isActive: themaConfig.featureToggle.active,
  },
] as const satisfies readonly ApplicationRouteConfig[];

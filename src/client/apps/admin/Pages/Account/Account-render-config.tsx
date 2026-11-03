import type { ApplicationRouteConfig } from '../../../../../universal/types/thema-types.ts';
import { Account } from './Account.tsx';
import { themaConfig } from './Account-thema-config.ts';

export const AdminAccountRoutes = [
  {
    route: themaConfig.route.path,
    Component: Account,
    isActive: themaConfig.featureToggle.active,
  },
] as const satisfies readonly ApplicationRouteConfig[];

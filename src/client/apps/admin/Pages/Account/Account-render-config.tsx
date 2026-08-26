import { themaConfig } from './Account-thema-config.ts';
import { Account } from './Account.tsx';
import type { ApplicationRouteConfig } from '../../../../../universal/types/App.types.ts';

export const AdminAccountRoutes = [
  {
    route: themaConfig.route.path,
    Component: Account,
    isActive: themaConfig.featureToggle.active,
  },
] as const satisfies readonly ApplicationRouteConfig[];

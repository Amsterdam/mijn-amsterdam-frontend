import { themaConfig } from './UserFeedback-thema-config.ts';
import { UserFeedback } from './UserFeedback.tsx';
import type { ApplicationRouteConfig } from '../../../../../universal/types/App.types.ts';

export const AdminUserFeedbackRoutes = [
  {
    route: themaConfig.route.path,
    Component: UserFeedback,
    isActive: themaConfig.featureToggle.active,
  },
] as const satisfies readonly ApplicationRouteConfig[];

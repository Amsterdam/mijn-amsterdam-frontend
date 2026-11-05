import type { ApplicationRouteConfig } from '../../../../../universal/types/thema-types.ts';
import { UserFeedback } from './UserFeedback.tsx';
import { themaConfig } from './UserFeedback-thema-config.ts';

export const AdminUserFeedbackRoutes = [
  {
    route: themaConfig.route.path,
    Component: UserFeedback,
    isActive: themaConfig.featureToggle.active,
  },
] as const satisfies readonly ApplicationRouteConfig[];

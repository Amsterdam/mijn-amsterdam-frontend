import { themaConfig } from './Home-thema-config.ts';
import { Home, HomePublic } from './Home.tsx';
import type { ApplicationRouteConfig } from '../../../../../universal/types/thema-types.ts';

export const AdminHomeRoutes = [
  {
    route: themaConfig.route.path,
    Component: Home,
    isActive: themaConfig.featureToggle.active,
    public: false,
    props: {
      index: true,
    },
  },
  {
    route: '/',
    Component: HomePublic,
    isActive: themaConfig.featureToggle.active,
    public: true,
  },
] as const satisfies readonly ApplicationRouteConfig[];

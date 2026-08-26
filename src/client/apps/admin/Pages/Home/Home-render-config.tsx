import { themaConfig } from './Home-thema-config.ts';
import { Home, HomePublic } from './Home.tsx';
import type { ApplicationRouteConfig } from '../../../../../universal/types/thema-types.ts';

export const AdminHomeRoutes = [
  {
    route: themaConfig.route.path,
    Component: Home,
    isActive: themaConfig.featureToggle.active,
    public: false,
    private: true,
    props: {
      index: true,
    },
  },
  {
    route: '/',
    Component: HomePublic,
    isActive: themaConfig.featureToggle.active,
    public: true,
    private: false,
    props: {
      index: true,
    },
  },
] as const satisfies readonly ApplicationRouteConfig[];

import { matchPath } from 'react-router';

import { AdminAccountRoutes } from './Pages/Account/Account-render-config.tsx';
import { AdminHomeRoutes } from './Pages/Home/Home-render-config.tsx';
import { AdminUserFeedbackRoutes } from './Pages/UserFeedback/UserFeedback-render-config.tsx';
import type { ApplicationRouteConfig } from '../../../universal/types/App.types.ts';
import { ApplicationRoutes } from '../../components/ApplicationRoutes/ApplicationRoutes.tsx';

const routeComponents: ApplicationRouteConfig[] = [
  AdminHomeRoutes,
  AdminAccountRoutes,
  AdminUserFeedbackRoutes,
].flat();

export const privateRoutes = routeComponents.filter(
  (config) => config.private !== false
);

const publicRoutes = routeComponents.filter((config) => config.public === true);

export function PrivateRoutes() {
  return <ApplicationRoutes routes={privateRoutes} />;
}

export function PublicRoutes() {
  return <ApplicationRoutes routes={publicRoutes} />;
}

export function isPrivateRoute(pathname: string) {
  return privateRoutes.some(({ route }) => {
    const isMatched = !!matchPath(route, pathname);
    return isMatched;
  });
}

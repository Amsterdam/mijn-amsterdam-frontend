import { matchPath } from 'react-router';

import type { ApplicationRouteConfig } from '../../../universal/types/thema-types.ts';
import { ApplicationRoutes } from '../../components/ApplicationRoutes/ApplicationRoutes.tsx';

const routeComponents: ApplicationRouteConfig[] = [].flat();

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

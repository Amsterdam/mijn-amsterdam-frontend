import { Route, Routes } from 'react-router';

import type { ApplicationRouteConfig } from '../../../universal/types/App.types.ts';

export function ApplicationRoutes({
  routes,
}: {
  routes: ApplicationRouteConfig[];
}) {
  return (
    <Routes>
      {routes
        .filter(({ isActive }) => isActive !== false)
        .map(({ route, Component, props }) => (
          <Route
            {...(props ? props : {})}
            key={route}
            path={route}
            element={<Component />}
          />
        ))}
    </Routes>
  );
}

import { Route, Routes } from 'react-router';

import type { ApplicationRouteConfig } from '../../../universal/types/thema-types.ts';

export function ApplicationRoutes({
  routes,
}: {
  routes: ApplicationRouteConfig[];
}) {
  return (
    <Routes>
      {routes
        .filter(({ isActive }) => isActive !== false)
        .map(({ route, Component, props }) => {
          const props_ = props ? props : {};
          const pathProps = {} as { path?: string };
          if (!props_.index) {
            pathProps.path = route;
          }
          return (
            <Route
              {...props_}
              {...pathProps}
              key={route}
              element={<Component />}
            />
          );
        })}
    </Routes>
  );
}

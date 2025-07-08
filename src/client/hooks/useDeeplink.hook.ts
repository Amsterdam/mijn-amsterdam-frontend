import { useEffect } from 'react';

import { useLocation } from 'react-router';

import { removeLocalStorageKey, useLocalStorage } from './storage.hook.ts';
import { isPrivateRoute } from '../App.routes.tsx';
import { dashboardMenuItem } from '../pages/Dashboard/Dashboard-routes.ts';

export const ROUTE_ENTRY_KEY = 'RouteEntry';

export function useSetDeeplinkEntry(excludeQueryParams: string[] = []) {
  const location = useLocation();
  const [routeEntry, setRouteEntry] = useLocalStorage(ROUTE_ENTRY_KEY, '');

  useEffect(() => {
    if (
      (!routeEntry || routeEntry === '/') &&
      location.pathname !== '/' &&
      isPrivateRoute(location.pathname)
    ) {
      let search = location.search;
      if (excludeQueryParams) {
        const params = new URLSearchParams(location.search);
        excludeQueryParams.forEach((name) => {
          params.delete(name);
        });
        search = `?${params.toString()}`;
      }
      setRouteEntry(location.pathname + search);
    }
  }, [location.pathname, routeEntry, setRouteEntry]);
}

export function useDeeplinkRedirect() {
  const [routeEntry] = useLocalStorage(ROUTE_ENTRY_KEY, '');
  const redirectAfterLogin = routeEntry || dashboardMenuItem.to;

  return redirectAfterLogin;
}

export function clearDeeplinkEntry() {
  removeLocalStorageKey(ROUTE_ENTRY_KEY);
}

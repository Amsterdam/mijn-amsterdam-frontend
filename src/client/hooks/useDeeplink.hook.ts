import { useEffect } from 'react';

import { useLocation } from 'react-router';

import { removeLocalStorageKey, useLocalStorage } from './storage.hook';
import { isPrivateRoute } from '../App.routes';
import { BffErrorRoutes } from '../pages/BffError/BffError-routes';
import { dashboardMenuItem } from '../pages/Dashboard/Dashboard-routes';

export const ROUTE_ENTRY_KEY = 'RouteEntry';

export function useSetDeeplinkEntry(excludeQueryParams: string[] = []) {
  const location = useLocation();
  const [routeEntry, setRouteEntry] = useLocalStorage(ROUTE_ENTRY_KEY, '');

  useEffect(() => {
    const doNotSetDeeplinkForPaths = [
      '/',
      ...BffErrorRoutes.map(({ route }) => route),
    ];
    if (
      (!routeEntry || routeEntry === '/') &&
      !doNotSetDeeplinkForPaths.includes(location.pathname) &&
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

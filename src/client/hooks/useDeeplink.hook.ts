import { useLocation } from 'react-router-dom';

import { removeLocalStorageKey, useLocalStorage } from './storage.hook';
import { AppRoutes } from '../../universal/config/routes';
import { isPrivateRoute } from '../config/routes';

export const ROUTE_ENTRY_KEY = 'RouteEntry';

export function useSetDeeplinkEntry(excludeQueryParams: string[] = []) {
  const location = useLocation();
  const [routeEntry, setRouteEntry] = useLocalStorage(ROUTE_ENTRY_KEY, '');

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
}

export function useDeeplinkRedirect() {
  const [routeEntry] = useLocalStorage(ROUTE_ENTRY_KEY, '');
  const redirectAfterLogin = routeEntry || AppRoutes.HOME;

  clearDeeplinkEntry();

  return redirectAfterLogin;
}

export function clearDeeplinkEntry() {
  removeLocalStorageKey(ROUTE_ENTRY_KEY);
}

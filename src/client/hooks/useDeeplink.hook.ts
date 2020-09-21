import { useLocation } from 'react-router-dom';
import { useLocalStorage, removeLocalStorageKey } from './storage.hook';
import { isPrivateRoute } from '../../universal/helpers';
import { AppRoutes } from '../../universal/config';
import { useEffect } from 'react';

export const ROUTE_ENTRY_KEY = 'RouteEntry';

export function useDeeplinkEntry() {
  const location = useLocation();
  const [routeEntry, setRouteEntry] = useLocalStorage(ROUTE_ENTRY_KEY, '');

  if (
    (!routeEntry || routeEntry === '/') &&
    location.pathname !== '/' &&
    isPrivateRoute(location.pathname)
  ) {
    setRouteEntry(location.pathname);
  }
}

export function useDeeplinkRedirect() {
  const [routeEntry, setRouteEntry] = useLocalStorage(ROUTE_ENTRY_KEY, '');
  const redirectAfterLogin = routeEntry || AppRoutes.ROOT;

  useEffect(() => {
    if (routeEntry) {
      setRouteEntry('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return redirectAfterLogin;
}

export function clearDeeplinkEntry() {
  removeLocalStorageKey(ROUTE_ENTRY_KEY);
}

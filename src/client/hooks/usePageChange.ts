import { useEffect } from 'react';
import { matchPath } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { CustomTrackingUrls } from '../../universal/config';
import { TMA_LOGIN_URL_DIGID, TMA_LOGIN_URL_EHERKENNING } from '../config/api';
import { PageTitleMain, PageTitles } from '../config/pages';
import { trackPageView } from './analytics.hook';
import { AppRoutes } from '../../universal/config/routing';
import { useTermReplacement } from './useTermReplacement';

const ExcludePageViewTrackingUrls = [
  TMA_LOGIN_URL_DIGID,
  TMA_LOGIN_URL_EHERKENNING,
];

const sortedPageTitleRoutes = Object.keys(PageTitles).sort((a, b) => {
  if (a.length === b.length) {
    return 0;
  }
  return a.length < b.length ? 1 : -1;
});

export function usePageChange() {
  const location = useLocation();
  const termReplace = useTermReplacement();

  useEffect(() => {
    // Scroll to top on route change
    // window.scrollTo(0, 0);

    // Change Page title on route change
    const index = sortedPageTitleRoutes.findIndex(route => {
      return (
        location.pathname === route ||
        !!matchPath(location.pathname, {
          path: route,
          exact: true,
          strict: false,
        })
      );
    });

    const route = sortedPageTitleRoutes[index];

    const title =
      index !== -1
        ? PageTitles[route]
          ? PageTitles[route]
          : PageTitleMain
        : !Object.values(AppRoutes).find(
            route =>
              !!matchPath(location.pathname, {
                path: route,
                exact: true,
                strict: false,
              })
          )
        ? 'Pagina niet gevonden'
        : PageTitleMain;

    document.title = title;

    if (!ExcludePageViewTrackingUrls.includes(location.pathname)) {
      const title = DocumentTitles[route]
        ? DocumentTitles[route]
        : `[undefined] ${location.pathname}`;
      trackPageView(
        termReplace(title),
        CustomTrackingUrls[location.pathname] || location.pathname
      );
    }
  }, [location.pathname]);
}

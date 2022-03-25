import { useEffect } from 'react';
import { matchPath, useLocation } from 'react-router-dom';
import {
  CustomTrackingUrls,
  DocumentTitles,
  IS_AP,
  PageTitleMain,
} from '../../universal/config';
import { AppRoutes } from '../../universal/config';
import { LOGIN_URL_DIGID, LOGIN_URL_EHERKENNING } from '../config/api';
import { trackPageViewWithProfileType } from './analytics.hook';
import { useProfileTypeValue } from './useProfileType';
import { useTermReplacement } from './useTermReplacement';

const ExcludePageViewTrackingUrls = [LOGIN_URL_DIGID, LOGIN_URL_EHERKENNING];

const sortedPageTitleRoutes = Object.keys(DocumentTitles).sort((a, b) => {
  if (a.length === b.length) {
    return 0;
  }
  return a.length < b.length ? 1 : -1;
});

const NOT_FOUND_TITLE = 'Pagina niet gevonden';

export function usePageChange() {
  const location = useLocation();
  const termReplace = useTermReplacement();
  const profileType = useProfileTypeValue();

  useEffect(() => {
    // Scroll to top on route change
    window.scrollTo(0, 0);

    // Change Page title on route change
    const index = sortedPageTitleRoutes.findIndex((route) => {
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
        ? DocumentTitles[route]
          ? DocumentTitles[route]
          : PageTitleMain
        : !Object.values(AppRoutes).find(
            (route) =>
              !!matchPath(location.pathname, {
                path: route,
                exact: true,
                strict: false,
              })
          )
        ? NOT_FOUND_TITLE
        : PageTitleMain;

    const isPageFound = title !== NOT_FOUND_TITLE;

    document.title = title;

    if (!ExcludePageViewTrackingUrls.includes(location.pathname)) {
      const title = DocumentTitles[route]
        ? DocumentTitles[route]
        : `[undefined] ${location.pathname}`;
      if (!IS_AP && title.startsWith('[undefined]')) {
        console.info(
          'Unknown page title encountered for path',
          location.pathname
        );
      }

      if (isPageFound) {
        trackPageViewWithProfileType(
          termReplace(title),
          CustomTrackingUrls[location.pathname] || location.pathname,
          profileType
        );
      }
    }
  }, [location.pathname, termReplace, profileType]);
}

import { useEffect } from 'react';
import { matchPath, useLocation } from 'react-router-dom';
import {
  CustomTrackingUrls,
  DocumentTitles,
  IS_AP,
  PageTitleMain,
} from '../../universal/config';
import { AppRoutes } from '../../universal/config';
import { Match } from '../../universal/types';
import { LOGIN_URL_DIGID, LOGIN_URL_EHERKENNING } from '../config/api';
import { trackPageViewWithCustomDimension } from './analytics.hook';
import { useProfileTypeValue } from './useProfileType';
import { useTermReplacement } from './useTermReplacement';
import { useUserCity } from './useUserCity';

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
  const userCity = useUserCity();

  useEffect(() => {
    // Scroll to top on route change
    window.scrollTo(0, 0);

    if (userCity === undefined) {
      return;
    }

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
        console.log(
          'getCustomTrackingUrl',
          getCustomTrackingUrl(location.pathname)
        );

        trackPageViewWithCustomDimension(
          termReplace(title),
          getCustomTrackingUrl(location.pathname),
          profileType,
          userCity
        );
      }
    }
  }, [location.pathname, termReplace, profileType, userCity]);
}

function getCustomTrackingUrl(pathname: string) {
  const route = Object.keys(CustomTrackingUrls).find((r) => {
    return matchPath(pathname, r);
  });

  if (route) {
    const matchResult = matchPath(pathname, route);

    if (!matchResult || !matchResult.isExact) {
      return pathname;
    }

    return CustomTrackingUrls[route](matchResult);
  }

  return pathname;
}

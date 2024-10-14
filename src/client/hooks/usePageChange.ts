import { useEffect, useRef } from 'react';

import { matchPath, useHistory, useLocation } from 'react-router-dom';

import { trackPageViewWithCustomDimension } from './analytics.hook';
import { useProfileTypeValue } from './useProfileType';
import { useTermReplacement } from './useTermReplacement';
import { useUserCity } from './useUserCity';
import { AppRoute, AppRoutes } from '../../universal/config/routes';
import { ExcludePageViewTrackingUrls } from '../config/api';
import { CustomTrackingUrls, TrackingConfig } from '../config/routes';
import {
  DocumentTitles,
  NOT_FOUND_TITLE,
  PageTitleMain,
} from '../config/thema';
import { captureMessage } from '../utils/monitoring';

const sortedPageTitleRoutes = Object.keys(DocumentTitles).sort((a, b) => {
  if (a.length === b.length) {
    return 0;
  }
  return a.length < b.length ? 1 : -1;
}) as AppRoute[];

export function usePageChange(isAuthenticated: boolean) {
  const location = useLocation();
  const history = useHistory();
  const termReplace = useTermReplacement();
  const profileType = useProfileTypeValue();
  const userCity = useUserCity();
  const prevPathRef = useRef(location.pathname);

  useEffect(() => {
    const isNewPageNavigation = prevPathRef.current !== location.pathname;
    if (isNewPageNavigation) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    } else {
      history.scrollRestoration = 'auto';
    }

    prevPathRef.current = location.pathname;

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

    const hasPageTitleAssigned = index !== -1;
    const tackingConfig: TrackingConfig = {
      profileType,
      isAuthenticated,
    };
    const route = sortedPageTitleRoutes[index];

    let assignedDocumentTitle = DocumentTitles[route];

    if (typeof assignedDocumentTitle === 'function') {
      assignedDocumentTitle = assignedDocumentTitle(tackingConfig);
    }

    // Set a document title, even if we haven't found one assigned to the current route.
    let documentTitle = PageTitleMain;

    if (hasPageTitleAssigned) {
      documentTitle = assignedDocumentTitle;
    }

    const isAppRouteKnown = Object.values(AppRoutes).find(
      (route) =>
        !!matchPath(location.pathname, {
          path: route,
          exact: true,
          strict: false,
        })
    );

    if (!isAppRouteKnown) {
      documentTitle = NOT_FOUND_TITLE;
    }

    document.title = termReplace(documentTitle);

    const isExcludedFromPageTracking = ExcludePageViewTrackingUrls.includes(
      location.pathname
    );

    if (!isExcludedFromPageTracking) {
      const trackingTitle = assignedDocumentTitle
        ? assignedDocumentTitle
        : `[undefined] ${location.pathname}`;

      if (trackingTitle.startsWith('[undefined]')) {
        captureMessage(
          `Unknown page title encountered for path ${location.pathname}`
        );
      }

      if (documentTitle !== NOT_FOUND_TITLE) {
        const url =
          getCustomTrackingUrl(location.pathname, tackingConfig) +
          (location.search ?? '');
        trackPageViewWithCustomDimension(
          termReplace(trackingTitle),
          url,
          profileType,
          userCity
        );
      }
    }
  }, [
    location.pathname,
    location.search,
    termReplace,
    profileType,
    userCity,
    isAuthenticated,
    history.action,
  ]);
}

function getCustomTrackingUrl(
  pathname: string,
  trackingConfig: TrackingConfig
) {
  const customTrackingUrlKeys = Object.keys(CustomTrackingUrls) as AppRoute[];
  const route = customTrackingUrlKeys.find((r) => {
    return matchPath(pathname, r);
  });

  if (route) {
    const matchResult = matchPath(pathname, route);
    const trackingUrlFn = CustomTrackingUrls[route];

    if (!matchResult || !matchResult.isExact || !trackingUrlFn) {
      return pathname;
    }

    return trackingUrlFn(matchResult, trackingConfig);
  }

  return pathname;
}

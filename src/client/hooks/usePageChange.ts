import { useEffect } from 'react';
import { matchPath, useLocation } from 'react-router-dom';
import {
  CustomTrackingUrls,
  DocumentTitles,
  ExcludePageViewTrackingUrls,
  NOT_FOUND_TITLE,
  PageTitleMain,
  TrackingConfig,
} from '../../universal/config';
import { AppRoutes } from '../../universal/config';
import { trackPageViewWithCustomDimension } from './analytics.hook';
import { useProfileTypeValue } from './useProfileType';
import { useTermReplacement } from './useTermReplacement';
import { useUserCity } from './useUserCity';
import * as Sentry from '@sentry/react';

const sortedPageTitleRoutes = Object.keys(DocumentTitles).sort((a, b) => {
  if (a.length === b.length) {
    return 0;
  }
  return a.length < b.length ? 1 : -1;
});

export function usePageChange(isAuthenticated: boolean) {
  const location = useLocation();
  const termReplace = useTermReplacement();
  const profileType = useProfileTypeValue();
  const userCity = useUserCity();

  useEffect(() => {
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
        Sentry.captureMessage(
          `Unknown page title encountered for path ${location.pathname}`
        );
      }

      if (documentTitle !== NOT_FOUND_TITLE) {
        trackPageViewWithCustomDimension(
          termReplace(trackingTitle),
          getCustomTrackingUrl(location.pathname, tackingConfig) +
            location.search,
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
  ]);
}

function getCustomTrackingUrl(
  pathname: string,
  trackingConfig: TrackingConfig
) {
  const route = Object.keys(CustomTrackingUrls).find((r) => {
    return matchPath(pathname, r);
  });

  if (route) {
    const matchResult = matchPath(pathname, route);

    if (!matchResult || !matchResult.isExact) {
      return pathname;
    }

    return CustomTrackingUrls[route](matchResult, trackingConfig);
  }

  return pathname;
}

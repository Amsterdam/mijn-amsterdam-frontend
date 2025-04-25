import { useEffect, useRef } from 'react';

import { matchPath, useLocation } from 'react-router';

import { trackPageViewWithCustomDimension } from './analytics.hook';
import { useProfileTypeValue } from './useProfileType';
import { useTermReplacement } from './useTermReplacement';
import { useUserCity } from './useUserCity';
import { AppRoute, AppRoutes } from '../../universal/config/routes';
import { ExcludePageViewTrackingUrls } from '../config/api';
import {
  DocumentTitles,
  NOT_FOUND_TITLE,
  PageTitleMain,
} from '../config/thema';
import { captureMessage } from '../helpers/monitoring';

const sortedPageTitleRoutes = Object.keys(DocumentTitles).sort((a, b) => {
  if (a.length === b.length) {
    return 0;
  }
  return a.length < b.length ? 1 : -1;
}) as AppRoute[];

export function usePageChange(isAuthenticated: boolean) {
  const location = useLocation();
  const termReplace = useTermReplacement();
  const profileType = useProfileTypeValue();
  const userCity = useUserCity();
  const prevPathRef = useRef(location.pathname);

  useEffect(() => {
    const isNewPageNavigation = prevPathRef.current !== location.pathname;
    if (isNewPageNavigation) {
      const offsetTop =
        document.getElementById('skip-to-id-AppContent')?.offsetTop ?? 0;
      if (window.scrollY > offsetTop) {
        window.scrollTo({ top: offsetTop, behavior: 'instant' });
      }
    }
    prevPathRef.current = location.pathname;
  }, [location.pathname]);

  useEffect(() => {
    // Change Page title on route change
    const index = sortedPageTitleRoutes.findIndex((route) => {
      return (
        location.pathname === route || !!matchPath(route, location.pathname)
      );
    });

    const hasPageTitleAssigned = index !== -1;
    const route = sortedPageTitleRoutes[index];

    let assignedDocumentTitle = DocumentTitles[route];

    if (typeof assignedDocumentTitle === 'function') {
      assignedDocumentTitle = assignedDocumentTitle(
        matchPath(route, location.pathname)?.params ?? null
      );
    }

    // Set a document title, even if we haven't found one assigned to the current route.
    let documentTitle = PageTitleMain;

    if (hasPageTitleAssigned) {
      documentTitle = assignedDocumentTitle;
    }

    const isAppRouteKnown = !hasPageTitleAssigned
      ? Object.values(AppRoutes).find(
          (route) => !!matchPath(route, location.pathname)
        )
      : true;

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
          getCustomTrackingUrl(location.pathname) + (location.search ?? '');
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
  ]);
}

// TODO: Implement, integratie with thema route configs
const CustomTrackingUrls: Record<string, any> = {};

export function getCustomTrackingUrl(pathname: string) {
  const customTrackingUrlKeys = Object.keys(CustomTrackingUrls) as AppRoute[];
  const route = customTrackingUrlKeys.find((r) => {
    return matchPath(pathname, r);
  });

  if (route) {
    const matchResult = matchPath(pathname, route);
    const trackingUrlFn = CustomTrackingUrls[route];

    if (!matchResult || !trackingUrlFn) {
      return pathname;
    }

    return trackingUrlFn(matchResult);
  }

  return pathname;
}

import {
  AppRoutes,
  CustomTrackingUrls,
  PageTitleMain,
  PageTitles,
} from '../../universal/config';

import { matchPath } from 'react-router-dom';
import { trackPageView } from './analytics.hook';
import { useEffect } from 'react';
import useRouter from 'use-react-router';

const ExcludePageViewTrackingUrls = [AppRoutes.API_LOGIN];

const sortedPageTitleRoutes = Object.keys(PageTitles).sort((a, b) => {
  if (a.length === b.length) {
    return 0;
  }
  return a.length < b.length ? 1 : -1;
});

export function usePageChange() {
  const { location } = useRouter();

  useEffect(() => {
    // Scroll to top on route change
    window.scrollTo(0, 0);

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

    const title = index !== -1 ? PageTitles[route] : PageTitleMain;

    document.title = title;

    if (!ExcludePageViewTrackingUrls.includes(location.pathname)) {
      trackPageView(
        title,
        CustomTrackingUrls[location.pathname] || location.pathname
      );
    }
  }, [location.pathname]);
}

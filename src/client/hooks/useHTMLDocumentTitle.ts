import { useEffect } from 'react';

import { useLocation, useParams } from 'react-router';

import { trackPageView } from './analytics.hook';
import type { ThemaRouteConfig } from '../config/thema-types';

export function useHTMLDocumentTitle(
  routeConfig: Pick<ThemaRouteConfig, 'documentTitle' | 'trackingUrl'>
) {
  const params = useParams();
  const location = useLocation();
  const { documentTitle, trackingUrl } = routeConfig;
  useEffect(() => {
    document.title =
      typeof documentTitle === 'function'
        ? documentTitle(params)
        : documentTitle;
    const path =
      typeof trackingUrl === 'function'
        ? trackingUrl(params)
        : (trackingUrl ?? location.pathname);
    trackPageView(path);
  }, [documentTitle]);
}

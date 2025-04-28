import { useEffect } from 'react';

import { useParams } from 'react-router';

import type { ThemaRouteConfig } from '../config/thema-types';

export function useHTMLDocumentTitle(title: ThemaRouteConfig['documentTitle']) {
  const params = useParams();
  useEffect(() => {
    document.title = typeof title === 'function' ? title(params) : title;
  }, [title]);
}

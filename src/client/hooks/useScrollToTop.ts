import { useEffect } from 'react';

import { useLocation } from 'react-router';

export function useScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    globalThis.scrollTo(0, 0);
  }, [pathname]);
}

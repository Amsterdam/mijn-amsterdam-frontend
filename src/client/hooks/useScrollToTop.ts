import { useEffect } from 'react';

import { useLocation } from 'react-router';

export function useScrollToTop() {
  const { pathname } = useLocation();

  // biome-ignore lint/correctness/useExhaustiveDependencies: Scroll to top on pathname changes.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
}

import { useEffect } from 'react';

import { useLocation } from 'react-router';

export function useScrollToTop() {
  useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
}

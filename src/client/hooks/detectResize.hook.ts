import { useCallback, useEffect, useState } from 'react';

import { debounce } from 'throttle-debounce';
const DEBOUNCE_MS = 400;
export function useDetectResizing(debounceMS: number = DEBOUNCE_MS) {
  const [isResizing, setResizing] = useState(false);

  const debounceResize = debounce(debounceMS, () => {
    setResizing(false);
  });

  const startResize = useCallback(() => {
    if (isResizing !== true) {
      setResizing(true);
    }
  }, [isResizing]);

  useEffect(() => {
    window.addEventListener('resize', startResize);
    window.addEventListener('resize', debounceResize);

    return () => {
      window.removeEventListener('resize', debounceResize);
      window.removeEventListener('resize', startResize);
    };
  }, [startResize, debounceResize]);

  return isResizing;
}
